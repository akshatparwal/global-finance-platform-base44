/**
 * processInvestment — Move money from wallet into a savings goal
 * 
 * Payload:
 *   goal_id: string
 *   amount: number (USD)
 *   note?: string
 * 
 * Returns: { success, goal, wallet }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { goal_id, amount, note } = await req.json();

  if (!goal_id) return Response.json({ error: 'goal_id is required.' }, { status: 400 });
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return Response.json({ error: 'Invalid amount.' }, { status: 400 });
  }

  // ── Fetch goal ──
  const goals = await base44.asServiceRole.entities.SavingsGoal.filter({ id: goal_id });
  if (goals.length === 0) return Response.json({ error: 'Goal not found.' }, { status: 404 });
  const goal = goals[0];
  if (goal.created_by !== user.email) {
    return Response.json({ error: 'Not authorized to modify this goal.' }, { status: 403 });
  }

  // ── Check wallet balance ──
  const wallets = await base44.asServiceRole.entities.WalletBalance.filter({ currency_code: 'USD' });
  const userWallet = wallets.find(w => w.created_by === user.email);
  if (!userWallet) return Response.json({ error: 'No USD wallet found.' }, { status: 400 });

  const currentBalance = userWallet.balance || 0;
  if (currentBalance < amount) {
    return Response.json({
      error: `Insufficient funds. Balance: $${currentBalance.toFixed(2)}, needed: $${amount.toFixed(2)}.`,
      current_balance: currentBalance,
    }, { status: 400 });
  }

  // ── Check goal not already complete ──
  const currentGoalAmount = goal.current_amount || 0;
  if (currentGoalAmount >= goal.target_amount) {
    return Response.json({ error: 'This goal is already fully funded!' }, { status: 400 });
  }

  // Cap to remaining needed
  const remaining = goal.target_amount - currentGoalAmount;
  const effectiveAmount = Math.min(amount, remaining);

  // ── Deduct from wallet ──
  const newWalletBalance = parseFloat((currentBalance - effectiveAmount).toFixed(2));
  const updatedWallet = await base44.asServiceRole.entities.WalletBalance.update(userWallet.id, {
    balance: newWalletBalance,
  });

  // ── Update goal ──
  const newGoalAmount = parseFloat((currentGoalAmount + effectiveAmount).toFixed(2));
  const isComplete = newGoalAmount >= goal.target_amount;

  const updatedGoal = await base44.asServiceRole.entities.SavingsGoal.update(goal_id, {
    current_amount: newGoalAmount,
    contributions: [
      ...(goal.contributions || []),
      {
        amount: effectiveAmount,
        note: note || 'Manual contribution',
        date: new Date().toISOString(),
      },
    ],
  });

  // ── Record as a Transfer (savings category) ──
  await base44.asServiceRole.entities.Transfer.create({
    amount_usd: effectiveAmount,
    recipient_name: goal.label,
    recipient_bank: 'Savings Goal',
    status: 'completed',
    rate: 1,
    fee: 0,
    category: 'savings',
    note: note || `Contribution to "${goal.label}"`,
    reference_id: `SAV-${Date.now().toString(36).toUpperCase()}`,
  });

  return Response.json({
    success: true,
    goal: updatedGoal,
    wallet: updatedWallet,
    amount_contributed: effectiveAmount,
    goal_complete: isComplete,
    new_balance: newWalletBalance,
    message: isComplete
      ? `🎉 Goal "${goal.label}" fully funded!`
      : `$${effectiveAmount.toFixed(2)} added to "${goal.label}". $${(goal.target_amount - newGoalAmount).toFixed(2)} remaining.`,
  });
});