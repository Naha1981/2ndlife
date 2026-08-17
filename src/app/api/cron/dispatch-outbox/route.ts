import { NextRequest, NextResponse } from 'next/server';
import { dispatchOutbox } from '@/lib/messaging/workers/outbox-dispatcher';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  
  try {
    await dispatchOutbox();
    return NextResponse.json({ status: 'dispatched' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
