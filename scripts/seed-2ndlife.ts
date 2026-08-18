if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") { console.log("[seed] blocked in production"); process.exit(0); }
/**
 * 2ndLife — Seed script
 * Creates a demo tenant + demo customers for local development.
 * Run: bun run scripts/seed-2ndlife.ts
 */

import { db } from "../src/lib/db";

async function main() {
  if (!db) {
    console.error("❌ Database not configured");
    process.exit(1);
  }

  console.log("🌱 Seeding 2ndLife demo data...");

  // 1. Upsert demo tenant
  const tenant = await db.tenant.upsert({
    where: { id: "demo-tenant" },
    update: {},
    create: {
      id: "demo-tenant",
      name: "Funeral Secure Admin",
      industry: "funeral-insurance",
    },
  });
  console.log(`✓ Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Upsert demo user
  const user = await db.user.upsert({
    where: { clerkId: "demo-clerk-id" },
    update: {},
    create: {
      clerkId: "demo-clerk-id",
      email: "nomsa@funeralsecure.co.za",
      name: "Nomsa Dlamini",
    },
  });
  console.log(`✓ User: ${user.name} (${user.email})`);

  // 3. Upsert membership
  await db.membership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: "owner",
    },
  });
  console.log(`✓ Membership: owner`);

  // 4. Create demo customers
  const customers = [
    {
      externalId: "cus_8412",
      firstName: "Thabo",
      lastName: "Mokoena",
      status: "lapsed",
      lifetimeValue: 7200,
      contacts: [
        { type: "phone", value: "+27721234567", isPrimary: true, whatsappValid: true },
        { type: "email", value: "thabo.mokoena@example.co.za" },
      ],
    },
    {
      externalId: "cus_8413",
      firstName: "Lerato",
      lastName: "Khumalo",
      status: "failed_debit",
      lifetimeValue: 4200,
      contacts: [
        { type: "phone", value: "+27821234567", isPrimary: true, whatsappValid: true },
        { type: "email", value: "lerato.k@example.co.za" },
      ],
    },
    {
      externalId: "cus_8414",
      firstName: "Sipho",
      lastName: "Dlamini",
      status: "lapsed",
      lifetimeValue: 5400,
      contacts: [
        { type: "phone", value: "+27731234567", isPrimary: true, whatsappValid: true },
        { type: "email", value: "sipho.d@example.co.za" },
      ],
    },
    {
      externalId: "cus_8415",
      firstName: "Palesa",
      lastName: "Radebe",
      status: "dormant",
      lifetimeValue: 3600,
      contacts: [
        { type: "phone", value: "+27841234567", isPrimary: true, whatsappValid: true },
        { type: "email", value: "palesa.r@example.co.za" },
      ],
    },
  ];

  for (const c of customers) {
    const existing = await db.customer.findFirst({
      where: { tenantId: tenant.id, externalId: c.externalId },
    });
    if (existing) {
      console.log(`  ↻ Customer exists: ${c.firstName} ${c.lastName}`);
      continue;
    }
    const { contacts, ...customerData } = c;
    const created = await db.customer.create({
      data: {
        ...customerData,
        tenantId: tenant.id,
        contacts: {
          create: contacts.map((ct) => ({ ...ct, tenantId: tenant.id })),
        },
      },
    });
    console.log(`  ✓ Customer: ${created.firstName} ${created.lastName} (${created.id})`);

    // Create a recovery opportunity for each customer
    const opp = await db.recoveryOpportunity.create({
      data: {
        tenantId: tenant.id,
        customerId: created.id,
        category: created.status === "lapsed" ? "lapsed_customer" : "failed_payment",
        score: Math.floor(Math.random() * 30) + 60, // 60–90
        estimatedValue: (created.lifetimeValue ?? 1000) * 0.6,
        status: "new",
        recommendedAction:
          "Present approved restart offer. Empathetic tone; escalate after 2 objections.",
      },
    });

    // For Thabo, create an active conversation with messages
    if (created.externalId === "cus_8412") {
      const conv = await db.conversation.create({
        data: {
          tenantId: tenant.id,
          customerId: created.id,
          opportunityId: opp.id,
          channel: "whatsapp",
          status: "engaged",
          intent: "restart · price-sensitive",
        },
      });

      await db.conversationMessage.createMany({
        data: [
          {
            tenantId: tenant.id,
            conversationId: conv.id,
            role: "ai",
            body: "Hi Thabo, your cover lapsed in Jan. You don't owe arrears. Want to restart for R150/mo?",
            kind: "text",
          },
          {
            tenantId: tenant.id,
            conversationId: conv.id,
            role: "customer",
            body: "I stopped because it was too expensive.",
            kind: "text",
          },
          {
            tenantId: tenant.id,
            conversationId: conv.id,
            role: "ai",
            body: "I understand. We may be able to look at a lower-cost option. Would you like me to check what is available?",
            kind: "text",
          },
          {
            tenantId: tenant.id,
            conversationId: conv.id,
            role: "customer",
            body: "Yes, let's do it!",
            kind: "text",
          },
        ],
      });
      console.log(`  ✓ Conversation seeded for Thabo (${conv.id})`);
    }
  }

  // 5. Create a second tenant for isolation testing
  const tenantB = await db.tenant.upsert({
    where: { id: "tenant-b" },
    update: {},
    create: {
      id: "tenant-b",
      name: "Acme Subscriptions",
      industry: "subscriptions",
    },
  });
  await db.customer.create({
    data: {
      tenantId: tenantB.id,
      firstName: "TenantB",
      lastName: "Customer",
      status: "active",
    },
  });
  console.log(`✓ Tenant B: ${tenantB.name} (for isolation testing)`);

  // 6. Ensure Thabo has an active conversation with messages
  const thabo = await db.customer.findFirst({
    where: { tenantId: tenant.id, externalId: "cus_8412" },
    include: { contacts: true },
  });
  if (thabo) {
    const existingConv = await db.conversation.findFirst({
      where: { tenantId: tenant.id, customerId: thabo.id },
    });
    if (!existingConv) {
      const opp = await db.recoveryOpportunity.findFirst({
        where: { tenantId: tenant.id, customerId: thabo.id },
      });
      const conv = await db.conversation.create({
        data: {
          tenantId: tenant.id,
          customerId: thabo.id,
          opportunityId: opp?.id,
          channel: "whatsapp",
          status: "engaged",
          intent: "restart · price-sensitive",
        },
      });
      await db.conversationMessage.createMany({
        data: [
          {
            tenantId: tenant.id,
            conversationId: conv.id,
            role: "ai",
            body: "Hi Thabo, your cover lapsed in Jan. You don't owe arrears. Want to restart for R150/mo?",
            kind: "text",
          },
          {
            tenantId: tenant.id,
            conversationId: conv.id,
            role: "customer",
            body: "I stopped because it was too expensive.",
            kind: "text",
          },
          {
            tenantId: tenant.id,
            conversationId: conv.id,
            role: "ai",
            body: "I understand. We may be able to look at a lower-cost option. Would you like me to check what is available?",
            kind: "text",
          },
          {
            tenantId: tenant.id,
            conversationId: conv.id,
            role: "customer",
            body: "Yes, let's do it!",
            kind: "text",
          },
        ],
      });
      console.log(`✓ Conversation seeded for Thabo (${conv.id})`);
    } else {
      console.log(`  ↻ Conversation exists for Thabo`);
    }
  }

  console.log("\n✅ Seed complete. Demo data ready.");
  console.log("   Tenant ID: demo-tenant");
  console.log("   API: GET /api/v1/customers");
  console.log("   API: GET /api/v1/selftest");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (db) await db.$disconnect();
  });
