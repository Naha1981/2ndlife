/**
 * OzowAdapter — real Instant EFT payment provider for South Africa.
 *
 * Creates payment requests via the Ozow API.
 * Webhook signature verification uses HMAC-SHA256 with the pass key.
 *
 * CRITICAL: This adapter only creates payment REQUESTS.
 * Payment CONFIRMATION is always via the webhook route, which verifies
 * the signature. A redirect to the checkout URL is NOT proof of revenue.
 *
 * Keys are read INSIDE methods (runtime), never at module load.
 * Network failures → throw AppError, never silently fail.
 */

import type {
  PaymentProvider,
  PaymentRequestInput,
  PaymentRequestResult,
} from "./provider";
import { createHmac } from "crypto";
import { AppError } from "@/shared/errors/types";

export class OzowAdapter implements PaymentProvider {
  readonly name = "ozow" as const;

  private getApiKey(): string {
    return process.env.OZOW_API_KEY ?? "";
  }

  private getPassKey(): string {
    return process.env.OZOW_PASS_KEY ?? "";
  }

  private getSiteCode(): string {
    return process.env.OZOW_SITE_CODE ?? "";
  }

  private getApiUrl(): string {
    return process.env.OZOW_API_URL ?? "https://api.ozow.com";
  }

  async createPaymentRequest(
    input: PaymentRequestInput
  ): Promise<PaymentRequestResult> {
    const apiKey = this.getApiKey();
    const passKey = this.getPassKey();
    const siteCode = this.getSiteCode();
    const apiUrl = this.getApiUrl();

    if (!apiKey || !passKey || !siteCode) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Ozow credentials not configured (OZOW_API_KEY, OZOW_PASS_KEY, OZOW_SITE_CODE)",
        500
      );
    }

    try {
      const body = {
        siteCode,
        amount: input.amount.toFixed(2),
        reference: input.idempotencyKey,
        bankRef: input.idempotencyKey,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/cancelled`,
        errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/error`,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`,
        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payments`,
        isTest: process.env.NODE_ENV !== "production",
      };

      const res = await fetch(`${apiUrl}/PostPaymentRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ApiKey": apiKey,
          "Accept": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        console.error(`[ozow] createPaymentRequest HTTP ${res.status}: ${errorText}`);
        throw new AppError(
          "VALIDATION_ERROR",
          `Ozow API error: ${res.status}`,
          502
        );
      }

      const data = await res.json();

      return {
        providerPaymentId: data.paymentRequestId ?? data.id ?? `ozow_${input.idempotencyKey}`,
        checkoutUrl: data.url ?? data.checkoutUrl,
        status: "pending" as const,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.error("[ozow] network error:", err instanceof Error ? err.message : err);
      throw new AppError(
        "VALIDATION_ERROR",
        "Ozow payment request failed — network error",
        502
      );
    }
  }

  /**
   * Verify Ozow webhook signature using HMAC-SHA256.
   * Ozow sends a hash in the header that must match our computation.
   */
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;

    try {
      const expected = createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      // Use timing-safe comparison
      if (expected.length !== signature.length) return false;

      const expectedBuf = Buffer.from(expected, "hex");
      const sigBuf = Buffer.from(signature, "hex");

      // XOR comparison — constant time
      let diff = 0;
      for (let i = 0; i < expectedBuf.length; i++) {
        diff |= expectedBuf[i] ^ sigBuf[i];
      }

      return diff === 0;
    } catch {
      return false;
    }
  }
}
