/**
 * processTransfer — Execute a money transfer (remittance)
 *
 * Payload:
 *   amount_usd: number
 *   recipient_id?: string
 *   recipient_name: string
 *   recipient_bank: string
 *   rate: number  (USD/PHP rate)
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

  // ── KYC gate — block ALL transfers until onboarding complete ──
  if (!user.onboarding_completed) {
    return Response.json({
      error: 'Identity verification required before sending money. Please complete KYC in your profile.',
      kyc_required: true,
    }, { status: 403 });
  }

  // ── Check USD balance ──
  const allWallets = await base44.asServiceRole.entities.WalletBalance.filter({});
  const userWallets = allWallets.filter(w => w.created_by === user.email);
  const usdWallet = userWallets.find(w => w.currency_code === 'USD');

  if (!usdWallet) {
    return Response.json({ error: 'No USD wallet found. Please add funds first.' }, { status: 400 });
  }

  // ── Re-read balance fresh to guard against race condition ──
  const freshWallets = await base44.asServiceRole.entities.WalletBalance.filter({ id: usdWallet.id });
  const freshWallet = freshWallets[0];
  if (!freshWallet) {
    return Response.json({ error: 'Wallet not found.' }, { status: 400 });
  }

  const currentBalance = freshWallet.balance || 0;
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

  // ── Compute amounts ──
  const fee = 0;
  const amount_php = parseFloat((amount_usd * rate).toFixed(2));
  const newUsdBalance = parseFloat((currentBalance - amount_usd).toFixed(2));

  // ── Deduct from USD wallet (use freshWallet.id) ──
  const updatedUsdWallet = await base44.asServiceRole.entities.WalletBalance.update(freshWallet.id, {
    balance: newUsdBalance,
  });

  // ── Credit PHP wallet ──
  const phpWallet = userWallets.find(w => w.currency_code === 'PHP');
  if (phpWallet) {
    const newPhpBalance = parseFloat(((phpWallet.balance || 0) + amount_php).toFixed(2));
    await base44.asServiceRole.entities.WalletBalance.update(phpWallet.id, {
      balance: newPhpBalance,
    });
  } else {
    // Auto-create PHP wallet and credit it
    await base44.asServiceRole.entities.WalletBalance.create({
      currency_code: 'PHP',
      currency_name: 'Philippine Peso',
      flag: '🇵🇭',
      balance: amount_php,
      yield_pct: '2.1%',
    });
  }

  // ── Record transfer ──
  const transfer = await base44.asServiceRole.entities.Transfer.create({
    amount_usd,
    amount_php,
    recipient_name: resolvedName,
    recipient_bank: resolvedBank,
    recipient_id: recipient_id || undefined,
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
    if (roundUp > 0 && newUsdBalance >= roundUp) {
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
    wallet: updatedUsdWallet,
    new_balance: newUsdBalance,
    message: `$${amount_usd.toFixed(2)} sent to ${resolvedName} — ₱${amount_php.toLocaleString()} delivered.`,
  });
});