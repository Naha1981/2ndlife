/**
 * GET /api/v1/livesignal/selftest
 *
 * Runs the classifier golden suite (15 cases, all 8 categories).
 * Returns structured pass/fail results — used for verification row 4.
 * Zero-env: no secrets required.
 */

import { NextResponse } from "next/server";
import { classify, GOLDEN_SUITE } from "@/modules/livesignal/classifier";

export async function GET() {
  const results = GOLDEN_SUITE.map((tc) => {
    const result = classify(tc.input);
    const pass = result.category === tc.expected;
    return {
      label: tc.label,
      input: tc.input,
      expected: tc.expected,
      got: result.category,
      confidence: result.confidence.toFixed(2),
      pass,
    };
  });

  const totalPass = results.filter((r) => r.pass).length;
  const totalFail = results.filter((r) => !r.pass).length;

  return NextResponse.json({
    suite: "LiveSignal Classifier Golden Suite",
    version: "phase-a",
    total: results.length,
    pass: totalPass,
    fail: totalFail,
    allPass: totalFail === 0,
    results,
  });
}
