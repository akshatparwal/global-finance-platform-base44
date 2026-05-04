/**
 * awardReferralPoints — Entity automation triggered when a Transfer is created.
 * 
 * When a new remittance transfer is recorded, checks if the sender was referred by
 * someone. If this is their first completed transfer, marks the referral as "rewarded"
 * and awards 500 points to the referrer's record.
 * 
 * Triggered by: Transfer entity create automation.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REFERRAL_POINTS = 500;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();

  const { event, data: transfer } = payload;

  // Only process new completed remittance transfers
  if (event?.type !== 'create') return Response.json({ skipped: 'not a create event' });
  if (!transfer || transfer.category !== 'remittance' || transfer.status !== 'completed') {
    return Response.json({ skipped: 'not a completed remittance' });
  }

  const senderEmail = transfer.created_by;
  if (!senderEmail) return Response.json({ skipped: 'no sender email' });

  // Check if this sender has a referral record (i.e., they were referred by someone)
  const referrals = await base44.asServiceRole.entities.Referral.filter({ referred_email: senderEmail });
  const pending = referrals.find(r => r.status === 'pending' || r.status === 'joined');
  if (!pending) return Response.json({ skipped: 'no pending referral found for sender' });

  // Check if this is the sender's first transfer (to avoid awarding points multiple times)
  const senderTransfers = await base44.asServiceRole.entities.Transfer.filter({
    created_by: senderEmail,
    category: 'remittance',
  });
  // If more than 1 completed transfer exists, points were already awarded (or should be)
  const completedCount = senderTransfers.filter(t => t.status === 'completed').length;
  if (completedCount > 1) return Response.json({ skipped: 'not first transfer — points already awarded' });

  // Mark referral as rewarded and set points_awarded
  await base44.asServiceRole.entities.Referral.update(pending.id, {
    status: 'rewarded',
    points_awarded: REFERRAL_POINTS,
  });

  return Response.json({
    success: true,
    referral_id: pending.id,
    referrer: pending.referrer_email,
    referred: senderEmail,
    points_awarded: REFERRAL_POINTS,
  });
});