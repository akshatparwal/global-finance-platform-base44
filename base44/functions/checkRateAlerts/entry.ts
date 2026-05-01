/**
 * checkRateAlerts — Scheduled function that checks live USD/PHP rate
 * against all active RateAlert records and fires email + marks triggered.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function fetchLiveRate() {
  const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=PHP');
  if (!res.ok) throw new Error('Rate fetch failed');
  const data = await res.json();
  return data.rates?.PHP || null;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow scheduled invocation (no user auth required)
  let liveRate;
  try {
    liveRate = await fetchLiveRate();
  } catch {
    return Response.json({ error: 'Could not fetch live rate' }, { status: 503 });
  }

  if (!liveRate) {
    return Response.json({ error: 'No PHP rate available' }, { status: 503 });
  }

  // Fetch all active, un-triggered alerts
  const alerts = await base44.asServiceRole.entities.RateAlert.filter({
    is_active: true,
    triggered: false,
  });

  const triggered = [];

  for (const alert of alerts) {
    const hit =
      alert.direction === 'above'
        ? liveRate >= alert.target_rate
        : liveRate <= alert.target_rate;

    if (!hit) continue;

    // Mark as triggered
    await base44.asServiceRole.entities.RateAlert.update(alert.id, {
      triggered: true,
      triggered_at: new Date().toISOString(),
    });

    // Look up the user who created this alert
    const users = await base44.asServiceRole.entities.User.filter({ email: alert.created_by });
    const user = users?.[0];

    if (user?.email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        from_name: 'KinnectFi Rate Alerts',
        subject: `🔔 Rate Alert: USD/PHP hit ₱${liveRate.toFixed(2)} — Send now!`,
        body: `Hi ${user.full_name || 'there'}!\n\nYour KinnectFi rate alert was triggered.\n\n📊 Current Rate: ₱${liveRate.toFixed(2)} / USD\n🎯 Your Target: ${alert.direction === 'above' ? 'Above' : 'Below'} ₱${alert.target_rate}\n\nThis is a great moment to send your padala home! Log in to KinnectFi and lock in this rate.\n\n→ Send money now: https://kinnect.fi/dashboard/pay\n\n— KinnectFi Rate Alert System`,
      });
    }

    triggered.push({ id: alert.id, rate: liveRate, target: alert.target_rate, user: user?.email });
  }

  return Response.json({
    success: true,
    liveRate,
    alertsChecked: alerts.length,
    triggered: triggered.length,
    details: triggered,
  });
});