/**
 * LiveSignal — Deterministic Keyword Classifier
 *
 * Pure function, zero I/O, zero env dependencies.
 * Each category has a weighted keyword map. The category with the
 * highest accumulated score wins. Ties resolve to 'purchase_intent'.
 *
 * Privacy: stripAndExcerpt() removes PII patterns before any storage.
 */

import type { ClassifiedSignal, SignalCategory } from "./types";

// ─── Keyword rule tables ──────────────────────────────────────────────────────
// Each entry: [keyword/phrase, weight]
// Weights: 3 = strong signal, 2 = moderate, 1 = weak

const RULES: Record<SignalCategory, [string, number][]> = {
  price: [
    ["how much", 3],
    ["what does it cost", 3],
    ["price", 3],
    ["cost", 2],
    ["expensive", 2],
    ["cheap", 2],
    ["afford", 2],
    ["quote", 2],
    ["pricing", 3],
    ["fee", 2],
    ["rate", 2],
    ["charge", 2],
    ["tariff", 2],
    ["per month", 2],
    ["monthly", 1],
    ["annual fee", 2],
    ["too expensive", 3],
    ["cheaper", 3],
    ["better price", 3],
    ["discount", 2],
    ["premium", 2],
  ],
  availability: [
    ["available", 3],
    ["available now", 3],
    ["in stock", 3],
    ["when can", 2],
    ["slot", 2],
    ["appointment", 2],
    ["open", 1],
    ["opening hours", 2],
    ["do you have", 2],
    ["is there", 1],
    ["can i get", 2],
    ["still available", 3],
    ["book", 2],
    ["next available", 3],
    ["waiting list", 3],
    ["capacity", 2],
  ],
  urgency: [
    ["urgent", 3],
    ["emergency", 3],
    ["asap", 3],
    ["immediately", 3],
    ["right now", 3],
    ["today", 2],
    ["tonight", 2],
    ["tomorrow", 1],
    ["quickly", 2],
    ["fast", 2],
    ["as soon as", 2],
    ["deadline", 3],
    ["last minute", 3],
    ["same day", 3],
    ["within the hour", 3],
    ["help", 1],
    ["need now", 3],
    ["broken", 2],
    ["leak", 3],
    ["burst pipe", 3],
    ["no hot water", 3],
    ["power outage", 3],
    ["flooding", 3],
  ],
  financing: [
    ["finance", 3],
    ["financing", 3],
    ["installment", 3],
    ["instalments", 3],
    ["payment plan", 3],
    ["lay-by", 3],
    ["layby", 3],
    ["credit", 2],
    ["loan", 2],
    ["deposit", 2],
    ["upfront", 1],
    ["monthly payment", 2],
    ["interest", 2],
    ["interest free", 3],
    ["0%", 3],
    ["split payment", 3],
    ["eft", 1],
    ["ozow", 2],
    ["debit order", 2],
    ["no deposit", 3],
  ],
  value_objection: [
    ["not sure", 2],
    ["thinking about it", 3],
    ["maybe", 1],
    ["compare", 2],
    ["comparison", 2],
    ["vs", 1],
    ["versus", 1],
    ["competitor", 2],
    ["better deal", 3],
    ["cheaper elsewhere", 3],
    ["seen it cheaper", 3],
    ["is it worth", 3],
    ["worth it", 2],
    ["not convinced", 3],
    ["still deciding", 3],
    ["considering", 2],
    ["alternative", 2],
    ["why should i", 3],
    ["difference between", 2],
    ["what makes you", 2],
  ],
  social_validation: [
    ["review", 2],
    ["reviews", 2],
    ["testimonial", 2],
    ["rating", 2],
    ["stars", 1],
    ["recommended", 2],
    ["who else", 2],
    ["other customers", 2],
    ["trust", 2],
    ["verified", 1],
    ["google", 1],
    ["trustpilot", 2],
    ["people say", 2],
    ["heard good things", 3],
    ["friend told me", 3],
    ["success story", 2],
    ["case study", 2],
    ["proven", 2],
    ["experience", 1],
  ],
  logistics: [
    ["deliver", 2],
    ["delivery", 2],
    ["shipping", 2],
    ["where are you", 2],
    ["location", 2],
    ["address", 2],
    ["area", 1],
    ["travel", 1],
    ["near me", 3],
    ["come to me", 3],
    ["on-site", 2],
    ["remote", 1],
    ["collect", 2],
    ["collection", 2],
    ["how long", 1],
    ["lead time", 2],
    ["days to arrive", 2],
    ["turnaround", 2],
    ["installation", 2],
    ["on location", 2],
  ],
  purchase_intent: [
    ["i want", 3],
    ["i'd like", 3],
    ["i would like", 3],
    ["i need", 2],
    ["buy", 3],
    ["purchase", 3],
    ["sign up", 3],
    ["sign me up", 3],
    ["get started", 3],
    ["let's do it", 3],
    ["proceed", 2],
    ["ready", 2],
    ["take it", 3],
    ["order", 2],
    ["confirm", 2],
    ["book it", 3],
    ["yes", 1],
    ["sure", 1],
    ["sounds good", 2],
    ["where do i pay", 3],
    ["send me a link", 3],
    ["how do i pay", 3],
  ],
};

// ─── PII removal patterns ─────────────────────────────────────────────────────

const PII_PATTERNS: RegExp[] = [
  // SA phone numbers
  /(?:\+27|0)[6-8]\d{8}/g,
  // email addresses
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
  // SA ID numbers (13 digits)
  /\b\d{13}\b/g,
  // Credit card-like (4 groups of 4)
  /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Strip PII patterns from text and truncate to 120 chars.
 * This MUST be called before any DB write.
 */
export function stripAndExcerpt(rawText: string): string {
  let clean = rawText;
  for (const pattern of PII_PATTERNS) {
    clean = clean.replace(pattern, "[redacted]");
  }
  return clean.slice(0, 120).trim();
}

/**
 * Classify raw visitor text into a SignalCategory.
 * Pure function — no I/O, no env dependencies.
 */
export function classify(rawText: string): ClassifiedSignal {
  const lower = rawText.toLowerCase();
  const scores: Record<SignalCategory, number> = {
    price: 0,
    availability: 0,
    urgency: 0,
    financing: 0,
    value_objection: 0,
    social_validation: 0,
    logistics: 0,
    purchase_intent: 0,
  };

  for (const [cat, rules] of Object.entries(RULES) as [SignalCategory, [string, number][]][]) {
    for (const [keyword, weight] of rules) {
      if (lower.includes(keyword)) {
        scores[cat] += weight;
      }
    }
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const best = (Object.entries(scores) as [SignalCategory, number][]).reduce(
    (prev, curr) => (curr[1] > prev[1] ? curr : prev),
    ["purchase_intent" as SignalCategory, 0]
  );

  const category = best[1] === 0 ? "purchase_intent" : best[0];
  const confidence = totalScore === 0 ? 0 : best[1] / totalScore;

  return {
    category,
    excerpt: stripAndExcerpt(rawText),
    confidence: Math.min(1, confidence),
  };
}

/**
 * Golden test suite — exported for the selftest API route.
 * 15 cases covering all 8 categories + home-services urgency intercept.
 */
export const GOLDEN_SUITE: { input: string; expected: SignalCategory; label: string }[] = [
  // price (2)
  { input: "How much does this cost per month?", expected: "price", label: "price-1" },
  { input: "That sounds too expensive for us right now", expected: "price", label: "price-2" },
  // availability (2)
  { input: "Are you still available this weekend?", expected: "availability", label: "avail-1" },
  { input: "Do you have any slots open tomorrow?", expected: "availability", label: "avail-2" },
  // urgency (2)
  { input: "I have an emergency — burst pipe, flooding right now!", expected: "urgency", label: "urgency-1" },
  { input: "Need this fixed ASAP, same day please", expected: "urgency", label: "urgency-2" },
  // financing (2)
  { input: "Do you offer a payment plan or installments?", expected: "financing", label: "financing-1" },
  { input: "Can I pay interest free over 6 months?", expected: "financing", label: "financing-2" },
  // value_objection (1)
  { input: "I've seen it cheaper elsewhere, why should I choose you?", expected: "value_objection", label: "value-1" },
  // social_validation (1)
  { input: "A friend told me about you — do you have reviews?", expected: "social_validation", label: "social-1" },
  // logistics (1)
  { input: "Can you come to me? I'm near Sandton", expected: "logistics", label: "logistics-1" },
  // purchase_intent (2)
  { input: "I want to sign up today, where do I pay?", expected: "purchase_intent", label: "intent-1" },
  { input: "Let's do it — send me the payment link", expected: "purchase_intent", label: "intent-2" },
  // home-services urgency intercept (verification row 13)
  { input: "No hot water since this morning, need someone urgently", expected: "urgency", label: "home-urgency-1" },
  // financing vs price disambiguation
  { input: "The price is fine but I'd need to do installments", expected: "financing", label: "financing-3" },
];
