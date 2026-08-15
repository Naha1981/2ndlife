import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProviderName } from "@/lib/2ndlife/messaging/provider";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/v1/selftest
 * Structured config status — ZERO secret values echoed.
 * Returns 200 if all critical services are at least "ok" or "missing" (graceful).
 */
export async function GET() {
  const status = {
    clerk: !!process.env.CLERK_SECRET_KEY ? "ok" : "missing",
    db: !!process.env.DATABASE_URL ? (db ? "ok" : "failed") : "missing",
    messaging: getProviderName(), // 'evolution' | 'mock'
    evolution: !!process.env.EVOLUTION_API_URL ? "ok" : "not_configured",
    ozow: !!process.env.OZOW_API_KEY ? "ok" : "not_configured",
    openai: !!process.env.OPENAI_API_KEY ? "ok" : "not_configured",
    upstash: !!process.env.UPSTASH_REDIS_REST_URL ? "ok" : "not_configured",
    webhookSecret: !!process.env.EVOLUTION_WEBHOOK_SECRET ? "ok" : "not_configured",
    timestamp: new Date().toISOString(),
  };

  // Healthy = db is ok (everything else is optional for the demo to run)
  const healthy = status.db === "ok";
  return NextResponse.json(
    { status, healthy },
    { status: healthy ? 200 : 503 }
  );
}
