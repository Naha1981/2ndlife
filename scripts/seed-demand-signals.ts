/**
 * 2ndLife Revenue OS — Seed Demand Signals
 * Creates 3 mock demand signals for the demo tenant:
 * 1. "laser hair removal price" (frequency: 5, status: opportunity)
 * 2. "teeth whitening sandton" (frequency: 3, status: opportunity)
 * 3. "invisalign vs braces" (frequency: 2, status: new)
 *
 * Run: bun run scripts/seed-demand-signals.ts
 */

import { db } from "../src/lib/db";
import { processSignal } from "../src/modules/marketing-brain/service";

async function main() {
  if (!db) {
    console.error("❌ Database not configured");
    process.exit(1);
  }

  console.log("🌱 Seeding demand signals for 2ndLife Revenue OS...\n");

  const tenantId = "demo-tenant";

  // Check if signals already exist
  const existing = await db.demandSignal.count({ where: { tenantId } });
  if (existing > 0) {
    console.log(`↻ ${existing} demand signals already exist. Skipping seed.`);
    process.exit(0);
  }

  // 1. "laser hair removal price" — frequency 5, should become opportunity
  console.log("  Seeding: 'laser hair removal price' (5 occurrences)...");
  for (let i = 0; i < 5; i++) {
    await processSignal({
      tenantId,
      source: "social",
      topic: "laser hair removal price",
      rawQuestion: `How much does laser hair removal cost? ${i + 1}`,
      platform: "tiktok",
      commercialIntent: 85,
    });
  }

  // 2. "teeth whitening sandton" — frequency 3, should become opportunity
  console.log("  Seeding: 'teeth whitening sandton' (3 occurrences)...");
  for (let i = 0; i < 3; i++) {
    await processSignal({
      tenantId,
      source: "search",
      topic: "teeth whitening sandton",
      rawQuestion: `Best teeth whitening in Sandton? ${i + 1}`,
      platform: "google_reviews",
      commercialIntent: 92,
    });
  }

  // 3. "invisalign vs braces" — frequency 2, stays "new" (emerging)
  console.log("  Seeding: 'invisalign vs braces' (2 occurrences)...");
  for (let i = 0; i < 2; i++) {
    await processSignal({
      tenantId,
      source: "faq",
      topic: "invisalign vs braces",
      rawQuestion: `Invisalign or braces which is better? ${i + 1}`,
      platform: "instagram",
      commercialIntent: 65,
    });
  }

  // Verify
  const signals = await db.demandSignal.findMany({
    where: { tenantId },
    include: { briefs: true, questions: true },
    orderBy: { frequency: "desc" },
  });

  console.log("\n✅ Seed complete. Demand signals created:");
  for (const s of signals) {
    console.log(
      `  ${s.topic}: frequency=${s.frequency}, status=${s.status}, briefs=${s.briefs.length}, questions=${s.questions.length}`
    );
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (db) await db.$disconnect();
  });
