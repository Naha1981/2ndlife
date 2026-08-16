/**
 * LiveSignal Phase A — Type definitions
 *
 * Privacy invariant: raw visitor text is NEVER stored.
 * Only ClassifiedSignal (category + PII-stripped excerpt ≤120 chars) is persisted.
 */

// ─── Signal Categories ────────────────────────────────────────────────────────

export const SIGNAL_CATEGORIES = [
  "price",
  "availability",
  "urgency",
  "financing",
  "value_objection",
  "social_validation",
  "logistics",
  "purchase_intent",
] as const;

export type SignalCategory = (typeof SIGNAL_CATEGORIES)[number];

// ─── Room Mode ────────────────────────────────────────────────────────────────

export type LiveRoomMode = "private" | "community";
// community mode is blocked until Phase B (WebRTC widget)

// ─── Domain shapes ────────────────────────────────────────────────────────────

export interface ClassifiedSignal {
  category: SignalCategory;
  /** PII-stripped, ≤120 chars. Raw text is discarded at ingest. */
  excerpt: string;
  confidence: number; // 0–1
}

export interface IngestPayload {
  /** Anonymous visitor session token — no PII */
  sessionId: string;
  roomId: string;
  tenantId: string;
  /** Raw visitor text — classified + stripped immediately, never persisted */
  rawText: string;
  /** Unix timestamp from the widget */
  ts: number;
  /** HMAC-SHA256 hex of `${ts}.${rawText}` using LIVESIGNAL_WEBHOOK_SECRET */
  signature: string;
  /** Client-generated idempotency key */
  idempotencyKey: string;
}

export interface LiveRoomSummary {
  id: string;
  tenantId: string;
  name: string;
  mode: LiveRoomMode;
  isActive: boolean;
  signalCount: number;
  leadCount: number;
  createdAt: string;
}

export interface LiveSignalRow {
  id: string;
  tenantId: string;
  roomId: string;
  category: SignalCategory;
  /** PII-stripped excerpt — never raw */
  excerpt: string;
  promotedToRadar: boolean;
  occurrences: number;
  createdAt: string;
}

export interface LiveLeadRow {
  id: string;
  tenantId: string;
  roomId: string;
  sessionId: string;
  signalIds: string[]; // deserialized from JSON column
  handoffSent: boolean;
  handoffAt: string | null;
  consentStatus: "pending" | "granted" | "denied";
  createdAt: string;
}

// ─── Demo harness (never writes to DB) ───────────────────────────────────────

export interface SimulatedEvent {
  type: "signal" | "lead_created" | "handoff_queued" | "proof_submitted";
  category?: SignalCategory;
  excerpt?: string;
  label: string;
  delayMs: number;
}
