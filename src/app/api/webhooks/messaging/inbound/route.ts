import { NextRequest, NextResponse } from 'next/server';
import { verifyPayload } from '@/lib/messaging/hmac-v2';
import { PrismaClient } from '@prisma/client';

const HMAC_SECRET = process.env.WEBHOOK_HMAC_SECRET || process.env.WEBHOOK_SECRET || '';
const ALLOW_LEGACY = process.env.MIGRATION_ALLOW_LEGACY_AUTH === 'true';
const prisma = new PrismaClient();

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

  // Persist inbound message
  await prisma.message.create({
    data: {
      tenantId,
      providerEventId: messageId,
      fromPhone: from,
      body: text || '',
      direction: 'inbound'
    }
  }).catch(() => {}); // Idempotent: ignore if already exists

  // Enqueue PlatformJob for async AI processing
  await prisma.platformJob.create({
    data: {
      appId,
      tenantId,
      messageId,
      payload: { tenantId, text, from, messageId },
      status: 'pending',
      runAt: new Date()
    }
  });

  return NextResponse.json({ status: 'queued', deliveryId });
}
