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

  // Fee calculation
  const feeRate = method === 'instant' ? 0.015 : 0;
  const fee = parseFloat((amount * feeRate).toFixed(2));
  const netAmount = parseFloat((amount - fee).toFixed(2));

  // Status based on method (ACH/wire take time in real world — simulated as pending -> completed)
  const status = (method === 'instant' || method === 'crypto') ? 'completed' : 'completed'; // all instant for demo

  // Find or create wallet
  const wallets = await base44.asServiceRole.entities.WalletBalance.filter({ currency_code });
  // Filter to current user's wallets
  const userWallets = wallets.filter(w => w.created_by === user.email);

  let wallet;
  if (userWallets.length === 0) {
    // Create wallet for this user
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