import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/2ndlife/payments/provider";
import { confirmPayment } from "@/modules/payments/service";
import { getTenantContext } from "@/modules/tenants/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/payments
 *
 * The ONLY endpoint that can mark revenue as RECOVERED.
 *
 * Flow:
 * 1. If PAYMENT_WEBHOOK_SECRET set: require matching header (fail closed)
 * 2. Verify provider signature (Ozow uses HMAC-SHA256)
 * 3. Parse the payload
 * 4. Call confirmPayment() which:
 *    - Finds the payment by providerReference or idempotencyKey
 *    - Checks tenant isolation
 *    - Idempotency: if already confirmed, returns duplicate:true
 *    - Verifies amount matches
 *    - Updates payment.status = 'confirmed'
 *    - Updates opportunity.status = 'recovered'
 *    - Creates audit log
 * 5. Always return 2xx (providers retry on 5xx)
 *
 * CRITICAL: A payment redirect (successUrl) is NOT proof of revenue.
 * Only this webhook can confirm a payment.
 */

interface OzowWebhookPayload {
  siteCode?: string;
  amount?: string | number;
  currencyCode?: string;
  transactionReference?: string;
  transactionId?: string;
  status?: string; // "Complete", "Failed", "Cancelled", etc.
  paymentRequestId?: string;
  hash?: string;
  error?: string;
}

interface MockWebhookPayload {
  provider: "mock";
  providerPaymentId: string;
  amount: number;
  status: "confirmed" | "failed";
  idempotencyKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    // ─── 1. Secret gate ───
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (secret) {
      const provided = req.headers.get("x-webhook-secret") ?? req.headers.get("x-api-key");
      if (provided !== secret) {
        console.warn("[webhook/payments] 401: secret mismatch");
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
    }

    const rawBody = await req.text();
    const payload: OzowWebhookPayload | MockWebhookPayload = JSON.parse(rawBody);

    // ─── 2. Handle mock provider (demo mode) ───
    if ("provider" in payload && payload.provider === "mock") {
      const mockPayload = payload as MockWebhookPayload;

      // Get tenant context (demo mode uses seeded tenant)
      const tenant = await getTenantContext();
      if (!tenant) {
        return NextResponse.json({ ok: true, error: "no_tenant" }, { status: 200 });
      }

      const result = await confirmPayment({
        tenantId: tenant.id,
        providerPaymentId: mockPayload.providerPaymentId,
        provider: "mock",
        amount: mockPayload.amount,
        webhookPayload: mockPayload,
        idempotencyKey: mockPayload.idempotencyKey,
      });

      return NextResponse.json({
        ok: true,
        confirmed: !result.duplicate,
        duplicate: result.duplicate,
        recovered: result.recovered,
        paymentId: result.payment.id,
      });
    }

    // ─── 3. Handle Ozow (production) ───
    const ozowPayload = payload as OzowWebhookPayload;

    // Verify signature
    const provider = getPaymentProvider();
    const signature = req.headers.get("x-ozow-signature") ?? ozowPayload.hash ?? "";
    const passKey = process.env.OZOW_PASS_KEY ?? "";

    if (passKey && !provider.verifyWebhookSignature(rawBody, signature, passKey)) {
      console.warn("[webhook/payments] 401: signature verification failed");
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }

    // Check status — only "Complete" confirms
    const status = (ozowPayload.status ?? "").toLowerCase();
    if (status !== "complete" && status !== "success" && status !== "confirmed") {
      // Payment failed or cancelled — update status but don't confirm
      if (db && ozowPayload.paymentRequestId) {
        await db.payment.updateMany({
          where: { providerReference: ozowPayload.paymentRequestId },
          data: { status: status === "cancelled" ? "cancelled" : "failed" },
        });
      }
      return NextResponse.json({ ok: true, status: "not_confirmed" });
    }

    // Get tenant context
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ ok: true, error: "no_tenant" }, { status: 200 });
    }

    // Parse amount
    const amount = typeof ozowPayload.amount === "string"
      ? parseFloat(ozowPayload.amount)
      : ozowPayload.amount ?? 0;

    if (amount <= 0) {
      return NextResponse.json({ ok: true, error: "invalid_amount" }, { status: 200 });
    }

    // Confirm the payment
    const result = await confirmPayment({
      tenantId: tenant.id,
      providerPaymentId: ozowPayload.paymentRequestId ?? ozowPayload.transactionId ?? "",
      provider: "ozow",
      amount,
      webhookPayload: ozowPayload,
      idempotencyKey: ozowPayload.transactionReference,
    });

    return NextResponse.json({
      ok: true,
      confirmed: !result.duplicate,
      duplicate: result.duplicate,
      recovered: result.recovered,
      paymentId: result.payment.id,
    });
  } catch (err) {
    // ALWAYS return 2xx — payment providers retry on 5xx
    console.error(
      "[webhook/payments] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ ok: true, error: "internal" }, { status: 200 });
  }
}
