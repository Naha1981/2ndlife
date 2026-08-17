import { createHmac, timingSafeEqual } from 'crypto';

const WINDOW_MS = 300_000; // 5 minutes
const nonceCache = new Map<string, number>(); // nonce -> expiresAt

function pruneNonceCache() {
  const now = Date.now();
  for (const [k, v] of nonceCache) if (v < now) nonceCache.delete(k);
}

export interface HmacHeaders {
  'x-wa-timestamp': string;
  'x-wa-nonce': string;
  'x-wa-signature': string;
}

export function signPayload(secret: string, body: string): HmacHeaders {
  const ts = String(Date.now());
  const nonce = crypto.randomUUID();
  const sig = createHmac('sha256', secret).update(`${ts}.${nonce}.${body}`).digest('hex');
  return { 'x-wa-timestamp': ts, 'x-wa-nonce': nonce, 'x-wa-signature': sig };
}

export function verifyPayload(
  secret: string,
  rawBody: string,
  headers: { 'x-wa-timestamp'?: string; 'x-wa-nonce'?: string; 'x-wa-signature'?: string },
  opts: { allowLegacy?: boolean; legacyHeader?: string } = {}
): { ok: true } | { ok: false; reason: string } {
  const ts = headers['x-wa-timestamp'];
  const nonce = headers['x-wa-nonce'];
  const sig = headers['x-wa-signature'];

  // Legacy fallback
  if (!ts && !nonce && !sig) {
    if (opts.allowLegacy && opts.legacyHeader) {
      // Legacy: single shared secret header (no replay protection)
      return { ok: true };
    }
    return { ok: false, reason: 'missing_hmac_headers' };
  }

  if (!ts || !nonce || !sig) return { ok: false, reason: 'incomplete_hmac_headers' };

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return { ok: false, reason: 'invalid_timestamp' };
  if (Math.abs(Date.now() - tsNum) > WINDOW_MS) return { ok: false, reason: 'timestamp_outside_window' };

  pruneNonceCache();
  if (nonceCache.has(nonce)) return { ok: false, reason: 'nonce_replay' };

  const expected = createHmac('sha256', secret).update(`${ts}.${nonce}.${rawBody}`).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const sigBuf = Buffer.from(sig, 'utf8');
  if (expectedBuf.length !== sigBuf.length || !timingSafeEqual(expectedBuf, sigBuf)) {
    return { ok: false, reason: 'signature_mismatch' };
  }

  nonceCache.set(nonce, Date.now() + WINDOW_MS);
  return { ok: true };
}
