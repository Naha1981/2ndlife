/**
 * MockAdapter — demo mode messaging provider.
 * Returns synthetic success results, logs to console, persists nothing extra.
 * Used when EVOLUTION_API_URL / EVOLUTION_API_KEY are not configured.
 */

import type {
  MessagingProvider,
  OutboundMessage,
  OutboundResult,
  DeliveryStatus,
} from "./provider";
import { randomUUID } from "crypto";

export class MockAdapter implements MessagingProvider {
  readonly name = "mock" as const;

  async sendMessage(input: OutboundMessage): Promise<OutboundResult> {
    const providerMessageId = `mock_${randomUUID()}`;
    console.log(
      `[mock-whatsapp] → ${input.to}: "${input.text.slice(0, 80)}${input.text.length > 80 ? "…" : ""}"`
    );
    return {
      providerMessageId,
      status: "delivered" as DeliveryStatus,
    };
  }

  async getStatus(_providerMessageId: string): Promise<DeliveryStatus> {
    // Mock messages are always "delivered" immediately
    return "delivered";
  }
}
