import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Cache rates in module scope so all components share one fetch
let cachedRates = null;
let lastFetched = 0;
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

export function useLiveRates() {
  const [rates, setRates] = useState(cachedRates || { USDPHP: 56.24, EURUSD: 1.08, GBPUSD: 1.27, loading: !cachedRates });
  const [loading, setLoading] = useState(!cachedRates);
  const [error, setError] = useState(null);

  const fetchRates = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && cachedRates && now - lastFetched < CACHE_MS) {
      setRates(cachedRates);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get the current live mid-market foreign exchange rates right now. Return only these rates: USD to PHP (Philippine Peso), EUR to USD, GBP to USD. Use real-time data.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            USDPHP: { type: "number", description: "1 USD = X PHP" },
            EURUSD: { type: "number", description: "1 EUR = X USD" },
            GBPUSD: { type: "number", description: "1 GBP = X USD" },
            USDPHP_change_pct: { type: "number", description: "24h % change in USD/PHP rate" },
            source: { type: "string" }
          }
        }
      });
      const fresh = {
        USDPHP: result.USDPHP || 56.24,
        EURUSD: result.EURUSD || 1.08,
        GBPUSD: result.GBPUSD || 1.27,
        USDPHP_change_pct: result.USDPHP_change_pct || 0,
        source: result.source || "Market Data",
        fetched_at: new Date().toISOString(),
      };
      cachedRates = fresh;
      lastFetched = Date.now();
      setRates(fresh);
      setError(null);
    } catch (e) {
      setError("Could not fetch live rates");
      // Keep last cached or fallback
      if (cachedRates) setRates(cachedRates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  return { rates, loading, error, refetch: () => fetchRates(true) };
}