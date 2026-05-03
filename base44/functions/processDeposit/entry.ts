/**
 * processDeposit — Add funds to a user's wallet
 * 
 * Payload:
 *   amount: number (USD)
 *   method: "ach" | "wire" | "instant" | "crypto"
 *   currency_code: "USD" | "PHP" (default: "USD")
 *   reference?: string
 * 
 * Returns: { success, wallet, transaction }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DAILY_DEPOSIT_LIMIT = 25000; // USD per calendar day

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount, method = 'ach', currency_code = 'USD', reference } = await req.json();

  // Validate
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return Response.json({ error: 'Invalid amount. Must be a positive number.' }, { status: 400 });
  }
  if (amount > 50000) {
    return Response.json({ error: 'Deposit limit is $50,000 per transaction. Contact support for higher limits.' }, { status: 400 });
  }
  const validMethods = ['ach', 'wire', 'instant', 'crypto'];
  if (!validMethods.includes(method)) {
    return Response.json({ error: 'Invalid deposit method.' }, { status: 400 });
  }

  // ── Daily deposit cap ──
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayDeposits = await base44.asServiceRole.entities.Transfer.filter({ category: 'deposit' });
  const userTodayDeposits = todayDeposits.filter(t =>
    t.created_by === user.email &&
    new Date(t.created_date) >= todayStart
  );
  const todayTotal = userTodayDeposits.reduce((s, t) => s + (t.amount_usd || 0), 0);
  if (todayTotal + amount > DAILY_DEPOSIT_LIMIT) {
    const remaining = Math.max(DAILY_DEPOSIT_LIMIT - todayTotal, 0);
    return Response.json({
      error: `Daily deposit limit reached ($${DAILY_DEPOSIT_LIMIT.toLocaleString()}/day). You can deposit up to $${remaining.toFixed(2)} more today.`,
      daily_limit_exceeded: true,
      remaining_today: remaining,
    }, { status: 400 });
  }

  // Fee calculation
  const feeRate = method === 'instant' ? 0.015 : 0;
  const fee = parseFloat((amount * feeRate).toFixed(2));
  const netAmount = parseFloat((amount - fee).toFixed(2));

  const status = 'completed'; // all instant for demo

  // Find or create wallet
  const wallets = await base44.asServiceRole.entities.WalletBalance.filter({ currency_code });
  const userWallets = wallets.filter(w => w.created_by === user.email);

  let wallet;
  if (userWallets.length === 0) {
    wallet = await base44.asServiceRole.entities.WalletBalance.create({
      currency_code,
      currency_name: currency_code === 'USD' ? 'US Dollar' : 'Philippine Peso',
      flag: currency_code === 'USD' ? '🇺🇸' : '🇵🇭',
      balance: netAmount,
      yield_pct: currency_code === 'USD' ? '4.5%' : '2.1%',
    });
  } else {
    wallet = userWallets[0];
    const newBalance = parseFloat(((wallet.balance || 0) + netAmount).toFixed(2));
    wallet = await base44.asServiceRole.entities.WalletBalance.update(wallet.id, { balance: newBalance });
  }

  // Record the deposit as a Transfer (inbound)
  const transaction = await base44.asServiceRole.entities.Transfer.create({
    amount_usd: netAmount,
    recipient_name: 'Deposit',
    recipient_bank: method.toUpperCase(),
    status,
    fee,
    category: 'deposit',
    note: `${method.charAt(0).toUpperCase() + method.slice(1)} deposit`,
    reference_id: reference || `DEP-${Date.now()}`,
  });

  return Response.json({
    success: true,
    wallet,
    transaction,
    fee,
    net_amount: netAmount,
    message: `$${netAmount.toFixed(2)} added to your ${currency_code} wallet.`,
  });
});