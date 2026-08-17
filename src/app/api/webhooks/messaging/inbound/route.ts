import { NextRequest, NextResponse } from 'next/server';
import { verifyPayload } from '@/lib/messaging/hmac-v2';

const HMAC_SECRET = process.env.WEBHOOK_HMAC_SECRET || process.env.WEBHOOK_SECRET || '';
const ALLOW_LEGACY = process.env.MIGRATION_ALLOW_LEGACY_AUTH === 'true';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers = {
    'x-wa-timestamp': req.headers.get('x-wa-timestamp') ?? undefined,
    'x-wa-nonce': req.headers.get('x-wa-nonce') ?? undefined,
    'x-wa-signature': req.headers.get('x-wa-signature') ?? undefined,
  };

  const v = verifyPayload(HMAC_SECRET, rawBody, headers, {
    allowLegacy: ALLOW_LEGACY,
    legacyHeader: req.headers.get('x-webhook-secret') ?? undefined,
  });
  if (!v.ok) return NextResponse.json({ error: v.reason }, { status: 401 });

  let payload: any;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const { messageId, appId, tenantId, text, from, ts, deliveryId } = payload || {};
  if (!messageId || !appId || !tenantId) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  // TODO (chunk 3): enqueue PlatformJob for async AI processing.
  // For chunk 2 we only prove the pipeline: verify -> persist intent -> 200 fast.
  // The enqueue is stubbed here and will be wired in chunk 3 with Prisma.

  // Opt-out fast-path (no AI work needed)
  const upper = String(text || '').trim().toUpperCase();
  if (['STOP', 'STOPPE', 'UNSUB'].includes(upper)) {
    // TODO (chunk 3): persist opt-out via Prisma
    return NextResponse.json({ status: 'opted_out', deliveryId });
  }

  // TODO (chunk 3): enqueue PlatformJob(messageId, appId, tenantId)
  return NextResponse.json({ status: 'queued', deliveryId });
}
