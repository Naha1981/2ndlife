/**
 * EvolutionAdapter — real WhatsApp messaging via Evolution API.
 *
 * Keys are read INSIDE methods (runtime), never at module load.
 * Network failures → return { providerMessageId: 'failed', status: 'failed' },
 * never throw into the webhook path (Evolution retries on 5xx).
 *
 * Evolution API docs: POST {EVOLUTION_API_URL}/message/sendText
 * Headers: x-api-key: {EVOLUTION_API_KEY}
 * Body: { number, text, instanceName? }
 */

import type {
  MessagingProvider,
  OutboundMessage,
  OutboundResult,
  DeliveryStatus,
} from "./provider";

interface EvolutionSendResponse {
  key?: { id?: string };
  message?: string;
  status?: string;
}

export class EvolutionAdapter implements MessagingProvider {
  readonly name = "evolution" as const;

  private getUrl(): string {
    return process.env.EVOLUTION_API_URL ?? "";
  }

  private getKey(): string {
    return process.env.EVOLUTION_API_KEY ?? "";
  }

  async sendMessage(input: OutboundMessage): Promise<OutboundResult> {
    const url = this.getUrl();
    const key = this.getKey();

    if (!url || !key) {
      console.error("[evolution] missing EVOLUTION_API_URL or EVOLUTION_API_KEY");
      return { providerMessageId: "failed", status: "failed" };
    }

    try {
      const body = {
        number: input.to.replace("+", ""), // Evolution expects digits without +
        text: input.text,
      };

      const res = await fetch(`${url}/message/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error(`[evolution] sendText HTTP ${res.status}: ${await res.text().catch(() => "")}`);
        return { providerMessageId: "failed", status: "failed" };
      }

      const data: EvolutionSendResponse = await res.json().catch(() => ({}));
      const providerMessageId = data.key?.id ?? `evo_${Date.now()}`;

      return {
        providerMessageId,
        status: "sent" as DeliveryStatus,
      };
    } catch (err) {
      console.error("[evolution] sendMessage network error:", err instanceof Error ? err.message : err);
      return { providerMessageId: "failed", status: "failed" };
    }
  }

  async getStatus(providerMessageId: string): Promise<DeliveryStatus> {
    const url = this.getUrl();
    const key = this.getKey();

    if (!url || !key || providerMessageId === "failed") {
      return "failed";
    }

    try {
      const res = await fetch(
        `${url}/chat/findStatusMessage?messageId=${encodeURIComponent(providerMessageId)}`,
        {
          headers: { "x-api-key": key },
        }
      );

      if (!res.ok) return "sent"; // assume sent if we can't check

      const data = await res.json().catch(() => ({}));
      const status = data.status ?? data.state ?? "";

      // Map Evolution status to our DeliveryStatus
      if (status === "delivered" || status === "RECEIVED") return "delivered";
      if (status === "read" || status === "READ") return "read";
      if (status === "failed" || status === "ERROR") return "failed";
      if (status === "pending" || status === "PENDING") return "queued";
      return "sent";
    } catch {
      return "sent"; // assume sent on network error
    }
  }
}
