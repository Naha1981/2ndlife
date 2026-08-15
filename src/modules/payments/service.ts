/**
 * 2ndLife Revenue OS — Payment Service
 *
 * Business logic for payment requests and verified revenue attribution.
 *
 * CRITICAL RULES:
 * 1. A payment redirect is NOT proof of revenue.
 * 2. Revenue becomes RECOVERED only after a verified webhook confirms it.
 * 3. All payment operations are idempotent (idempotencyKey prevents duplicates).
 * 4. Every payment event is audited.
 * 5. Duplicate webhook events never create duplicate payments.
 *
 * The flow:
 *   createPaymentRequest() → customer pays → webhook fires →
 *   confirmPayment() → opportunity.status = 'recovered' → audit log →
 *   dashboard revenue updates
 */

import { db } from "@/lib/db";
import { AppError } from "@/shared/errors/types";
import { getPaymentProvider } from "@/lib/2ndlife/payments/provider";
import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────

export const createPaymentRequestSchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
  opportunityId: z.string().optional(),
  conversationId: z.string().optional(),
  amount: z.number().positive(),
  description: z.string().min(1).max(200),
  idempotencyKey: z.string().min(1).max(100),
});
export type CreatePaymentRequestInput = z.infer<typeof createPaymentRequestSchema>;

export const confirmPaymentSchema = z.object({
  tenantId: z.string().min(1),
  providerPaymentId: z.string().min(1),
  provider: z.enum(["ozow", "mock", "payfast"]),
  amount: z.number().positive(),
  webhookPayload: z.unknown(),
  idempotencyKey: z.string().optional(),
});
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;

// ─── Service functions ──────────────────────────────────────────

/**
 * Create a payment request.
 * Idempotent: if a payment with this idempotencyKey already exists, return it.
 */
export async function createPaymentRequest(input: CreatePaymentRequestInput) {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");
  const parsed = createPaymentRequestSchema.parse(input);

  // Idempotency: check if payment request already exists
  const existing = await db.payment.findUnique({
    where: { idempotencyKey: parsed.idempotencyKey },
  });

  if (existing) {
    // Return existing payment request — don't create a duplicate
    return {
      payment: existing,
      checkoutUrl: null, // already created
      duplicate: true,
    };
  }

  // Create payment record in DB first (pending status)
  const payment = await db.payment.create({
    data: {
      tenantId: parsed.tenantId,
      opportunityId: parsed.opportunityId,
      provider: getPaymentProvider().name,
      providerReference: "pending", // will update after provider call
      amount: parsed.amount,
      currency: "ZAR",
      status: "pending",
      idempotencyKey: parsed.idempotencyKey,
    },
  });

  // Call the payment provider
  const provider = getPaymentProvider();
  const result = await provider.createPaymentRequest({
    tenantId: parsed.tenantId,
    opportunityId: parsed.opportunityId,
    conversationId: parsed.conversationId,
    customerId: parsed.customerId,
    amount: parsed.amount,
    description: parsed.description,
    idempotencyKey: parsed.idempotencyKey,
  });

  // Update payment with provider reference
  const updated = await db.payment.update({
    where: { id: payment.id },
    data: {
      providerReference: result.providerPaymentId,
    },
  });

  // Audit log
  await db.auditLog.create({
    data: {
      tenantId: parsed.tenantId,
      action: "PAYMENT_REQUEST_CREATED",
      entityType: "payment",
      entityId: payment.id,
      metadata: JSON.stringify({
        amount: parsed.amount,
        provider: provider.name,
        providerPaymentId: result.providerPaymentId,
      }),
    },
  });

  return {
    payment: updated,
    checkoutUrl: result.checkoutUrl,
    duplicate: false,
  };
}

/**
 * Confirm a payment from a verified webhook.
 *
 * THIS IS THE ONLY FUNCTION THAT CAN MARK REVENUE AS RECOVERED.
 *
 * Idempotent: if the payment is already confirmed, returns duplicate:true.
 * Updates the linked RecoveryOpportunity to status='recovered'.
 * Creates an audit log entry.
 */
export async function confirmPayment(input: ConfirmPaymentInput) {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");
  const parsed = confirmPaymentSchema.parse(input);

  // Find the payment by provider reference or idempotency key
  let payment = null;

  if (parsed.idempotencyKey) {
    payment = await db.payment.findUnique({
      where: { idempotencyKey: parsed.idempotencyKey },
    });
  }

  if (!payment) {
    payment = await db.payment.findFirst({
      where: {
        providerReference: parsed.providerPaymentId,
        tenantId: parsed.tenantId,
      },
    });
  }

  if (!payment) {
    // Payment not found — this could be a webhook for a different tenant or a fraud attempt
    throw new AppError("NOT_FOUND", "Payment not found for this provider reference", 404);
  }

  // CRITICAL: Tenant isolation check
  if (payment.tenantId !== parsed.tenantId) {
    throw new AppError(
      "TENANT_ISOLATION",
      "Payment belongs to a different tenant",
      403
    );
  }

  // Idempotency: if already confirmed, return duplicate
  if (payment.status === "confirmed") {
    return {
      payment,
      duplicate: true,
      recovered: false,
    };
  }

  // Verify amount matches (prevent amount manipulation)
  if (Math.abs(payment.amount - parsed.amount) > 0.01) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Amount mismatch: expected ${payment.amount}, got ${parsed.amount}`,
      400
    );
  }

  // Update payment status to confirmed
  const confirmed = await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "confirmed",
      confirmedAt: new Date(),
      webhookPayload: JSON.stringify(parsed.webhookPayload).slice(0, 10000),
    },
  });

  // Update the linked RecoveryOpportunity to 'recovered'
  let opportunityUpdated = false;
  if (payment.opportunityId) {
    await db.recoveryOpportunity.update({
      where: { id: payment.opportunityId },
      data: {
        status: "recovered",
        actualValue: parsed.amount,
      },
    });
    opportunityUpdated = true;
  }

  // Audit log — this is a revenue event
  await db.auditLog.create({
    data: {
      tenantId: parsed.tenantId,
      action: "PAYMENT_CONFIRMED",
      entityType: "payment",
      entityId: payment.id,
      metadata: JSON.stringify({
        amount: parsed.amount,
        provider: parsed.provider,
        opportunityId: payment.opportunityId,
        opportunityRecovered: opportunityUpdated,
      }),
    },
  });

  return {
    payment: confirmed,
    duplicate: false,
    recovered: opportunityUpdated,
  };
}

/**
 * Get total verified recovered revenue for a tenant.
 * This is the ONLY number that should appear as "Revenue Recovered" on the dashboard.
 */
export async function getVerifiedRecoveredRevenue(tenantId: string): Promise<number> {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  const result = await db.payment.aggregate({
    where: {
      tenantId,
      status: "confirmed",
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount ?? 0;
}

/**
 * Get payment statistics for the dashboard.
 */
export async function getPaymentStats(tenantId: string) {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  const [confirmed, pending, failed, total] = await Promise.all([
    db.payment.aggregate({
      where: { tenantId, status: "confirmed" },
      _sum: { amount: true },
      _count: true,
    }),
    db.payment.aggregate({
      where: { tenantId, status: "pending" },
      _sum: { amount: true },
      _count: true,
    }),
    db.payment.aggregate({
      where: { tenantId, status: "failed" },
      _sum: { amount: true },
      _count: true,
    }),
    db.payment.count({ where: { tenantId } }),
  ]);

  return {
    confirmedAmount: confirmed._sum.amount ?? 0,
    confirmedCount: confirmed._count,
    pendingAmount: pending._sum.amount ?? 0,
    pendingCount: pending._count,
    failedAmount: failed._sum.amount ?? 0,
    failedCount: failed._count,
    totalCount: total,
  };
}
