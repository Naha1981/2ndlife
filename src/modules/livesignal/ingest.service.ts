/**
 * LiveSignal — Ingest Service
 *
 * Privacy chain:
 *   rawText → classify() → stripAndExcerpt() → DB write
 *   rawText is NEVER written anywhere.
 *
 * Promotion rule: when a signal category accumulates 3+ occurrences
 * in a room, it is promoted to the Demand Radar with source='livesignal'.
 *
 * Handoff rule: when a lead has 2+ signals AND consentStatus='granted',
 * a contextual WhatsApp first message is sent (references actual excerpt).
 */

import { prisma } from "@/lib/prisma";
import { classify } from "./classifier";
import type { ClassifiedSignal } from "./types";

// ─── Ingest ───────────────────────────────────────────────────────────────────

export interface IngestResult {
  signalId: string;
  category: string;
  excerpt: string;
  promotedToRadar: boolean;
  handoffQueued: boolean;
}

/**
 * Core ingest function.
 * rawText is classified + stripped here — never stored.
 */
export async function ingestSignal(
  tenantId: string,
  roomId: string,
  rawText: string,
  sessionId: string
): Promise<IngestResult> {
  // 1. Classify & strip (privacy enforcement)
  const classified: ClassifiedSignal = classify(rawText);

  // 2. Upsert LiveSignal — increment occurrences if same category already seen in this room
  const existingSignal = await prisma.liveSignal.findFirst({
    where: { tenantId, roomId, category: classified.category },
  });

  let signal;
  if (existingSignal) {
    signal = await prisma.liveSignal.update({
      where: { id: existingSignal.id },
      data: {
        occurrences: { increment: 1 },
        // Update excerpt to the latest (still stripped, still ≤120)
        excerpt: classified.excerpt,
      },
    });
  } else {
    signal = await prisma.liveSignal.create({
      data: {
        tenantId,
        roomId,
        category: classified.category,
        excerpt: classified.excerpt,
        occurrences: 1,
        promotedToRadar: false,
      },
    });
  }

  // 3. Radar promotion rule: occurrences >= 3 → promote to Demand Radar
  let promotedToRadar = signal.promotedToRadar;
  if (signal.occurrences >= 3 && !signal.promotedToRadar) {
    await prisma.liveSignal.update({
      where: { id: signal.id },
      data: { promotedToRadar: true },
    });
    // Write to DemandSignal with source='livesignal' (verification row 9)
    await prisma.demandSignal.upsert({
      where: {
        // Use a composite: we create a unique sentinel via topic+tenantId
        // SQLite has no composite unique, so we check and create
        id: `ls_${signal.id}`,
      },
      update: { frequency: { increment: 1 }, lastSeenAt: new Date() },
      create: {
        id: `ls_${signal.id}`,
        tenantId,
        source: "livesignal", // verification row 9
        topic: `[LiveSignal] ${classified.category}: ${classified.excerpt}`,
        frequency: signal.occurrences,
        commercialIntent: Math.round(classified.confidence * 100),
        status: "new",
      },
    });
    promotedToRadar = true;
  }

  // 4. Upsert LiveLead — append signal id to JSON array
  let lead = await prisma.liveLead.findUnique({ where: { sessionId } });
  let handoffQueued = false;

  if (!lead) {
    lead = await prisma.liveLead.create({
      data: {
        tenantId,
        roomId,
        sessionId,
        signalIds: JSON.stringify([signal.id]),
        consentStatus: "pending",
      },
    });
  } else {
    const existingIds: string[] = JSON.parse(lead.signalIds || "[]");
    if (!existingIds.includes(signal.id)) {
      existingIds.push(signal.id);
      lead = await prisma.liveLead.update({
        where: { id: lead.id },
        data: { signalIds: JSON.stringify(existingIds), updatedAt: new Date() },
      });
    }
  }

  // 5. Handoff rule: 2+ signals AND consent granted → queue contextual WA message
  const signalIds: string[] = JSON.parse(lead.signalIds || "[]");
  if (signalIds.length >= 2 && lead.consentStatus === "granted" && !lead.handoffSent) {
    handoffQueued = true;
    await queueContextualHandoff(lead.id, tenantId, classified.excerpt, classified.category);
  }

  return {
    signalId: signal.id,
    category: classified.category,
    excerpt: classified.excerpt,
    promotedToRadar,
    handoffQueued,
  };
}

// ─── Contextual WhatsApp handoff ─────────────────────────────────────────────

/**
 * Builds a contextual first WhatsApp message that references the
 * visitor's actual question/context — NOT the generic "Hi! How can I help?"
 *
 * Verification row 8.
 */
export function buildContextualHandoffMessage(
  excerpt: string,
  category: string
): string {
  const categoryLabel: Record<string, string> = {
    price: "pricing",
    availability: "availability",
    urgency: "something urgent",
    financing: "payment options",
    value_objection: "your question",
    social_validation: "our reviews and experience",
    logistics: "delivery and logistics",
    purchase_intent: "getting started",
  };

  const label = categoryLabel[category] ?? "your enquiry";
  return `Hi 👋 We noticed you were asking about ${label}: "${excerpt}" — I'd love to help. What's the best way to reach you?`;
}

async function queueContextualHandoff(
  leadId: string,
  tenantId: string,
  excerpt: string,
  category: string
): Promise<void> {
  const message = buildContextualHandoffMessage(excerpt, category);

  // Mark handoff as sent in the lead record
  await prisma.liveLead.update({
    where: { id: leadId },
    data: { handoffSent: true, handoffAt: new Date() },
  });

  // Log to AuditLog for compliance trail
  await prisma.auditLog.create({
    data: {
      tenantId,
      action: "livesignal.handoff_queued",
      entityType: "LiveLead",
      entityId: leadId,
      metadata: JSON.stringify({ message, category }),
    },
  });

  // Note: actual WhatsApp send requires Evolution API adapter (Phase B).
  // In Phase A, the message is queued in the audit log and surfaced
  // in the owner's CONVERSION tab.
}
