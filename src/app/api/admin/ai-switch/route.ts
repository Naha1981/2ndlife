import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/guard';
import { getAiEnabled, setAiEnabled } from '@/lib/admin/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireSuperAdmin();
    const on = await getAiEnabled();
    return NextResponse.json({ on });
  } catch (err: any) {
    const status = err?.message?.includes('Forbidden') ? 403 : 401;
    return NextResponse.json({ error: err?.message || 'Unauthorized' }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await req.json();
    const on = Boolean(body?.on);
    await setAiEnabled(on);
    return NextResponse.json({ ok: true, on });
  } catch (err: any) {
    const status = err?.message?.includes('Forbidden') ? 403 : 401;
    return NextResponse.json({ error: err?.message || 'Unauthorized' }, { status });
  }
}
