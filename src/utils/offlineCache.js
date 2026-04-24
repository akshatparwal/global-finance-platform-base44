/**
 * Simple localStorage-based offline cache for entity data.
 * Falls back to cached data when network fails.
 */

const PREFIX = "kfi_cache_";
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function setCached(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export function getCached(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) return null; // stale
    return data;
  } catch { return null; }
}

/**
 * Fetch with fallback to cache.
 * @param {string} key  - cache key
 * @param {Function} fetchFn - async function that returns fresh data
 * @returns {{ data: any, fromCache: boolean }}
 */
export async function fetchWithCache(key, fetchFn) {
  try {
    const fresh = await fetchFn();
    setCached(key, fresh);
    return { data: fresh, fromCache: false };
  } catch {
    const cached = getCached(key);
    if (cached !== null) return { data: cached, fromCache: true };
    throw new Error("No data available offline");
  }
}