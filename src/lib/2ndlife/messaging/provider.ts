/**
 * 2ndLife — Messaging Provider Interface
 *
 * PERMANENT RULE: ALL outbound WhatsApp sends go through getMessagingProvider() ONLY.
 * No other file may call Evolution HTTP directly. This is the Single Authority for
 * outbound messaging.
 *
 * In demo mode (no EVOLUTION_API_URL/KEY), MockAdapter is used — labeled in the UI.
 * In production (keys present), EvolutionAdapter makes real HTTP calls.
 */

import { EvolutionAdapter } from "./evolution-adapter";
import { MockAdapter } from "./mock-adapter";

export type DeliveryStatus =
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "queued";

export interface OutboundMessage {
  tenantId: string;
  to: string; // E.164 format: +27721234567
  text: string;
  conversationId?: string;
}

export interface OutboundResult {
  providerMessageId: string;
  status: DeliveryStatus;
}

export interface InboundEvent {
  provider: "evolution" | "mock";
  providerEventId: string;
  tenantId: string | null;
  from: string; // E.164 format
  text: string;
  receivedAt: string; // ISO
  raw: unknown;
}

export interface MessagingProvider {
  readonly name: "evolution" | "mock";
  sendMessage(input: OutboundMessage): Promise<OutboundResult>;
  getStatus(providerMessageId: string): Promise<DeliveryStatus>;
}

/**
 * Factory: returns EvolutionAdapter if configured, else MockAdapter.
 * Keys are read INSIDE adapter methods (runtime), never at module load.
 * Both adapters are statically imported — no HTTP calls happen at import time.
 */
export function getMessagingProvider(): MessagingProvider {
  if (process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY) {
    return new EvolutionAdapter();
  }
  return new MockAdapter();
}

/**
 * Sync version for UI display — returns provider name without instantiating.
 */
export function getProviderName(): "evolution" | "mock" {
  if (process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY) {
    return "evolution";
  }
  return "mock";
}
