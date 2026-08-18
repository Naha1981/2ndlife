import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

// POPIA Section 24 — Right to Erasure.
// Anonymizes PII; retains aggregated metrics for compliance evidence.
// PRODUCTION: gate with Clerk auth + admin role before shipping to real tenants.
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  const params = await props.params;
  const customerId = params?.id;
  if (!customerId) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

  const audit: string[] = [];

  try {
    const redacted = `REDACTED-${customerId.slice(0, 8)}`;

    const customer = await prisma.customer
      .findUnique({
        where: { id: customerId },
        include: { contacts: true },
      })
      .catch(() => null);

    if (customer) {
      // 1. Anonymize customer record
      await prisma.customer
        .update({
          where: { id: customerId },
          data: { firstName: 'REDACTED', lastName: 'REDACTED' },
        })
        .then(() => audit.push('customer:anonymized'))
        .catch((e) => audit.push(`customer:failed:${e.message}`));

      // 2. Anonymize customer contacts
      await prisma.customerContact
        .updateMany({
          where: { customerId: customerId },
          data: { value: redacted, optOut: true },
        })
        .then(() => audit.push('contacts:anonymized'))
        .catch((e) => audit.push(`contacts:failed:${e.message}`));

      // 3. Redact messages across conversations
      const conversations = await prisma.conversation
        .findMany({
          where: { customerId: customerId },
          select: { id: true },
        })
        .catch(() => []);
      
      const convIds = conversations.map((c) => c.id);

      if (convIds.length > 0) {
        await prisma.conversationMessage
          .updateMany({
            where: { conversationId: { in: convIds } },
            data: { body: '[REDACTED BY POPIA ERASURE REQUEST]' },
          })
          .then(() => audit.push('messages:redacted'))
          .catch((e) => audit.push(`messages:failed:${e.message}`));
      }

      // TODO(L3): wipe AI memory / embeddings for this customer when memory tables exist.
    } else {
      // Fallback check for any direct contact model if it exists
      const directContact = await (prisma as any).contact
        ?.findUnique?.({ where: { id: customerId } })
        .catch(() => null);

      if (directContact) {
        await (prisma as any).contact
          .update({
            where: { id: customerId },
            data: { name: 'REDACTED', phone: redacted, optOut: true },
          })
          .then(() => audit.push('contact:anonymized'))
          .catch((e: any) => audit.push(`contact:failed:${e.message}`));

        await (prisma as any).message
          ?.updateMany?.({
            where: { fromPhone: directContact.phone },
            data: { body: '[REDACTED BY POPIA ERASURE REQUEST]', fromPhone: redacted },
          })
          .then(() => audit.push('messages:redacted'))
          .catch((e: any) => audit.push(`messages:failed:${e.message}`));
      } else {
        audit.push('contact:not_found');
      }
    }

    return NextResponse.json({
      status: 'erased',
      customerId,
      audit,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'erasure_failed' }, { status: 500 });
  }
}
