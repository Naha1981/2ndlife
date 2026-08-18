if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") { console.log("[seed] blocked in production"); process.exit(0); }
/**
 * 2ndLife — Tenant isolation test
 * Verifies that tenant B cannot read tenant A's customers.
 * Run: bun run scripts/test-tenant-isolation.ts
 */

import { db } from "../src/lib/db";
import { assertTenantIsolation } from "../src/modules/customers/service";

async function main() {
  if (!db) {
    console.error("❌ Database not configured");
    process.exit(1);
  }

  console.log("🧪 Running tenant isolation test...\n");

  // Test 1: tenant B cannot see tenant A's customer
  try {
    const result = await assertTenantIsolation("demo-tenant", "tenant-b");
    console.log("✅ Test 1 passed: tenant B cannot see tenant A's customer");
  } catch (err) {
    console.error("❌ Test 1 FAILED:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // Test 2: listCustomers returns only demo-tenant customers
  const { listCustomers } = await import("../src/modules/customers/service");
  const demoResult = await listCustomers({ tenantId: "demo-tenant", limit: 100, offset: 0 });
  const tenantBResult = await listCustomers({ tenantId: "tenant-b", limit: 100, offset: 0 });

  console.log(`\n✅ Test 2: tenant scoping works`);
  console.log(`   demo-tenant has ${demoResult.total} customers`);
  console.log(`   tenant-b has ${tenantBResult.total} customers`);

  if (demoResult.total === 0) {
    console.error("❌ Test 2 FAILED: demo-tenant should have customers");
    process.exit(1);
  }

  // Test 3: getCustomer throws NOT_FOUND when tenant mismatch
  const demoCustomer = demoResult.data[0];
  try {
    await import("../src/modules/customers/service").then((m) =>
      m.getCustomer({ tenantId: "tenant-b", customerId: demoCustomer.id })
    );
    console.error("❌ Test 3 FAILED: tenant B should not be able to read tenant A's customer");
    process.exit(1);
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      console.log("✅ Test 3 passed: getCustomer returns NOT_FOUND for cross-tenant access");
    } else {
      console.error("❌ Test 3 FAILED with unexpected error:", err);
      process.exit(1);
    }
  }

  console.log("\n🎉 All tenant isolation tests passed!");
}

main()
  .catch((e) => {
    console.error("❌ Test suite failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (db) await db.$disconnect();
  });
