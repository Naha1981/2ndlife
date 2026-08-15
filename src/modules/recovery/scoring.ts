/**
 * 2ndLife Revenue OS — Deterministic Scoring Engine
 *
 * The core logic for the Recovery Pillar. Scores customers 0–100 based on
 * 7 weighted factors (weights sum to 100). Same input ⇒ same score (deterministic).
 *
 * Factors:
 *  1. Historical value (25) — LTV
 *  2. Recency (20) — months inactive
 *  3. Payment history (15) — success ratio
 *  4. Contactability (15) — WhatsApp > phone > email
 *  5. Offer availability (10) — product live
 *  6. Prior engagement (10) — responded before
 *  7. Data completeness (5) — required fields present
 */

export interface ScorableCustomer {
  lifetimeValue: number | null;
  monthsInactive: number | null;
  paymentSuccessRatio: number | null; // 0..1
  hasWhatsapp: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  offerAvailable: boolean;
  previouslyEngaged: boolean | null;
  previouslyContacted: boolean | null;
  fields: { name: boolean; phone: boolean; email: boolean; amount: boolean };
}

export interface ScoreResult {
  score: number;
  breakdown: Record<string, number>;
  reasons: string[];
  risks: string[];
  recommendedAction: string;
}

export function scoreCustomer(c: ScorableCustomer): ScoreResult {
  const reasons: string[] = [];
  const risks: string[] = [];
  const b: Record<string, number> = {};

  // 1 Historical value (25)
  const ltv = c.lifetimeValue ?? 0;
  b.value = ltv >= 5000 ? 25 : ltv >= 2000 ? 20 : ltv >= 500 ? 15 : ltv > 0 ? 10 : 5;
  if (b.value >= 20) reasons.push("+ high historical value");

  // 2 Recency (20)
  const m = c.monthsInactive ?? 24;
  b.recency = m <= 3 ? 20 : m <= 6 ? 15 : m <= 12 ? 10 : m <= 24 ? 6 : 2;
  if (m >= 8) risks.push(`- inactive for ${m} months`);

  // 3 Payment history (15)
  const r = c.paymentSuccessRatio;
  b.payment = r == null ? 5 : r >= 0.9 ? 15 : r >= 0.7 ? 11 : r >= 0.5 ? 7 : 3;

  // 4 Contactability (15)
  b.contactability = c.hasWhatsapp ? 15 : c.hasPhone ? 10 : c.hasEmail ? 5 : 0;
  if (c.hasWhatsapp) reasons.push("+ valid WhatsApp number");

  // 5 Offer availability (10)
  b.offer = c.offerAvailable ? 10 : 4;

  // 6 Prior engagement (10)
  b.engagement = c.previouslyEngaged ? 10 : c.previouslyContacted ? 5 : 4;

  // 7 Data completeness (5)
  const present = Object.values(c.fields).filter(Boolean).length;
  b.completeness = Math.round((present / 4) * 5);

  const score = Math.max(0, Math.min(100, Object.values(b).reduce((a, x) => a + x, 0)));
  const recommendedAction =
    score >= 70 && c.hasWhatsapp
      ? "whatsapp_winback"
      : score >= 70
      ? "manual_call"
      : score >= 40
      ? "nurture_email"
      : "suppress_review";

  return { score, breakdown: b, reasons, risks, recommendedAction };
}
