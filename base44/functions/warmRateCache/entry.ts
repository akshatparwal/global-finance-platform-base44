/**
 * warmRateCache — Background rate fetcher
 *
 * Called by the frontend when the Pay page loads (fire-and-forget).
 * Fetches the live USD/PHP rate and stores it in a special WalletBalance
 * record (currency_code = 'RATE_CACHE') so processTransfer can read it
 * instantly on the next request — even across isolate cold-starts.
 *
 * This endpoint is intentionally unauthenticated so it can be called
 * pre-login / without blocking the UI. It only writes a non-financial
 * reference record, so there is no security risk.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    // Fetch live rate via LLM+internet (this is the slow call — now off critical path)
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: 'Get the current live mid-market USD to PHP (Philippine Peso) exchange rate right now. Return only the numeric rate.',
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          USDPHP: { type: 'number', description: '1 USD = X PHP' },
        },
      },
    });

    const rate = result?.USDPHP;
    if (!rate || rate < 40 || rate > 80) {
      return Response.json({ success: false, error: 'Rate out of plausible range', rate });
    }

    // Upsert the RATE_CACHE sentinel record
    const existing = await base44.asServiceRole.entities.WalletBalance.filter({ currency_code: 'RATE_CACHE' });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.WalletBalance.update(existing[0].id, { balance: rate });
    } else {
      await base44.asServiceRole.entities.WalletBalance.create({
        currency_code: 'RATE_CACHE',
        currency_name: 'Rate Cache Sentinel',
        flag: '📡',
        balance: rate,
        yield_pct: '0%',
      });
    }

    return Response.json({ success: true, rate, cached_at: new Date().toISOString() });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});