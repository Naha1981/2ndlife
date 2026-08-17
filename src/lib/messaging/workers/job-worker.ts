import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const prisma = new PrismaClient();

export async function processJobs() {
  const jobs = await prisma.$queryRaw`
    SELECT id, "appId", "tenantId", "messageId", payload
    FROM "PlatformJob"
    WHERE status = 'pending' AND "runAt" <= NOW()
    ORDER BY "runAt" ASC
    LIMIT 10
    FOR UPDATE SKIP LOCKED
  `;

  for (const job of jobs as any[]) {
    try {
      const { tenantId, text, from, messageId } = job.payload;
      
      // Load tenant's Business Brain (services, pricing, guardrails)
      const tenant = await prisma.tenant.findUnique({ 
        where: { id: tenantId },
        include: { services: true }
      });
      
      if (!tenant) {
        await prisma.platformJob.update({
          where: { id: job.id },
          data: { status: 'failed', lastError: 'tenant_not_found' }
        });
        continue;
      }

      // Opt-out fast-path (already checked in webhook, but double-check)
      const upper = String(text || '').trim().toUpperCase();
      if (['STOP', 'STOPPE', 'UNSUB'].includes(upper)) {
        // Mark contact as opted out
        await prisma.contact.updateMany({
          where: { tenantId, phone: from },
          data: { optOut: true }
        });
        await prisma.platformJob.update({
          where: { id: job.id },
          data: { status: 'done' }
        });
        continue;
      }

      // Build AI context with tool-grounded pricing/services
      const systemPrompt = `You are the AI Revenue Employee for ${tenant.name}. 
Industry: ${tenant.industryPack}. 
Compliance: ${tenant.complianceRuleset || 'GENERAL'}.
Services: ${tenant.services.map(s => `${s.name} (${s.priceCents/100} ZAR)`).join(', ')}.
Rules: Never invent facts. Use tools to get pricing/availability. Be concise.`;

      const aiResult = await generateText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        prompt: text,
      });

      const reply = aiResult.text;

      // Enqueue outbound message to outbox
      if (tenant.whatsAppAccountId) {
        await prisma.outboxMessage.create({
          data: {
            accountId: tenant.whatsAppAccountId,
            to: from,
            text: reply,
            status: 'queued',
            traceId: `job-${job.id}`
          }
        });
      }

      // Mark job as done
      await prisma.platformJob.update({
        where: { id: job.id },
        data: { status: 'done', attempts: { increment: 1 } }
      });
    } catch (e: any) {
      await prisma.platformJob.update({
        where: { id: job.id },
        data: { 
          status: 'failed', 
          lastError: e.message || 'unknown_error', 
          attempts: { increment: 1 } 
        }
      });
    }
  }
}
