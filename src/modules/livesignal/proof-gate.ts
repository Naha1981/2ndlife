/**
 * LiveSignal — Proof Consent Gate
 *
 * Publishing a visitor's question/session as "social proof" is
 * BLOCKED until that lead's consentStatus is 'granted'.
 * This is a hard gate — no UI flag can override it.
 */

import type { LiveLeadRow } from "./types";

/**
 * Returns true only when consent has been explicitly granted.
 * Defaults to false for pending or denied status.
 *
 * Verification row 7: negative test — canPublishProof must return false
 * for any status other than 'granted'.
 */
export function canPublishProof(lead: Pick<LiveLeadRow, "consentStatus">): boolean {
  return lead.consentStatus === "granted";
}

/**
 * Returns a human-readable reason why proof is blocked.
 * Used by the Proof Inbox UI to display context.
 */
export function proofBlockReason(lead: Pick<LiveLeadRow, "consentStatus">): string | null {
  switch (lead.consentStatus) {
    case "granted":
      return null;
    case "pending":
      return "Awaiting visitor consent. Send consent request via WhatsApp.";
    case "denied":
      return "Visitor declined consent. This session cannot be published as proof.";
    default:
      return "Unknown consent status.";
  }
}

/**
 * Validates that a consent status value is legal.
 */
export function isValidConsentStatus(value: unknown): value is LiveLeadRow["consentStatus"] {
  return value === "pending" || value === "granted" || value === "denied";
}
