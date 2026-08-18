import { NextRequest, NextResponse } from 'next/server';
import { processJobs } from '@/lib/messaging/workers/job-worker';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  
  try {
    const result = await processJobs();
    return NextResponse.json({ status: 'processed', ...(typeof result === 'object' ? result : {}) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
