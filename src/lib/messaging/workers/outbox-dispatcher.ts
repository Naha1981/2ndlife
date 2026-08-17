import { PrismaClient } from '@prisma/client';
import { sendMessage } from '../platform-client';

const prisma = new PrismaClient();

export async function dispatchOutbox() {
  // Poll queued or retryable failed messages (up to 5 attempts)
  // FOR UPDATE SKIP LOCKED ensures multiple workers don't process the same message
  const messages = await prisma.$queryRaw`
    SELECT id, "accountId", "to", text, media, attempts
    FROM "OutboxMessage"
    WHERE status = 'queued' OR (status = 'failed' AND attempts < 5 AND "deadAt" IS NULL)
    ORDER BY "createdAt" ASC
    LIMIT 20
    FOR UPDATE SKIP LOCKED
  `;

  for (const msg of messages as any[]) {
    try {
      const res = await sendMessage({ 
        accountId: msg.accountId, 
        to: msg.to, 
        text: msg.text, 
        media: msg.media 
      });
      
      if (res.ok) {
        await prisma.outboxMessage.update({
          where: { id: msg.id },
          data: { 
            status: 'delivered', 
            deliveryId: res.id, 
            deliveredAt: new Date(), 
            attempts: { increment: 1 } 
          }
        });
      } else {
        const newAttempts = msg.attempts + 1;
        await prisma.outboxMessage.update({
          where: { id: msg.id },
          data: { 
            status: 'failed', 
            lastError: res.error, 
            attempts: newAttempts,
            deadAt: newAttempts >= 5 ? new Date() : null
          }
        });
      }
    } catch (e: any) {
      await prisma.outboxMessage.update({
        where: { id: msg.id },
        data: { 
          status: 'failed', 
          lastError: e.message || 'unknown_error', 
          attempts: { increment: 1 } 
        }
      });
    }
  }
}
