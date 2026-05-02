import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const API_KEY = Deno.env.get("OPENFX_API_KEY") || "";
const BASE = "https://api.openfx.com/v1/brokerage/c7534a34-dca7-4d1b-a455-9d8aef9cbc12";

async function hit(url, headers) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'KinnectFi/1.0', ...headers } });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text.slice(0, 400); }
  return { status: res.status, body };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const key = API_KEY.trim();
  const results = {
    _key_preview: key ? `"${key.slice(0,10)}...${key.slice(-6)}" len=${key.length}` : "NOT SET",
  };

  // Test /balances and /trades with Bearer — these returned JSON 401 before
  results.balances_bearer = await hit(`${BASE}/balances`, { 'Authorization': `Bearer ${key}` });
  results.trades_bearer   = await hit(`${BASE}/trades`,   { 'Authorization': `Bearer ${key}` });

  // Also try without the brokerage ID path — maybe auth goes to a different base
  results.no_id_balances  = await hit(`https://api.openfx.com/v1/accounts`, { 'Authorization': `Bearer ${key}` });
  results.no_id_balances2 = await hit(`https://api.openfx.com/v1/balances`, { 'Authorization': `Bearer ${key}` });

  return Response.json(results);
});