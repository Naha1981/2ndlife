/**
 * LiveSignal — Demo Harness
 *
 * Generates realistic simulated visitor activity for 3 packs.
 * NEVER writes to DB — purely client-side animation data.
 * Used by the "Simulate visitor activity" button in the owner UI.
 */

import type { SignalCategory, SimulatedEvent } from "./types";

interface DemoScript {
  packSlug: string;
  packLabel: string;
  events: SimulatedEvent[];
}

/** Realistic demo scripts for the 3 showcase packs. */
const DEMO_SCRIPTS: DemoScript[] = [
  // ── Pack 1: Funeral Insurance ─────────────────────────────────────────────
  {
    packSlug: "funeral-insurance",
    packLabel: "Funeral Insurance",
    events: [
      {
        type: "signal",
        category: "price",
        excerpt: "How much is the monthly premium for a family of 5?",
        label: "Visitor asked about premium pricing",
        delayMs: 800,
      },
      {
        type: "signal",
        category: "financing",
        excerpt: "Can I pay via debit order or is there another option?",
        label: "Visitor asked about payment options",
        delayMs: 2200,
      },
      {
        type: "lead_created",
        label: "Anonymous lead created (session visitor-d4f2)",
        delayMs: 3000,
      },
      {
        type: "signal",
        category: "value_objection",
        excerpt: "Not sure if I need the extended family cover right now",
        label: "Visitor expressed hesitation on cover scope",
        delayMs: 4500,
      },
      {
        type: "signal",
        category: "price",
        excerpt: "What happens if I miss a payment — any grace period?",
        label: "Second price signal → category threshold rising",
        delayMs: 6000,
      },
      {
        type: "signal",
        category: "price",
        excerpt: "Is there a cheaper plan for just 2 adults?",
        label: "3rd price signal → promoted to Demand Radar ✦",
        delayMs: 7500,
      },
      {
        type: "handoff_queued",
        label: 'Contextual WhatsApp queued: "You asked about premium pricing…"',
        delayMs: 8200,
      },
    ],
  },

  // ── Pack 2: Home Services ─────────────────────────────────────────────────
  {
    packSlug: "home-services",
    packLabel: "Home Services",
    events: [
      {
        type: "signal",
        category: "urgency",
        excerpt: "Burst pipe — flooding right now, need someone ASAP!",
        label: "🚨 Urgency intercept triggered (home-services)",
        delayMs: 500,
      },
      {
        type: "lead_created",
        label: "Anonymous lead created (session visitor-b7c1)",
        delayMs: 1200,
      },
      {
        type: "signal",
        category: "availability",
        excerpt: "Are you available today? Even tonight?",
        label: "Visitor confirmed same-day availability need",
        delayMs: 2800,
      },
      {
        type: "signal",
        category: "price",
        excerpt: "How much for emergency call-out after hours?",
        label: "Visitor asked for emergency pricing",
        delayMs: 4000,
      },
      {
        type: "signal",
        category: "urgency",
        excerpt: "No hot water since this morning — kitchen is soaked",
        label: "2nd urgency signal → handoff threshold met",
        delayMs: 5200,
      },
      {
        type: "handoff_queued",
        label: 'Contextual WhatsApp queued: "You reported a burst pipe emergency…"',
        delayMs: 5800,
      },
      {
        type: "signal",
        category: "urgency",
        excerpt: "Need this sorted within the hour if possible",
        label: "3rd urgency signal → promoted to Demand Radar ✦",
        delayMs: 7000,
      },
    ],
  },

  // ── Pack 3: Subscriptions ─────────────────────────────────────────────────
  {
    packSlug: "subscriptions",
    packLabel: "Subscriptions",
    events: [
      {
        type: "signal",
        category: "value_objection",
        excerpt: "I cancelled because it felt like I wasn't using it enough",
        label: "Visitor signalled usage-based churn reason",
        delayMs: 1000,
      },
      {
        type: "signal",
        category: "social_validation",
        excerpt: "I heard good things from a colleague — what are your reviews like?",
        label: "Visitor seeking social validation",
        delayMs: 2500,
      },
      {
        type: "lead_created",
        label: "Anonymous lead created (session visitor-a9e3)",
        delayMs: 3200,
      },
      {
        type: "signal",
        category: "financing",
        excerpt: "Do you have a pause option instead of full cancellation?",
        label: "Visitor open to alternative to cancelling",
        delayMs: 4800,
      },
      {
        type: "signal",
        category: "purchase_intent",
        excerpt: "Actually, I'd like to restart — how do I reactivate?",
        label: "Purchase intent detected → priority conversion",
        delayMs: 6200,
      },
      {
        type: "handoff_queued",
        label: 'Contextual WhatsApp queued: "You asked about reactivating your plan…"',
        delayMs: 6900,
      },
      {
        type: "proof_submitted",
        label: "Proof consent requested for visitor session",
        delayMs: 8500,
      },
    ],
  },
];

/**
 * Returns the demo script for a given pack slug.
 * Falls back to subscriptions if pack not found.
 * NEVER writes to DB.
 */
export function getDemoScript(packSlug: string): DemoScript {
  return DEMO_SCRIPTS.find((s) => s.packSlug === packSlug) ?? DEMO_SCRIPTS[2];
}

/**
 * Returns all available demo scripts (for the pack selector in the UI).
 */
export function getAllDemoScripts(): DemoScript[] {
  return DEMO_SCRIPTS;
}

/**
 * Generates a flat list of all events across all packs.
 * Used for testing that the harness never attempts DB operations.
 */
export function generateDemoActivity(packSlug: string): SimulatedEvent[] {
  return getDemoScript(packSlug).events;
}

// Type export for UI
export type { DemoScript };
