/**
 * issueVirtualCard — Generate and persist a virtual card server-side
 *
 * Generates cryptographically random card number, CVV, and expiry on the server.
 * Returns the created VirtualCard entity.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function randomDigits(n) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b % 10).join('');
}

function generateCardData() {
  const g1 = '4582';
  const g2 = randomDigits(4);
  const g3 = randomDigits(4);
  const g4 = randomDigits(4);
  const card_number = `${g1} ${g2} ${g3} ${g4}`;
  const last4 = g4;
  const now = new Date();
  const expMonth = String((now.getMonth() + 1)).padStart(2, '0');
  const expYear = String(now.getFullYear() + 3).slice(-2);
  const expiry = `${expMonth}/${expYear}`;
  const cvv = randomDigits(3); // plaintext — hashed before storage
  return { card_number, last4, expiry, cvv };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Prevent duplicate cards — server-side check using service role to be authoritative
  const existing = await base44.asServiceRole.entities.VirtualCard.filter({ created_by: user.email });
  if (existing.length > 0) {
    return Response.json({ error: 'Card already issued.', card: existing[0] }, { status: 409 });
  }

  const data = generateCardData();

  // Hash CVV before storing — never persist plaintext CVV in the database
  const cvvHashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.cvv));
  const cvvHash = Array.from(new Uint8Array(cvvHashBuf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

  const savedCard = await base44.entities.VirtualCard.create({
    card_number: data.card_number,
    last4: data.last4,
    expiry: data.expiry,
    cvv: cvvHash,   // store hash, never plaintext
    is_frozen: false,
    contactless_enabled: true,
    instant_settlement: false,
    spending_limit: 5000,
    status: 'active',
    physical_requested: false,
    physical_status: 'none',
  });

  // Return the plaintext CVV to the caller exactly once — it is never stored in DB.
  return Response.json({ success: true, card: { ...savedCard, cvv: data.cvv } });
});