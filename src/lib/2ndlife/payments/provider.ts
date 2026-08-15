/**
 * 2ndLife Revenue OS — Payment Provider Interface
 *
 * PERMANENT RULE: ALL payment creation goes through getPaymentProvider() ONLY.
 * No other file may call Ozow/PayFast/Stripe HTTP directly.
 *
 * CRITICAL PRINCIPLE: A payment redirect is NOT proof of revenue.
 * Revenue becomes RECOVERED only after a verified webhook confirms it.
 * This interface handles payment REQUEST creation only — confirmation
 * is always via the webhook route (/api/webhooks/payments).
 */

import { OzowAdapter } from "./ozow-adapter";
import { MockPaymentAdapter } from "./mock-payment-adapter";

export type PaymentStatus =
  | "pending"
  | "confirmed"
  | "failed"
  | "refunded"
  | "cancelled";

export interface PaymentRequestInput {
  tenantId: string;
  opportunityId?: string;
  conversationId?: string;
  customerId: string;
  amount: number; // in ZAR
  description: string;
  idempotencyKey: string; // prevents duplicate payment requests
}

export interface PaymentRequestResult {
  providerPaymentId: string; // ID from provider (or mock_<uuid>)
  checkoutUrl: string; // URL the customer visits to pay (redirect only — NOT proof)
  status: PaymentStatus; // always "pending" at creation
}

export interface PaymentProvider {
  readonly name: "ozow" | "mock" | "payfast";
  createPaymentRequest(input: PaymentRequestInput): Promise<PaymentRequestResult>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
}

/**
 * Factory: returns OzowAdapter if configured, else MockPaymentAdapter.
 * Keys are read INSIDE adapter methods (runtime), never at module load.
 */
export function getPaymentProvider(): PaymentProvider {
  if (process.env.OZOW_API_KEY && process.env.OZOW_PASS_KEY) {
    return new OzowAdapter();
  }
  return new MockPaymentAdapter();
}

/**
 * Sync version for UI/selftest display.
 */
export function getPaymentProviderName(): "ozow" | "mock" | "payfast" {
  if (process.env.OZOW_API_KEY && process.env.OZOW_PASS_KEY) {
    return "ozow";
  }
  return "mock";
}
