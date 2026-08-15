import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMessagingProvider } from "@/lib/2ndlife/messaging/provider";
import { runRecoveryAgent, isOptOut } from "@/modules/messaging/recovery-agent-service";
import { normalizeSAPhone } from "@/lib/2ndlife/format";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/evolution
 *
 * Inbound WhatsApp message webhook from Evolution API (or synthetic demo payload).
 *
 * Flow:
 * 1. Secret-gate (if EVOLUTION_WEBHOOK_SECRET configured, require matching header)
 * 2. Parse + persist WebhookEvent FIRST (audit + replay)
 * 3. Idempotency: duplicate providerEventId → 200 { ok, duplicate: true }
 * 4. Normalize at boundary (ignore bot-authored/absence events)
 * 5. handleInbound: find contact → tenant → conversation → AI agent → outbound reply
 * 6. ALWAYS return 2xx fast; catch all errors (Evolution retries on 5xx)
 */

interface EvolutionWebhookPayload {
  event?: string;
  data?: {
    key?: {
      id?: string;
      remoteJid?: string;
      fromMe?: boolean;
    };
    message?: {
      conversation?: string;
      extendedTextMessage?: { text?: string };
      imageMessage?: { caption?: string };
    };
    pushName?: string;
    messageTimestamp?: number;
  };
  // For synthetic/demo payloads
  providerEventId?: string;
  from?: string;
  text?: string;
}

export async function POST(req: NextRequest) {
  try {
    // ─── 1. Secret gate ───
    const secret = process.env.EVOLUTION_WEBHOOK_SECRET;
    if (secret) {
      const provided = req.headers.get("x-webhook-secret") ?? req.headers.get("x-api-key");
      if (provided !== secret) {
        console.warn("[webhook/evolution] 401: secret mismatch");
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
    }

    const rawBody = await req.text();
    const payload: EvolutionWebhookPayload = JSON.parse(rawBody);

    // ─── 2. Extract providerEventId + from + text ───
    const providerEventId =
      payload.providerEventId ??
      payload.data?.key?.id ??
      `evo_${randomUUID()}`;

    const from =
      payload.from ??
      payload.data?.key?.remoteJid?.split("@")[0] ??
      "";

    const text =
      payload.text ??
      payload.data?.message?.conversation ??
      payload.data?.message?.extendedTextMessage?.text ??
      payload.data?.message?.imageMessage?.caption ??
      "";

    const fromMe = payload.data?.key?.fromMe ?? false;

    // ─── 3. Persist WebhookEvent FIRST (audit + idempotency) ───
    if (db) {
      const existing = await db.webhookEvent.findUnique({
        where: { providerEventId },
      });

      if (existing) {
        // Idempotency: duplicate → 200, no further processing
        return NextResponse.json({ ok: true, duplicate: true });
      }

      await db.webhookEvent.create({
        data: {
          provider: "evolution",
          providerEventId,
          raw: rawBody.slice(0, 10000), // cap raw size
        },
      });
    }

    // ─── 4. Normalize at boundary ───
    // Ignore bot-authored messages (fromMe=true) or absence events
    if (fromMe) {
      if (db) {
        await db.webhookEvent.updateMany({
          where: { providerEventId },
          data: { processedAt: new Date() },
        });
      }
      return NextResponse.json({ ok: true, ignored: true, reason: "fromMe" });
    }

    // Ignore empty messages or non-conversation events
    if (!text || !from) {
      if (db) {
        await db.webhookEvent.updateMany({
          where: { providerEventId },
          data: { processedAt: new Date() },
        });
      }
      return NextResponse.json({ ok: true, ignored: true, reason: "empty" });
    }

    // ─── 5. handleInbound ───
    await handleInbound({ from, text, providerEventId });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // ALWAYS return 2xx — Evolution retries on 5xx
    console.error(
      "[webhook/evolution] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ ok: true, error: "internal" }, { status: 200 });
  }
}

/**
 * Process an inbound WhatsApp message:
 * - Normalize phone → find contact → tenant
 * - Opt-out handling
 * - Find/open conversation + AI agent reply
 */
async function handleInbound(input: {
  from: string;
  text: string;
  providerEventId: string;
}) {
  if (!db) return;

  const { from, text, providerEventId } = input;

  // Normalize SA phone to E.164
  const normalizedPhone = normalizeSAPhone(from);

  // Find the contact by phone number
  const contact = await db.customerContact.findFirst({
    where: {
      value: { contains: normalizedPhone.replace("+", "") },
      optOut: false,
    },
    include: {
      customer: {
        include: {
          tenant: true,
        },
      },
    },
  });

  if (!contact) {
    // Unknown phone — event stays persisted, processedAt set, NO conversation created
    // Fail closed: no cross-tenant data exposure
    await db.webhookEvent.updateMany({
      where: { providerEventId },
      data: { processedAt: new Date() },
    });
    console.log(`[webhook/evolution] unknown phone: ${normalizedPhone}`);
    return;
  }

  const tenantId = contact.customer.tenantId;
  const customerId = contact.customerId;

  // ─── Opt-out check ───
  if (isOptOut(text)) {
    // Set contact.optOut = true
    await db.customerContact.update({
      where: { id: contact.id },
      data: { optOut: true },
    });

    // Find or create conversation to record the opt-out
    let conversation = await db.conversation.findFirst({
      where: { tenantId, customerId, status: { in: ["open", "engaged", "awaiting_human"] } },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          tenantId,
          customerId,
          channel: "whatsapp",
          status: "opted_out",
        },
      });
    }

    // Record customer STOP message
    await db.conversationMessage.create({
      data: {
        tenantId,
        conversationId: conversation.id,
        role: "customer",
        body: text,
        kind: "text",
      },
    });

    // Record system opt-out message
    await db.conversationMessage.create({
      data: {
        tenantId,
        conversationId: conversation.id,
        role: "system",
        body: "Opt-out recorded · no further messages will be sent · POPIA compliant",
        kind: "opt_out",
      },
    });

    // Update conversation status
    await db.conversation.update({
      where: { id: conversation.id },
      data: { status: "opted_out" },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId,
        action: "CUSTOMER_OPTED_OUT",
        entityType: "customer_contact",
        entityId: contact.id,
        metadata: JSON.stringify({ phone: normalizedPhone }),
      },
    });

    // Mark webhook processed
    await db.webhookEvent.updateMany({
      where: { providerEventId },
      data: { processedAt: new Date(), tenantId },
    });

    // NO outbound reply for opt-out
    return;
  }

  // ─── Find or open conversation ───
  let conversation = await db.conversation.findFirst({
    where: { tenantId, customerId, status: { in: ["open", "engaged", "awaiting_human"] } },
    include: { opportunity: true },
  });

  if (!conversation) {
    // Find the top open RecoveryOpportunity for this customer
    const opportunity = await db.recoveryOpportunity.findFirst({
      where: { tenantId, customerId, status: { in: ["new", "qualified", "contacted", "engaged", "negotiating"] } },
      orderBy: { score: "desc" },
    });

    conversation = await db.conversation.create({
      data: {
        tenantId,
        customerId,
        opportunityId: opportunity?.id,
        channel: "whatsapp",
        status: "engaged",
      },
    });
  }

  // ─── Append customer message ───
  await db.conversationMessage.create({
    data: {
      tenantId,
      conversationId: conversation.id,
      role: "customer",
      body: text,
      kind: "text",
    },
  });

  // ─── Call the recovery agent service ───
  const agentResult = await runRecoveryAgent(tenantId, conversation.id, text);

  // ─── Process agent actions ───
  const hasEscalation = agentResult.actions.some((a) => a.type === "escalate");
  const hasOptOut = agentResult.actions.some((a) => a.type === "opt_out");
  const paymentRequest = agentResult.actions.find((a) => a.type === "payment_request");

  // Determine message kind
  let messageKind = "text";
  if (hasEscalation) messageKind = "escalation";
  else if (paymentRequest) messageKind = "payment_request";

  // ─── Append AI message ───
  const aiMessage = await db.conversationMessage.create({
    data: {
      tenantId,
      conversationId: conversation.id,
      role: "ai",
      body: agentResult.reply,
      kind: messageKind,
      amount: paymentRequest?.amount,
      deliveryStatus: "queued", // will update after send
    },
  });

  // ─── Check business hours / rate cap (simplified — always send in demo) ───
  // In production: check campaign config for business hours
  const withinHours = true; // demo: always within hours

  if (hasOptOut) {
    // Don't send outbound for opt-out (already handled above)
    await db.conversationMessage.update({
      where: { id: aiMessage.id },
      data: { deliveryStatus: "sent", kind: "opt_out" },
    });
  } else if (!withinHours) {
    // Outside business hours — message saved as 'queued', not sent
    await db.conversationMessage.update({
      where: { id: aiMessage.id },
      data: { deliveryStatus: "queued" },
    });
  } else {
    // ─── Send outbound via provider ───
    const provider = getMessagingProvider();
    const result = await provider.sendMessage({
      tenantId,
      to: normalizedPhone,
      text: agentResult.reply,
      conversationId: conversation.id,
    });

    // Update delivery status from result
    await db.conversationMessage.update({
      where: { id: aiMessage.id },
      data: {
        providerMessageId: result.providerMessageId,
        deliveryStatus: result.status,
      },
    });

    // ─── Handle escalation ───
    if (hasEscalation) {
      await db.conversation.update({
        where: { id: conversation.id },
        data: { status: "awaiting_human" },
      });

      await db.auditLog.create({
        data: {
          tenantId,
          action: "CONVERSATION_ESCALATED",
          entityType: "conversation",
          entityId: conversation.id,
          metadata: JSON.stringify({ reason: "2+ objections" }),
        },
      });
    }
  }

  // Mark webhook processed
  await db.webhookEvent.updateMany({
    where: { providerEventId },
    data: { processedAt: new Date(), tenantId },
  });
}
