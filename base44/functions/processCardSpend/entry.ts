/**
 * processCardSpend — Deduct from USD wallet for card / bill payments
 *
 * Payload:
 *   amount_usd: number
 *   merchant_name: string
 *   merchant_emoji?: string
 *   category?: "bills" | "subscriptions" | "other"
 *   note?: string
 *
 * Returns: { success, transfer, new_balance }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const {
    amount_usd,
    merchant_name,
    merchant_emoji = '💳',
    category = 'other',
    note,
  } = await req.json();

  if (!amount_usd || typeof amount_usd !== 'number' || amount_usd <= 0) {
    return Response.json({ error: 'Invalid amount.' }, { status: 400 });
  }
  if (!merchant_name) {
    return Response.json({ error: 'merchant_name is required.' }, { status: 400 });
  }

  // ── KYC gate ──
  if (!user.onboarding_completed) {
    return Response.json({
      error: 'Identity verification required. Please complete KYC first.',
      kyc_required: true,
    }, { status: 403 });
  }

  // ── Check USD balance ──
  const allWallets = await base44.asServiceRole.entities.WalletBalance.filter({});
  const usdWallet = allWallets.find(w => w.created_by === user.email && w.currency_code === 'USD');

  if (!usdWallet) {
    return Response.json({ error: 'No USD wallet found.' }, { status: 400 });
  }

  const currentBalance = usdWallet.balance || 0;
  if (currentBalance < amount_usd) {
    return Response.json({
      error: `Insufficient funds. Balance: $${currentBalance.toFixed(2)}, needed: $${amount_usd.toFixed(2)}.`,
      current_balance: currentBalance,
    }, { status: 400 });
  }

  // ── Deduct ──
  const newBalance = parseFloat((currentBalance - amount_usd).toFixed(2));
  await base44.asServiceRole.entities.WalletBalance.update(usdWallet.id, { balance: newBalance });

  // ── Record transaction ──
  const transfer = await base44.asServiceRole.entities.Transfer.create({
    amount_usd,
    recipient_name: merchant_name,
    recipient_bank: 'Card',
    merchant_name,
    merchant_emoji,
    status: 'completed',
    fee: 0,
    category,
    note: note || undefined,
    reference_id: `CARD-${Date.now().toString(36).toUpperCase()}`,
  });

  return Response.json({
    success: true,
    transfer,
    new_balance: newBalance,
    message: `$${amount_usd.toFixed(2)} charged to ${merchant_name}.`,
  });
});