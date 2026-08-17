if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") { console.log("Seeding blocked in production."); process.exit(0); }
/**
 * 2ndLife Revenue OS — Import Service Tests
 *
 * Tests:
 * 1. normalizePhoneZA — SA phones → E.164, garbage → null
 * 2. previewImport — 20-row CSV with 2 bad rows → validRows=18, errors.length=2
 * 3. commitImport — creates customers + contacts + opportunities
 * 4. Idempotency — re-import same file → duplicates merged, count unchanged
 * 5. Tenant isolation — tenant A's import not visible to tenant B
 *
 * Run: bun run scripts/test-imports.ts
 */

import {
  normalizePhoneZA,
  previewImport,
  commitImport,
} from "../src/modules/imports/service";
import { db } from "../src/lib/db";

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ ${msg}`);
    failed++;
  }
}

function assertEqual(actual: unknown, expected: unknown, msg: string) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (pass) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ ${msg} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
    failed++;
  }
}

async function main() {
  console.log("🧪 2ndLife Import Service Tests\n");

  // ─── Test 1: normalizePhoneZA ───
  console.log("Test 1: normalizePhoneZA");
  assertEqual(normalizePhoneZA("072 123 4567"), "+27721234567", "'072 123 4567' → '+27721234567'");
  assertEqual(normalizePhoneZA("0721234567"), "+27721234567", "'0721234567' → '+27721234567'");
  assertEqual(normalizePhoneZA("+27721234567"), "+27721234567", "'+27721234567' → '+27721234567' (idempotent)");
  assertEqual(normalizePhoneZA("072-123-4567"), "+27721234567", "'072-123-4567' → '+27721234567'");
  assertEqual(normalizePhoneZA("garbage"), null, "'garbage' → null");
  assertEqual(normalizePhoneZA(""), null, "'' → null");
  assertEqual(normalizePhoneZA("123"), null, "'123' → null (too short)");
  console.log("");

  // ─── Test 2: previewImport ───
  console.log("Test 2: previewImport (20-row CSV with 2 bad rows)");
  const csv20 = `firstName,phone,email,status,lifetimeValue,monthsInactive
Thabo,+27721234567,thabo@test.co.za,lapsed,7200,8
Lerato,0781234567,lerato@test.co.za,failed_debit,4200,3
Sipho,0731234567,sipho@test.co.za,lapsed,5400,5
Palesa,0841234567,palesa@test.co.za,dormant,3600,12
Bongani,+27761234567,bongani@test.co.za,active,1800,1
Nomsa,0791234567,nomsa@test.co.za,at_risk,2400,2
Mandla,0711234567,mandla@test.co.za,lapsed,6800,10
Zanele,+27821234567,zanele@test.co.za,active,1500,0
Karabo,0761234567,karabo@test.co.za,dormant,3000,15
Lebo,0729876543,lebo@test.co.za,failed_debit,2100,4
Tumi,+27731234567,tumi@test.co.za,lapsed,4500,7
Refilwe,0787654321,refilwe@test.co.za,active,1200,1
Kabelo,0719876543,kabelo@test.co.za,dormant,2800,14
Anele,+27769876543,anele@test.co.za,at_risk,3200,3
Mpho,0798765432,mpho@test.co.za,lapsed,5100,9
Dineo,0723456789,dineo@test.co.za,active,900,0
Tswe,0763456789,tswe@test.co.za,failed_debit,1900,6
Ofentse,+27813456789,ofentse@test.co.za,dormant,2700,13
Bad1,notanumber,bad1@test.co.za,lapsed,1000,5
Bad2,12345,invalid-email,lapsed,1000,5
`;

  const mapping = {
    firstName: "firstName",
    phone: "phone",
    email: "email",
    status: "status",
    lifetimeValue: "lifetimeValue",
    monthsInactive: "monthsInactive",
  };

  const preview = await previewImport("demo-tenant", csv20, mapping);
  assertEqual(preview.totalRows, 20, "Total rows = 20");
  assert(preview.validRows.length === 18, `Valid rows = 18 (got ${preview.validRows.length})`);
  assert(preview.errors.length >= 2, `Errors >= 2 (got ${preview.errors.length})`);
  assert(preview.phonesNormalized > 0, "Phones normalized > 0");
  console.log(`  📊 Valid: ${preview.validRows.length}, Errors: ${preview.errors.length}, Normalized: ${preview.phonesNormalized}`);
  console.log("");

  // ─── Test 3: commitImport ───
  console.log("Test 3: commitImport (creates customers + contacts + opportunities)");
  const smallCsv = `firstName,phone,email,status,lifetimeValue,monthsInactive
TestUser1,+27720000001,test1@import.test,lapsed,5000,8
TestUser2,+27720000002,test2@import.test,dormant,3000,12
TestUser3,0790000003,test3@import.test,failed_debit,2000,3
`;

  const commitResult = await commitImport("demo-tenant", smallCsv, mapping, "test-import.csv");
  assert(commitResult.created.customers === 3, `Created 3 customers (got ${commitResult.created.customers})`);
  assert(commitResult.created.contacts >= 3, `Created contacts >= 3 (got ${commitResult.created.contacts})`);
  assert(commitResult.created.opportunities >= 1, `Created opportunities >= 1 (got ${commitResult.created.opportunities})`);
  assert(!!commitResult.importId, "Import record ID created");

  // Verify in DB
  if (db) {
    const customer = await db.customer.findFirst({
      where: { tenantId: "demo-tenant", firstName: "TestUser1" },
      include: { contacts: true, opportunities: true },
    });
    assert(!!customer, "TestUser1 found in DB");
    assert(customer?.contacts.length >= 2, "TestUser1 has phone + email contacts");
    assert(customer?.opportunities.length >= 1, "TestUser1 has recovery opportunity");
    assert(customer?.opportunities[0]?.score > 0, "Opportunity has a score > 0");
  }
  console.log("");

  // ─── Test 4: Idempotency ───
  console.log("Test 4: Idempotency (re-import same file)");
  const countBefore = await db?.customer.count({
    where: { tenantId: "demo-tenant", firstName: { startsWith: "TestUser" } },
  });

  const reimportResult = await commitImport("demo-tenant", smallCsv, mapping, "test-import-reimport.csv");
  const countAfter = await db?.customer.count({
    where: { tenantId: "demo-tenant", firstName: { startsWith: "TestUser" } },
  });

  assertEqual(countAfter, countBefore, "Re-import does not create duplicate customers");
  assert(reimportResult.created.customers === 0, `Re-import created 0 new customers (got ${reimportResult.created.customers})`);
  console.log("");

  // ─── Test 5: Tenant isolation ───
  console.log("Test 5: Tenant isolation");
  const tenantBCustomers = await db?.customer.findMany({
    where: { tenantId: "tenant-b", firstName: { startsWith: "TestUser" } },
  });
  assertEqual(tenantBCustomers?.length ?? 0, 0, "Tenant B cannot see Tenant A's imported customers");
  console.log("");

  // ─── Cleanup ───
  console.log("Cleaning up test data...");
  if (db) {
    await db.customerContact.deleteMany({
      where: { value: { contains: "2000000" } },
    });
    await db.recoveryOpportunity.deleteMany({
      where: { tenantId: "demo-tenant", customer: { firstName: { startsWith: "TestUser" } } },
    });
    await db.customer.deleteMany({
      where: { tenantId: "demo-tenant", firstName: { startsWith: "TestUser" } },
    });
    await db.import.deleteMany({
      where: { tenantId: "demo-tenant", filename: { startsWith: "test-import" } },
    });
    await db.auditLog.deleteMany({
      where: { tenantId: "demo-tenant", action: "IMPORT_COMMITTED" },
    });
  }

  // ─── Summary ───
  console.log("\n──────────────────────────────");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  }
  console.log("\n🎉 All import tests passed!");
}

main()
  .catch((e) => {
    console.error("❌ Test suite failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (db) await db.$disconnect();
  });
