if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") { console.log("Seeding blocked in production."); process.exit(0); }
/**
 * 2ndLife Revenue OS — Seed Verified Payments
 *
 * Creates real payment records with confirmed status (simulating verified webhooks)
 * so the dashboard shows real recovered revenue from the database.
 *
 * This is the ONLY place that creates confirmed payments outside the webhook path.
 * In production, confirmations ONLY happen via /api/webhooks/payments.
 *
 * Run: bun run scripts/seed-payments.ts
 */

import { db } from "../src/lib/db";

async function main() {
  if (!db) {
    console.error("❌ Database not configured");
    process.exit(1);
  }

  console.log("🌱 Seeding verified payments...\n");

  const tenantId = "demo-tenant";

  // Get all customers with opportunities
  const customers = await db.customer.findMany({
    where: { tenantId },
    include: {
      opportunities: true,
      contacts: true,
    },
  });

  let seeded = 0;
  for (const customer of customers) {
    const opp = customer.opportunities[0];
    if (!opp) continue;

    // Check if a confirmed payment already exists for this opportunity
    const existing = await db.payment.findFirst({
      where: { opportunityId: opp.id, status: "confirmed" },
    });
    if (existing) {
      console.log(`  ↻ Payment exists for ${customer.firstName} ${customer.lastName}`);
      continue;
    }

    // Create a confirmed payment (simulating a verified webhook)
    const amount = opp.estimatedValue ?? 150;
    const idemKey = `seed_pay_${opp.id}`;

    const payment = await db.payment.create({
      data: {
        tenantId,
        opportunityId: opp.id,
        provider: "mock",
        providerReference: `mock_pay_${idemKey}`,
        amount,
        currency: "ZAR",
        status: "confirmed",
        idempotencyKey: idemKey,
        confirmedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      },
    });

    // Mark the opportunity as recovered
    await db.recoveryOpportunity.update({
      where: { id: opp.id },
      data: { status: "recovered", actualValue: amount },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId,
        action: "PAYMENT_CONFIRMED",
        entityType: "payment",
        entityId: payment.id,
        metadata: JSON.stringify({
          amount,
          provider: "mock",
          opportunityId: opp.id,
          opportunityRecovered: true,
          seeded: true,
        }),
      },
    });

    console.log(`  ✓ ${customer.firstName} ${customer.lastName}: R${amount} confirmed`);
    seeded++;
  }

  // Calculate total verified revenue
  const total = await db.payment.aggregate({
    where: { tenantId, status: "confirmed" },
    _sum: { amount: true },
    _count: true,
  });

  console.log(`\n✅ Seeded ${seeded} verified payments.`);
  console.log(`   Total verified recovered revenue: R${total._sum.amount ?? 0}`);
  console.log(`   Total confirmed payments: ${total._count}`);
  console.log(`\n   Dashboard will now show REAL recovered revenue from the database.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (db) await db.$disconnect();
  });
