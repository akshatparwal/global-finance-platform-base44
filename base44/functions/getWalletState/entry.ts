/**
 * getWalletState — Single source of truth for a user's financial state
 * 
 * Returns:
 *   wallets, transfers (recent 10), goals, scheduled_transfers,
 *   net_worth_usd, total_saved_usd, total_sent_usd (lifetime)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Parallel fetch everything
  const [walletsAll, transfersAll, goalsAll, scheduledAll] = await Promise.all([
    base44.asServiceRole.entities.WalletBalance.list().catch(() => []),
    base44.asServiceRole.entities.Transfer.list('-created_date', 10).catch(() => []),
    base44.asServiceRole.entities.SavingsGoal.list().catch(() => []),
    base44.asServiceRole.entities.ScheduledTransfer.filter({ is_active: true }).catch(() => []),
  ]);

  // Filter to current user
  const wallets = walletsAll.filter(w => w.created_by === user.email);
  const transfers = transfersAll.filter(t => t.created_by === user.email);
  const goals = goalsAll.filter(g => g.created_by === user.email);
  const scheduled = scheduledAll.filter(s => s.created_by === user.email);

  const usdWallet = wallets.find(w => w.currency_code === 'USD');
  const phpWallet = wallets.find(w => w.currency_code === 'PHP');

  // Compute aggregates
  const usdBalance = usdWallet?.balance || 0;
  const phpBalance = phpWallet?.balance || 0;
  const totalSavedUSD = goals.reduce((s, g) => s + (g.current_amount || 0), 0);
  const lifetimeSentUSD = transfers
    .filter(t => t.category === 'remittance' || !t.category || t.category === 'other')
    .reduce((s, t) => s + (t.amount_usd || 0), 0);

  // Monthly spend
  const now = new Date();
  const monthTransfers = transfers.filter(t => {
    const d = new Date(t.created_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlySpend = monthTransfers.reduce((s, t) => s + (t.amount_usd || 0), 0);

  return Response.json({
    success: true,
    user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    wallets,
    transfers,
    goals,
    scheduled_transfers: scheduled,
    summary: {
      usd_balance: usdBalance,
      php_balance: phpBalance,
      total_saved_usd: totalSavedUSD,
      lifetime_sent_usd: lifetimeSentUSD,
      monthly_spend_usd: monthlySpend,
      wallet_count: wallets.length,
      goal_count: goals.length,
    },
  });
});