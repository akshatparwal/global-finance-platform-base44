/**
 * processTransfer — Execute a money transfer (remittance)
 * 
 * Payload:
 *   amount_usd: number
 *   recipient_id?: string  (Recipient entity id — preferred)
 *   recipient_name: string (fallback if no id)
 *   recipient_bank: string
 *   rate: number           (USD/PHP rate at time of transfer)
 *   note?: string
 *   category?: string
 * 
 * Returns: { success, transfer, wallet }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const {
    amount_usd,
    recipient_id,
    recipient_name,
    recipient_bank,
    rate,
    note,
    category = 'remittance',
  } = await req.json();

  // ── Validation ──
  if (!amount_usd || typeof amount_usd !== 'number' || amount_usd <= 0) {
    return Response.json({ error: 'Invalid amount.' }, { status: 400 });
  }
  if (amount_usd < 1) {
    return Response.json({ error: 'Minimum transfer is $1.00.' }, { status: 400 });
  }
  if (amount_usd > 10000) {
    return Response.json({ error: 'Maximum single transfer is $10,000. Contact support for higher limits.' }, { status: 400 });
  }
  if (!recipient_name && !recipient_id) {
    return Response.json({ error: 'Recipient is required.' }, { status: 400 });
  }
  if (!rate || rate <= 0) {
    return Response.json({ error: 'Exchange rate is required.' }, { status: 400 });
  }

  // ── Check balance ──
  const wallets = await base44.asServiceRole.entities.WalletBalance.filter({ currency_code: 'USD' });
  const userWallet = wallets.find(w => w.created_by === user.email);

  if (!userWallet) {
    return Response.json({ error: 'No USD wallet found. Please add funds first.' }, { status: 400 });
  }

  const currentBalance = userWallet.balance || 0;
  if (currentBalance < amount_usd) {
    return Response.json({
      error: `Insufficient funds. Your balance is $${currentBalance.toFixed(2)}, transfer is $${amount_usd.toFixed(2)}.`,
      current_balance: currentBalance,
    }, { status: 400 });
  }

  // ── Resolve recipient ──
  let resolvedName = recipient_name;
  let resolvedBank = recipient_bank;

  if (recipient_id) {
    const recipients = await base44.asServiceRole.entities.Recipient.filter({ id: recipient_id });
    if (recipients.length > 0) {
      const r = recipients[0];
      resolvedName = r.nickname || r.full_name;
      resolvedBank = r.bank;
    }
  }

  // ── KYC gate ──
  if (!user.onboarding_completed && amount_usd > 500) {
    return Response.json({
      error: 'KYC required for transfers above $500. Please complete identity verification.',
      kyc_required: true,
    }, { status: 403 });
  }

  // ── Compute amounts ──
  const fee = 0; // KinnectFi zero-fee promise
  const amount_php = parseFloat((amount_usd * rate).toFixed(2));
  const newBalance = parseFloat((currentBalance - amount_usd).toFixed(2));

  // ── Deduct from wallet (optimistic, then confirm) ──
  const updatedWallet = await base44.asServiceRole.entities.WalletBalance.update(userWallet.id, {
    balance: newBalance,
  });

  // ── Record transfer ──
  const transfer = await base44.asServiceRole.entities.Transfer.create({
    amount_usd,
    amount_php,
    recipient_name: resolvedName,
    recipient_bank: resolvedBank,
    status: 'completed',
    rate,
    fee,
    category,
    note: note || undefined,
    reference_id: `KF-${Date.now().toString(36).toUpperCase()}`,
  });

  // ── Update recipient stats ──
  if (recipient_id) {
    const recipients = await base44.asServiceRole.entities.Recipient.filter({ id: recipient_id });
    if (recipients.length > 0) {
      const r = recipients[0];
      await base44.asServiceRole.entities.Recipient.update(recipient_id, {
        total_sent_usd: (r.total_sent_usd || 0) + amount_usd,
        transfer_count: (r.transfer_count || 0) + 1,
      });
    }
  }

  // ── Check savings goal round-up ──
  const goals = await base44.asServiceRole.entities.SavingsGoal.filter({ round_up_enabled: true });
  const userGoals = goals.filter(g => g.created_by === user.email);
  for (const goal of userGoals) {
    const roundUp = parseFloat((Math.ceil(amount_usd) - amount_usd).toFixed(2));
    if (roundUp > 0 && newBalance >= roundUp) {
      const newGoalAmount = parseFloat(((goal.current_amount || 0) + roundUp).toFixed(2));
      await base44.asServiceRole.entities.SavingsGoal.update(goal.id, {
        current_amount: newGoalAmount,
        contributions: [
          ...(goal.contributions || []),
          { amount: roundUp, note: 'Round-up from transfer', date: new Date().toISOString() },
        ],
      });
    }
  }

  return Response.json({
    success: true,
    transfer,
    wallet: updatedWallet,
    new_balance: newBalance,
    message: `$${amount_usd.toFixed(2)} sent to ${resolvedName} — ₱${amount_php.toLocaleString()} delivered.`,
  });
});