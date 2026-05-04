/**
 * processTransfer — Execute a money transfer (remittance)
 *
 * Payload:
 *   amount_usd: number
 *   recipient_id?: string
 *   recipient_name: string
 *   recipient_bank: string
 *   rate: number  (USD/PHP rate — validated server-side against live rate ±2%)
 *   note?: string
 *   category?: string
 *
 * Returns: { success, transfer, wallet }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Fetch live USD/PHP rate via LLM+internet (same as frontend useLiveRates)
async function fetchLiveRate(base44) {
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: 'Get the current live mid-market USD to PHP (Philippine Peso) exchange rate right now.',
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          USDPHP: { type: 'number', description: '1 USD = X PHP' },
        },
      },
    });
    return result?.USDPHP || null;
  } catch {
    return null;
  }
}

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
  if (!rate || typeof rate !== 'number' || rate <= 0) {
    return Response.json({ error: 'Exchange rate is required.' }, { status: 400 });
  }

  // ── Server-side rate validation ──
  // Fetch live rate and reject if client rate deviates more than ±2%
  const RATE_TOLERANCE = 0.02; // 2%
  const FALLBACK_RATE = 56.24; // used only if live fetch fails
  const liveRate = await fetchLiveRate(base44);
  const referenceRate = liveRate || FALLBACK_RATE;
  const deviation = Math.abs(rate - referenceRate) / referenceRate;
  if (deviation > RATE_TOLERANCE) {
    return Response.json({
      error: `Exchange rate out of range. Please refresh and try again. (Got ₱${rate.toFixed(4)}, expected ~₱${referenceRate.toFixed(4)})`,
      rate_error: true,
    }, { status: 400 });
  }
  // Use the server-validated rate for PHP calculation
  const validatedRate = referenceRate;

  // ── KYC gate ──
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

  // ── Resolve recipient (single fetch, cached) ──
  let resolvedName = recipient_name || 'Unknown Recipient';
  let resolvedBank = recipient_bank || 'Bank Transfer';
  let resolvedRecipient = null;

  if (recipient_id) {
    const recipients = await base44.asServiceRole.entities.Recipient.filter({ id: recipient_id });
    if (recipients.length > 0) {
      resolvedRecipient = recipients[0];
      resolvedName = resolvedRecipient.nickname || resolvedRecipient.full_name || resolvedName;
      resolvedBank = resolvedRecipient.bank || resolvedBank;
    }
  }

  // ── Compute amounts using server-validated rate ──
  const fee = 0;
  const amount_php = parseFloat((amount_usd * validatedRate).toFixed(2));
  const newUsdBalance = parseFloat((currentBalance - amount_usd).toFixed(2));

  // ── Deduct from USD wallet ──
  const updatedUsdWallet = await base44.asServiceRole.entities.WalletBalance.update(freshWallet.id, {
    balance: newUsdBalance,
  });

  // NOTE: Outbound remittances do NOT credit the sender's PHP wallet.
  // PHP is delivered to the recipient's bank in the Philippines, not held here.

  // ── Record transfer ──
  const transfer = await base44.asServiceRole.entities.Transfer.create({
    amount_usd,
    amount_php,
    recipient_name: resolvedName,
    recipient_bank: resolvedBank,
    recipient_id: recipient_id || undefined,
    status: 'completed',
    rate: validatedRate,
    fee,
    category,
    note: note || undefined,
    reference_id: `KF-${Date.now().toString(36).toUpperCase()}`,
  });

  // ── Update recipient stats (reuse cached resolvedRecipient) ──
  if (recipient_id && resolvedRecipient) {
    await base44.asServiceRole.entities.Recipient.update(recipient_id, {
      total_sent_usd: (resolvedRecipient.total_sent_usd || 0) + amount_usd,
      transfer_count: (resolvedRecipient.transfer_count || 0) + 1,
    });
  }

  // ── Check savings goal round-up ──
  // Round-up is the cents gap between amount_usd and the next whole dollar.
  // We re-read the wallet balance after the transfer deduction to get the true post-transfer balance.
  const roundUp = parseFloat((Math.ceil(amount_usd) - amount_usd).toFixed(2));
  if (roundUp > 0) {
    // Re-read balance from DB (already deducted above) to avoid operating on stale in-memory value
    const postWallets = await base44.asServiceRole.entities.WalletBalance.filter({ id: freshWallet.id });
    const postBalance = postWallets[0]?.balance ?? newUsdBalance;

    if (postBalance >= roundUp) {
      const goals = await base44.asServiceRole.entities.SavingsGoal.filter({ round_up_enabled: true });
      const userGoals = goals.filter(g => g.created_by === user.email);
      for (const goal of userGoals) {
        const newGoalAmount = parseFloat(((goal.current_amount || 0) + roundUp).toFixed(2));
        // Deduct round-up from USD wallet
        await base44.asServiceRole.entities.WalletBalance.update(freshWallet.id, {
          balance: parseFloat((postBalance - roundUp).toFixed(2)),
        });
        await base44.asServiceRole.entities.SavingsGoal.update(goal.id, {
          current_amount: newGoalAmount,
          contributions: [
            ...(goal.contributions || []),
            { amount: roundUp, note: 'Round-up from transfer', date: new Date().toISOString() },
          ],
        });
      }
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