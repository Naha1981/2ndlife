import { PrismaClient } from '@prisma/client';

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
      // PRODUCTION STUB: Wire actual AI Revenue Employee logic here.
      // The payload contains the inbound message context. 
      // In a full implementation, this calls the Vercel AI SDK with tenant tools,
      // generates a reply, and inserts an OutboxMessage.
      
      // For now, we mark the job as done to prove the durable execution loop.
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
