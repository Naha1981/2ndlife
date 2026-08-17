if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") { console.log("Seeding blocked in production."); process.exit(0); }
/**
 * 2ndLife Revenue OS — Scoring Engine Tests
 *
 * Verifies:
 * 1. Determinism: same input ⇒ same score
 * 2. Max score = 100 (all factors maxed)
 * 3. Zero contactability when no phone/email/whatsapp
 * 4. Weights sum to 100
 * 5. Recommended action thresholds
 * 6. Reasons and risks generated correctly
 *
 * Run: bun run scripts/test-scoring.ts
 */

import {
  scoreCustomer,
  type ScorableCustomer,
} from "../src/modules/recovery/scoring";

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ ${msg}`);
    failed++;
  }
}

function assertEqual(actual: unknown, expected: unknown, msg: string) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (pass) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ ${msg} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
    failed++;
  }
}

async function main() {
  console.log("🧪 2ndLife Scoring Engine Tests\n");

  // ─── Test 1: Determinism ───
  console.log("Test 1: Determinism (same input → same score)");
  const customer: ScorableCustomer = {
    lifetimeValue: 7200,
    monthsInactive: 8,
    paymentSuccessRatio: 0.9,
    hasWhatsapp: true,
    hasPhone: true,
    hasEmail: true,
    offerAvailable: true,
    previouslyEngaged: true,
    previouslyContacted: true,
    fields: { name: true, phone: true, email: true, amount: true },
  };
  const result1 = scoreCustomer(customer);
  const result2 = scoreCustomer(customer);
  assertEqual(result1.score, result2.score, "Same input produces same score");
  assertEqual(result1.breakdown, result2.breakdown, "Same input produces same breakdown");
  assertEqual(result1.reasons, result2.reasons, "Same input produces same reasons");
  console.log("");

  // ─── Test 2: Max score = 100 ───
  console.log("Test 2: Maximum score = 100 (all factors maxed)");
  const maxCustomer: ScorableCustomer = {
    lifetimeValue: 10000, // 25
    monthsInactive: 1, // 20
    paymentSuccessRatio: 0.95, // 15
    hasWhatsapp: true, // 15
    hasPhone: true,
    hasEmail: true,
    offerAvailable: true, // 10
    previouslyEngaged: true, // 10
    previouslyContacted: true,
    fields: { name: true, phone: true, email: true, amount: true }, // 5
  };
  const maxResult = scoreCustomer(maxCustomer);
  assertEqual(maxResult.score, 100, "Max customer scores 100");
  assertEqual(
    Object.values(maxResult.breakdown).reduce((a, x) => a + x, 0),
    100,
    "Breakdown sums to 100"
  );
  console.log("");

  // ─── Test 3: Weights sum to 100 ───
  console.log("Test 3: Factor weights sum to 100");
  const maxBreakdown = maxResult.breakdown;
  assertEqual(maxBreakdown.value, 25, "Historical value weight = 25");
  assertEqual(maxBreakdown.recency, 20, "Recency weight = 20");
  assertEqual(maxBreakdown.payment, 15, "Payment history weight = 15");
  assertEqual(maxBreakdown.contactability, 15, "Contactability weight = 15");
  assertEqual(maxBreakdown.offer, 10, "Offer availability weight = 10");
  assertEqual(maxBreakdown.engagement, 10, "Prior engagement weight = 10");
  assertEqual(maxBreakdown.completeness, 5, "Data completeness weight = 5");
  console.log("");

  // ─── Test 4: Zero contactability ───
  console.log("Test 4: Zero contactability when no phone/email/whatsapp");
  const noContact: ScorableCustomer = {
    lifetimeValue: 5000,
    monthsInactive: 2,
    paymentSuccessRatio: 0.9,
    hasWhatsapp: false,
    hasPhone: false,
    hasEmail: false,
    offerAvailable: true,
    previouslyEngaged: false,
    previouslyContacted: false,
    fields: { name: true, phone: false, email: false, amount: true },
  };
  const noContactResult = scoreCustomer(noContact);
  assertEqual(noContactResult.breakdown.contactability, 0, "No contact methods → contactability = 0");
  assert(!noContactResult.reasons.includes("+ valid WhatsApp number"), "No WhatsApp reason when no WhatsApp");
  console.log("");

  // ─── Test 5: Contactability hierarchy ───
  console.log("Test 5: Contactability hierarchy (WhatsApp > phone > email)");
  const emailOnly: ScorableCustomer = { ...noContact, hasEmail: true };
  assertEqual(scoreCustomer(emailOnly).breakdown.contactability, 5, "Email only → 5");
  const phoneOnly: ScorableCustomer = { ...noContact, hasPhone: true };
  assertEqual(scoreCustomer(phoneOnly).breakdown.contactability, 10, "Phone only → 10");
  const whatsappOnly: ScorableCustomer = { ...noContact, hasWhatsapp: true };
  assertEqual(scoreCustomer(whatsappOnly).breakdown.contactability, 15, "WhatsApp → 15");
  console.log("");

  // ─── Test 6: Recommended action thresholds ───
  console.log("Test 6: Recommended action thresholds");
  assertEqual(maxResult.recommendedAction, "whatsapp_winback", "Score ≥70 + WhatsApp → whatsapp_winback");
  const highScoreNoWhatsapp: ScorableCustomer = { ...maxCustomer, hasWhatsapp: false, hasPhone: true };
  assertEqual(
    scoreCustomer(highScoreNoWhatsapp).recommendedAction,
    "manual_call",
    "Score ≥70 + no WhatsApp → manual_call"
  );
  const midScore: ScorableCustomer = {
    lifetimeValue: 1000,
    monthsInactive: 6,
    paymentSuccessRatio: 0.7,
    hasWhatsapp: false,
    hasPhone: false,
    hasEmail: true,
    offerAvailable: true,
    previouslyEngaged: false,
    previouslyContacted: true,
    fields: { name: true, phone: false, email: true, amount: true },
  };
  const midResult = scoreCustomer(midScore);
  assert(midResult.score >= 40 && midResult.score < 70, `Mid score in [40,70): got ${midResult.score}`);
  assertEqual(midResult.recommendedAction, "nurture_email", "Score 40-69 → nurture_email");
  const lowScore: ScorableCustomer = {
    lifetimeValue: 0,
    monthsInactive: 36,
    paymentSuccessRatio: 0.3,
    hasWhatsapp: false,
    hasPhone: false,
    hasEmail: false,
    offerAvailable: false,
    previouslyEngaged: false,
    previouslyContacted: false,
    fields: { name: false, phone: false, email: false, amount: false },
  };
  const lowResult = scoreCustomer(lowScore);
  assert(lowResult.score < 40, `Low score < 40: got ${lowResult.score}`);
  assertEqual(lowResult.recommendedAction, "suppress_review", "Score < 40 → suppress_review");
  console.log("");

  // ─── Test 7: Reasons and risks ───
  console.log("Test 7: Reasons and risks generated correctly");
  assert(maxResult.reasons.includes("+ high historical value"), "High LTV → + high historical value reason");
  assert(maxResult.reasons.includes("+ valid WhatsApp number"), "WhatsApp → + valid WhatsApp number reason");
  const inactiveCustomer: ScorableCustomer = { ...maxCustomer, monthsInactive: 10 };
  const inactiveResult = scoreCustomer(inactiveCustomer);
  assert(
    inactiveResult.risks.some((r) => r.includes("inactive for 10 months")),
    "Inactive 10 months → risk pushed"
  );
  console.log("");

  // ─── Test 8: Score clamped to [0, 100] ───
  console.log("Test 8: Score clamped to [0, 100]");
  assert(maxResult.score <= 100, "Score never exceeds 100");
  assert(lowResult.score >= 0, "Score never below 0");
  console.log("");

  // ─── Test 9: Null handling ───
  console.log("Test 9: Null field handling (graceful defaults)");
  const nullCustomer: ScorableCustomer = {
    lifetimeValue: null,
    monthsInactive: null,
    paymentSuccessRatio: null,
    hasWhatsapp: false,
    hasPhone: false,
    hasEmail: true,
    offerAvailable: false,
    previouslyEngaged: null,
    previouslyContacted: null,
    fields: { name: false, phone: false, email: false, amount: false },
  };
  const nullResult = scoreCustomer(nullCustomer);
  assert(nullResult.score > 0, "Null customer still gets a score");
  assertEqual(nullResult.breakdown.value, 5, "Null LTV → 5 (lowest tier)");
  assertEqual(nullResult.breakdown.recency, 6, "Null months → 24 (default) → 6");
  assertEqual(nullResult.breakdown.payment, 5, "Null payment ratio → 5");
  console.log("");

  // ─── Summary ───
  console.log("──────────────────────────────");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  }
  console.log("\n🎉 All scoring engine tests passed!");
}

main().catch((e) => {
  console.error("❌ Test suite failed:", e);
  process.exit(1);
});
