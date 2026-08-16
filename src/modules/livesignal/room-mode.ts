/**
 * LiveSignal — Room Mode per Industry Pack
 *
 * financial_protection (funeral-insurance, financial-services) and
 * clinical (healthcare) are ALWAYS private — never community.
 *
 * community mode is blocked in Phase A anyway, but this module
 * enforces the invariant at the data layer so no UI bug can override it.
 */

import type { LiveRoomMode } from "./types";

/** Packs that are permanently forced to private, regardless of DB value. */
const ALWAYS_PRIVATE_SLUGS = new Set([
  "funeral-insurance",
  "financial-services",
  "healthcare",
  "clinical",
  "financial_protection", // alternate slug form
]);

/**
 * Returns the effective room mode for a given pack slug.
 * Overrides any DB-stored value to "private" for sensitive packs.
 */
export function effectiveRoomMode(packSlug: string, storedMode: LiveRoomMode = "private"): LiveRoomMode {
  if (ALWAYS_PRIVATE_SLUGS.has(packSlug)) return "private";
  return storedMode;
}

/**
 * Returns true if the pack is allowed to use community mode.
 * (Blocked in Phase A for all packs regardless.)
 */
export function canUseCommunityMode(packSlug: string): boolean {
  if (ALWAYS_PRIVATE_SLUGS.has(packSlug)) return false;
  // Phase B gate — community requires WebRTC widget
  return false; // BLOCKED until Phase B verified
}

/** Default liveRoomMode per pack slug. Used when creating a new LiveRoom. */
export const PACK_DEFAULT_MODE: Record<string, LiveRoomMode> = {
  "funeral-insurance": "private",
  "financial-services": "private",
  "healthcare": "private",
  "clinical": "private",
  "subscriptions": "private",
  "education": "private",
  "home-services": "private",
  "real-estate": "private",
  "automotive": "private",
  "retail": "private",
  "b2b-services": "private",
  "fitness": "private",
  "general": "private",
};

export function getDefaultMode(packSlug: string): LiveRoomMode {
  return PACK_DEFAULT_MODE[packSlug] ?? "private";
}
