import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    node_env: process.env.NODE_ENV || 'unknown',
    payfast_configured: !!(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY),
    whatsapp_platform_url: !!process.env.WHATSAPP_PLATFORM_URL,
    webhook_hmac_secret: !!process.env.WEBHOOK_HMAC_SECRET,
    cron_secret: !!process.env.CRON_SECRET,
    clerk_secret: !!process.env.CLERK_SECRET_KEY,
  };

  const allOk = Object.values(checks).every(v => v === true || v === 'production' || v === 'development');
  
  return NextResponse.json({
    status: allOk ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  });
}
