/**
 * POST /api/webhooks/livesignal
 *
 * Webhook receiver for live visitor signals.
 * Security:
 *   - HMAC-SHA256 signature verified (X-LiveSignal-Signature header)
 *   - Idempotency enforced via X-Idempotency-Key + WebhookEvent table
 *
 * Privacy:
 *   - rawText classified + stripped immediately via ingestSignal()
 *   - Only the classified signal (category + excerpt) is stored
 *   - rawText is never written to DB
 *
 * Returns: { ok: true, category, signalId }  (verification row 6)
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { ingestSignal } from "@/modules/livesignal/ingest.service";
import { z } from "zod";

// ─── HMAC verification ────────────────────────────────────────────────────────

function verifySignature(
  rawText: string,
  ts: number,
  signature: string,
  secret: string
): boolean {
  const payload = `${ts}.${rawText}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

// ─── Payload schema ───────────────────────────────────────────────────────────

const WebhookPayloadSchema = z.object({
  sessionId: z.string().min(1),
  roomId: z.string().min(1),
  tenantId: z.string().min(1),
  rawText: z.string().min(1).max(2000),
  ts: z.number().int(),
});

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const secret = process.env.LIVESIGNAL_WEBHOOK_SECRET;
  if (!secret) {
    // Zero-env: secret missing → 401 (app still compiles without it)
    return NextResponse.json({ error: "Webhook not configured" }, { status: 401 });
  }

  // 1. Idempotency check
  const idempotencyKey = req.headers.get("x-idempotency-key");
  if (!idempotencyKey) {
    return NextResponse.json({ error: "Missing X-Idempotency-Key header" }, { status: 400 });
  }

  const existing = await prisma.webhookEvent.findUnique({
    where: { providerEventId: idempotencyKey },
  });
  if (existing) {
    // Already processed — return success (idempotent)
    return NextResponse.json({ ok: true, replayed: true });
  }

  // 2. Parse + validate body
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = WebhookPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { sessionId, roomId, tenantId, rawText, ts } = parsed.data;

  // 3. Signature verification
  const signature = req.headers.get("x-livesignal-signature") ?? "";
  if (!verifySignature(rawText, ts, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 4. Timestamp freshness check (±5 minutes)
  const ageSecs = Math.abs(Date.now() / 1000 - ts);
  if (ageSecs > 300) {
    return NextResponse.json({ error: "Stale webhook (>5 min)" }, { status: 400 });
  }

  // 5. Ingest — rawText is classified + stripped inside, never stored
  const result = await ingestSignal(tenantId, roomId, rawText, sessionId);

  // 6. Record idempotency key (store only classified metadata, not rawText)
  await prisma.webhookEvent.create({
    data: {
      provider: "livesignal",
      providerEventId: idempotencyKey,
      tenantId,
      raw: JSON.stringify({
        category: result.category,
        signalId: result.signalId,
        // rawText intentionally excluded — privacy invariant
      }),
      processedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    category: result.category,
    signalId: result.signalId,
    promotedToRadar: result.promotedToRadar,
    handoffQueued: result.handoffQueued,
  });
}
