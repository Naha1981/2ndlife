/**
 * MockPaymentAdapter — demo mode payment provider.
 *
 * Creates payment requests with a fake checkout URL.
 * Does NOT confirm payments — confirmation only happens via the webhook route
 * (which can be triggered by the demo panel for testing).
 *
 * CRITICAL: This adapter never marks a payment as "confirmed" on its own.
 * A redirect to the checkout URL is NOT proof of revenue.
 */

import type {
  PaymentProvider,
  PaymentRequestInput,
  PaymentRequestResult,
} from "./provider";
import { createHash } from "crypto";

export class MockPaymentAdapter implements PaymentProvider {
  readonly name = "mock" as const;

  async createPaymentRequest(
    input: PaymentRequestInput
  ): Promise<PaymentRequestResult> {
    const providerPaymentId = `mock_pay_${input.idempotencyKey}`;

    // Mock checkout URL — visiting this does NOT confirm payment
    const checkoutUrl = `/api/v1/payments/mock-checkout?id=${providerPaymentId}&amount=${input.amount}`;

    console.log(
      `[mock-payments] Payment request created: ${providerPaymentId} for R${input.amount} (tenant: ${input.tenantId})`
    );

    return {
      providerPaymentId,
      checkoutUrl,
      status: "pending" as const,
    };
  }

  /**
   * Mock signature verification — always returns true in demo mode.
   * In production, OzowAdapter uses HMAC-SHA256 with the pass key.
   */
  verifyWebhookSignature(_rawBody: string, _signature: string, _secret: string): boolean {
    return true;
  }
}
