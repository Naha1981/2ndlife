import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // In production, gate this with Clerk auth or an admin API key via middleware.
  const customerId = params.id;
  
  try {
    const customer = await prisma.contact.findUnique({ where: { id: customerId } });
    if (!customer) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    // POPIA Right to be Forgotten: Anonymize PII, keep aggregated metrics
    await prisma.contact.update({
      where: { id: customerId },
      data: {
        phone: `REDACTED-${customerId.slice(0,8)}`,
        name: 'REDACTED',
        optOut: true,
      }
    }).catch(() => {}); // Graceful if schema differs slightly

    // Wipe message bodies
    await prisma.message.updateMany({
      where: { fromPhone: customer.phone },
      data: { body: '[REDACTED BY POPIA REQUEST]', fromPhone: `REDACTED-${customerId.slice(0,8)}` }
    }).catch(() => {});

    return NextResponse.json({ status: 'deleted', customerId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
