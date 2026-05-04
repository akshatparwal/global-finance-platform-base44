/**
 * processScheduledTransfers — Run all due scheduled transfers
 * 
 * Called daily by automation. Checks each active ScheduledTransfer,
 * determines if it's due today, and executes it via processTransfer logic.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me().catch(() => null);
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const today = new Date();
  const dayOfMonth = today.getDate();
  const dayOfWeek = today.getDay(); // 0=Sun

  const scheduled = await base44.asServiceRole.entities.ScheduledTransfer.filter({ is_active: true });

  let executed = 0;
  let skipped = 0;
  const results = [];

  const todayDateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  for (const s of scheduled) {
    let isDue = false;

    if (s.frequency === 'monthly') {
      isDue = s.day_of_month && dayOfMonth === s.day_of_month;
    } else if (s.frequency === 'weekly') {
      isDue = dayOfWeek === 1; // Every Monday
    } else if (s.frequency === 'biweekly') {
      // Every other Monday — use week number
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const weekNum = Math.floor((today - startOfYear) / (7 * 24 * 60 * 60 * 1000));
      isDue = dayOfWeek === 1 && weekNum % 2 === 0;
    }

    if (!isDue) { skipped++; continue; }

    // Guard: skip if already executed today (prevents double-run on re-triggers)
    if (s.last_executed_date === todayDateStr) {
      results.push({ id: s.id, label: s.label, status: 'skipped_already_ran_today' });
      skipped++;
      continue;
    }

    // Find the user's USD wallet
    const wallets = await base44.asServiceRole.entities.WalletBalance.filter({ currency_code: 'USD' });
    const userWallet = wallets.find(w => w.created_by === s.created_by);

    if (!userWallet || (userWallet.balance || 0) < s.amount) {
      results.push({ id: s.id, label: s.label, status: 'skipped_insufficient_funds' });
      skipped++;
      continue;
    }

    // Deduct from wallet
    const newBalance = parseFloat(((userWallet.balance || 0) - s.amount).toFixed(2));
    await base44.asServiceRole.entities.WalletBalance.update(userWallet.id, { balance: newBalance });

    // Fetch live rate for this transfer
    let liveRate = 56.24; // fallback
    try {
      const rateResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: 'Get the current live mid-market USD to PHP (Philippine Peso) exchange rate right now.',
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: { USDPHP: { type: 'number' } },
        },
      });
      if (rateResult?.USDPHP) liveRate = rateResult.USDPHP;
    } catch { /* use fallback */ }

    const amount_php = parseFloat((s.amount * liveRate).toFixed(2));

    // Record transfer
    await base44.asServiceRole.entities.Transfer.create({
      amount_usd: s.amount,
      amount_php,
      recipient_name: s.label,
      recipient_bank: 'Auto-Padala',
      status: 'completed',
      rate: liveRate,
      fee: 0,
      category: 'remittance',
      note: `Scheduled: ${s.label}`,
      reference_id: `SCH-${s.id.slice(0,6)}-${Date.now().toString(36).toUpperCase()}`,
    });

    // Mark as executed today to prevent double-run
    await base44.asServiceRole.entities.ScheduledTransfer.update(s.id, { last_executed_date: todayDateStr });

    results.push({ id: s.id, label: s.label, amount: s.amount, status: 'executed' });
    executed++;
  }

  return Response.json({
    success: true,
    executed,
    skipped,
    date: today.toISOString().slice(0, 10),
    results,
  });
});