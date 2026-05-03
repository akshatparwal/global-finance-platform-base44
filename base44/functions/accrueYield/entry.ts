/**
 * accrueYield — Scheduled daily job: credit yield to all active USD wallets
 * 
 * Runs once per day (via automation).
 * Protected by shared secret when called externally; passes through for scheduler (no user).
 * 
 * Logic: For each USD wallet with a yield_pct, compute 1 day of compound interest
 * and add it to the balance. Records a YieldCredit transfer for audit.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHEDULER_SECRET = Deno.env.get('SCHEDULER_SECRET') || '';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me().catch(() => null);

  if (user) {
    // Called by a logged-in user — must be admin
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else {
    // No user context — validate shared secret to allow scheduler/webhook calls
    // If SCHEDULER_SECRET is set, require it; otherwise allow (development mode)
    if (SCHEDULER_SECRET) {
      const providedSecret = req.headers.get('x-scheduler-secret') || '';
      if (providedSecret !== SCHEDULER_SECRET) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  const wallets = await base44.asServiceRole.entities.WalletBalance.list();

  let credited = 0;
  const results = [];

  for (const wallet of wallets) {
    // Only accrue yield on USD wallets
    if (wallet.currency_code !== 'USD') continue;
    if (!wallet.balance || wallet.balance <= 0) continue;
    if (!wallet.yield_pct) continue;

    // Parse APY from string like "4.5%"
    const apy = parseFloat(wallet.yield_pct.replace('%', ''));
    if (!apy || apy <= 0) continue;

    // Daily rate from APY: (1 + APY)^(1/365) - 1
    const dailyRate = Math.pow(1 + apy / 100, 1 / 365) - 1;
    const yieldAmount = parseFloat((wallet.balance * dailyRate).toFixed(6));

    if (yieldAmount < 0.000001) continue;

    const newBalance = parseFloat((wallet.balance + yieldAmount).toFixed(6));

    await base44.asServiceRole.entities.WalletBalance.update(wallet.id, {
      balance: newBalance,
    });

    // Audit record
    await base44.asServiceRole.entities.Transfer.create({
      amount_usd: yieldAmount,
      recipient_name: 'Yield Credit',
      recipient_bank: 'KinnectFi Vault',
      status: 'completed',
      rate: 1,
      fee: 0,
      category: 'yield',
      note: `Daily ${apy}% APY yield on $${wallet.balance.toFixed(2)} ${wallet.currency_code}`,
      reference_id: `YLD-${wallet.id.slice(0,6)}-${Date.now().toString(36).toUpperCase()}`,
    });

    results.push({ wallet_id: wallet.id, currency: wallet.currency_code, yield_credited: yieldAmount });
    credited++;
  }

  return Response.json({
    success: true,
    wallets_credited: credited,
    date: new Date().toISOString().slice(0, 10),
    results,
  });
});