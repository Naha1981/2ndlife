import { PrismaClient } from '@prisma/client';
import { generateAIResponse } from '@/lib/ai/free-router';

const prisma = new PrismaClient();

export async function processJobs() {
  const jobs = await prisma.$queryRaw`
    SELECT id, "appId", "tenantId", "messageId", payload
    FROM "PlatformJob"
    WHERE status = 'pending' AND "runAt" <= NOW()
    ORDER BY "runAt" ASC
    LIMIT 10
    FOR UPDATE SKIP LOCKED
  `.catch(() => []);

  for (const job of jobs as any[]) {
    try {
      const { tenantId, text, from, messageId } = job.payload;
      
      const tenant = await prisma.tenant.findUnique({ 
        where: { id: tenantId },
        include: { services: true } as any
      }).catch(() => null);
      
      if (!tenant) {
        await prisma.platformJob.update({
          where: { id: job.id },
          data: { status: 'failed', lastError: 'tenant_not_found' }
        });
        continue;
      }

      // Opt-out fast-path
      const upper = String(text || '').trim().toUpperCase();
      if (['STOP', 'STOPPE', 'UNSUB'].includes(upper)) {
        await (prisma as any).contact?.updateMany?.({
          where: { tenantId, phone: from },
          data: { optOut: true }
        }).catch(() => {});
        await prisma.platformJob.update({ where: { id: job.id }, data: { status: 'done' } });
        continue;
      }

      const services = (tenant as any).services || [];
      const serviceStr = services.length > 0
        ? services.map((s: any) => `${s.name} (${(s.priceCents || 0) / 100} ZAR)`).join(', ')
        : 'Standard service catalog';

      const systemPrompt = `You are the AI Revenue Employee for ${tenant.name}. 
Industry: ${(tenant as any).industryPack || tenant.industry || 'general'}. 
Services: ${serviceStr}.
Rules: Never invent facts. Be concise. Act like a helpful receptionist.`;

      // USE THE FREE-FIRST ROUTER
      const aiResult = await generateAIResponse({
        system: systemPrompt,
        prompt: text,
      });

      const reply = aiResult.text;

      if (tenant.whatsAppAccountId) {
        await prisma.outboxMessage.create({
          data: {
            accountId: tenant.whatsAppAccountId,
            to: from,
            text: reply,
            status: 'queued',
            traceId: `job-${job.id}-via-${aiResult.provider}`
          }
        });
      }

      await prisma.platformJob.update({
        where: { id: job.id },
        data: { status: 'done', attempts: { increment: 1 } }
      });
    } catch (e: any) {
      await prisma.platformJob.update({
        where: { id: job.id },
        data: { 
          status: 'failed', 
          lastError: e?.message || 'unknown_error', 
          attempts: { increment: 1 } 
        }
      });
    }
  }
}
