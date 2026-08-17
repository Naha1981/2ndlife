import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Public messaging facade. Business code calls sendWhatsAppMessage(...) only.
 * Resolves tenantId -> whatsAppAccountId, then enqueues to OutboxMessage.
 * The Outbox Dispatcher worker handles the actual delivery via the platform.
 */
export async function sendWhatsAppMessage(opts: { tenantId: string; to: string; text: string }) {
  const tenant = await prisma.tenant.findUnique({ where: { id: opts.tenantId } });
  if (!tenant?.whatsAppAccountId) {
    return { ok: false, error: 'no_whatsapp_account_bound' };
  }

  const msg = await prisma.outboxMessage.create({
    data: {
      accountId: tenant.whatsAppAccountId,
      to: opts.to,
      text: opts.text,
      status: 'queued'
    }
  });

  return { ok: true, id: msg.id };
}

export async function getTenantStatus(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant?.whatsAppAccountId) return { state: 'DISCONNECTED' };
  
  // Delegate to platform client for live status
  const { getAccountStatus } = await import('@/lib/messaging/platform-client');
  return getAccountStatus(tenant.whatsAppAccountId);
}
