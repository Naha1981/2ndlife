/**
 * 2ndLife Revenue OS — Marketing Brain Service
 *
 * The intelligence layer that turns raw demand signals into optimized content briefs.
 *
 * THE 3-QUESTION RULE:
 *   When a demand signal reaches frequency >= 3 AND status == 'new',
 *   automatically upgrade to 'opportunity' and generate a ContentBrief.
 *
 * This is the "Marketing Brain" — it decides what content the business should
 * create based on what the market is actually asking for.
 */

import { db } from "@/lib/db";
import { AppError } from "@/shared/errors/types";

export interface ProcessSignalInput {
  tenantId: string;
  source: string; // 'search', 'social', 'competitor', 'faq'
  topic: string; // e.g., "teeth whitening cost Sandton"
  rawQuestion?: string; // original text from social media
  platform?: string; // 'tiktok', 'instagram', 'google_reviews'
  commercialIntent?: number; // 0-100
}

export interface ProcessSignalResult {
  signal: {
    id: string;
    topic: string;
    frequency: number;
    status: string;
    commercialIntent: number;
  };
  briefCreated: boolean;
  briefId?: string;
}

export interface DemandRadarResult {
  emerging: Array<{
    id: string;
    topic: string;
    source: string;
    frequency: number;
    commercialIntent: number;
    status: string;
    lastSeenAt: string;
  }>;
  opportunities: Array<{
    id: string;
    topic: string;
    source: string;
    frequency: number;
    commercialIntent: number;
    brief?: {
      id: string;
      hook: string;
      cta: string;
      formats: string[];
      objective: string;
    };
    questions: Array<{ platform: string; text: string; occurrences: number }>;
  }>;
  briefed: Array<{
    id: string;
    topic: string;
    frequency: number;
    brief: {
      id: string;
      hook: string;
      cta: string;
      formats: string[];
      approvalStatus: string;
    };
  }>;
}

/**
 * Process an inbound demand signal.
 *
 * 1. Find or create DemandSignal for this tenant+topic.
 * 2. Increment frequency and update lastSeenAt.
 * 3. If rawQuestion provided, create/append to SocialQuestion.
 * 4. THE 3-QUESTION RULE: If frequency >= 3 AND status == 'new',
 *    upgrade to 'opportunity' and generate a ContentBrief.
 * 5. Return the updated signal and brief info.
 */
export async function processSignal(
  input: ProcessSignalInput
): Promise<ProcessSignalResult> {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  const { tenantId, source, topic, rawQuestion, platform, commercialIntent } = input;

  // 1. Find or create DemandSignal
  let signal = await db.demandSignal.findFirst({
    where: { tenantId, topic },
  });

  if (!signal) {
    signal = await db.demandSignal.create({
      data: {
        tenantId,
        source,
        topic,
        frequency: 1,
        commercialIntent: commercialIntent ?? 50,
        status: "new",
      },
    });
  } else {
    // 2. Increment frequency and update lastSeenAt
    signal = await db.demandSignal.update({
      where: { id: signal.id },
      data: {
        frequency: { increment: 1 },
        lastSeenAt: new Date(),
        commercialIntent: Math.max(signal.commercialIntent, commercialIntent ?? 0),
      },
    });
  }

  // 3. If rawQuestion provided, create/append to SocialQuestion
  if (rawQuestion) {
    const normalized = rawQuestion.toLowerCase().trim();
    const existing = await db.socialQuestion.findFirst({
      where: { signalId: signal.id, normalizedText: normalized },
    });

    if (existing) {
      await db.socialQuestion.update({
        where: { id: existing.id },
        data: { occurrences: { increment: 1 } },
      });
    } else {
      await db.socialQuestion.create({
        data: {
          tenantId,
          signalId: signal.id,
          platform: platform ?? "unknown",
          originalText: rawQuestion,
          normalizedText: normalized,
          occurrences: 1,
        },
      });
    }
  }

  // 4. THE 3-QUESTION RULE
  let briefCreated = false;
  let briefId: string | undefined;

  if (signal.frequency >= 3 && signal.status === "new") {
    // Upgrade to opportunity
    signal = await db.demandSignal.update({
      where: { id: signal.id },
      data: { status: "opportunity" },
    });

    // Generate a ContentBrief
    const brief = await db.contentBrief.create({
      data: {
        tenantId,
        signalId: signal.id,
        objective: "lead_gen",
        targetAudience: "Potential customers searching for this topic",
        hook: `The truth about ${topic}`,
        cta: "WhatsApp us for a free consultation",
        formats: '["reel", "carousel", "seo_article"]',
        approvalStatus: "draft",
      },
    });

    briefCreated = true;
    briefId = brief.id;
  }

  return {
    signal: {
      id: signal.id,
      topic: signal.topic,
      frequency: signal.frequency,
      status: signal.status,
      commercialIntent: signal.commercialIntent,
    },
    briefCreated,
    briefId,
  };
}

/**
 * Get the Demand Radar view — signals grouped by status.
 */
export async function getDemandRadar(
  tenantId: string
): Promise<DemandRadarResult> {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  const signals = await db.demandSignal.findMany({
    where: { tenantId },
    include: {
      questions: true,
      briefs: true,
    },
    orderBy: { frequency: "desc" },
  });

  const emerging: DemandRadarResult["emerging"] = [];
  const opportunities: DemandRadarResult["opportunities"] = [];
  const briefed: DemandRadarResult["briefed"] = [];

  for (const s of signals) {
    if (s.status === "new" && s.frequency >= 2) {
      emerging.push({
        id: s.id,
        topic: s.topic,
        source: s.source,
        frequency: s.frequency,
        commercialIntent: s.commercialIntent,
        status: s.status,
        lastSeenAt: s.lastSeenAt.toISOString(),
      });
    } else if (s.status === "opportunity") {
      const brief = s.briefs[0];
      opportunities.push({
        id: s.id,
        topic: s.topic,
        source: s.source,
        frequency: s.frequency,
        commercialIntent: s.commercialIntent,
        brief: brief
          ? {
              id: brief.id,
              hook: brief.hook,
              cta: brief.cta,
              formats: JSON.parse(brief.formats),
              objective: brief.objective,
            }
          : undefined,
        questions: s.questions.map((q) => ({
          platform: q.platform,
          text: q.originalText,
          occurrences: q.occurrences,
        })),
      });
    } else if (s.status === "briefed" || s.status === "published") {
      const brief = s.briefs[0];
      if (brief) {
        briefed.push({
          id: s.id,
          topic: s.topic,
          frequency: s.frequency,
          brief: {
            id: brief.id,
            hook: brief.hook,
            cta: brief.cta,
            formats: JSON.parse(brief.formats),
            approvalStatus: brief.approvalStatus,
          },
        });
      }
    }
  }

  return { emerging, opportunities, briefed };
}
