import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const prisma = new PrismaClient();
  const startedAt = Date.now();

  const checks: Record<string, unknown> = {
    node_env: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
  };

  // Database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'fail';
  }

  // Required secrets present (NEVER log values)
  checks.clerk_secret = !!process.env.CLERK_SECRET_KEY;
  checks.clerk_publishable = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  checks.whatsapp_platform_url = !!process.env.WHATSAPP_PLATFORM_URL;
  checks.webhook_hmac_secret = !!process.env.WEBHOOK_HMAC_SECRET;
  checks.cron_secret = !!process.env.CRON_SECRET;
  checks.payfast_merchant_id = !!process.env.PAYFAST_MERCHANT_ID;
  checks.payfast_merchant_key = !!process.env.PAYFAST_MERCHANT_KEY;
  checks.ai_api_key = !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);

  const failed = Object.entries(checks)
    .filter(([, v]) => v === 'fail' || v === false)
    .map(([k]) => k);

  return NextResponse.json({
    status: failed.length === 0 ? 'ok' : 'degraded',
    checks,
    failed,
    duration_ms: Date.now() - startedAt,
  });
}
