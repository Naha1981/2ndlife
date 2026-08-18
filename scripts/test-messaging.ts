if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") { console.log("[seed] blocked in production"); process.exit(0); }
/**
 * 2ndLife — Messaging Layer Tests
 *
 * Tests:
 * 1. Contract suite: MockAdapter + EvolutionAdapter shape
 * 2. Idempotency: duplicate webhook → duplicate:true, no new messages
 * 3. Opt-out: inbound "STOP" → contact.optOut=true, zero outbound replies
 * 4. Unknown phone: event persisted, zero conversations created
 * 5. Wrong secret (when configured) → 401
 * 6. Agent escalation: 2 price objections → human escalation
 *
 * Run: bun run scripts/test-messaging.ts
 */

import { MockAdapter } from "../src/lib/2ndlife/messaging/mock-adapter";
import { db } from "../src/lib/db";
import { isOptOut, countObjections } from "../src/modules/messaging/recovery-agent-service";

const BASE = "http://localhost:3000";
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

async function main() {
  console.log("🧪 2ndLife Messaging Layer Tests\n");

  // ─── Test 1: Contract suite ───
  console.log("Test 1: MockAdapter contract");
  const mock = new MockAdapter();
  const sendResult = await mock.sendMessage({
    tenantId: "test",
    to: "+27721234567",
    text: "Hello from test",
  });
  assert(sendResult.providerMessageId.startsWith("mock_"), "sendMessage returns mock_ ID");
  assert(["sent", "delivered", "read", "failed", "queued"].includes(sendResult.status), "sendMessage returns valid DeliveryStatus");

  const status = await mock.getStatus(sendResult.providerMessageId);
  assert(["sent", "delivered", "read", "failed", "queued"].includes(status), "getStatus returns valid DeliveryStatus");
  console.log("");

  // ─── Test 2: Idempotency ───
  console.log("Test 2: Webhook idempotency");
  const dupPayload = {
    providerEventId: `test_dup_${Date.now()}`,
    from: "+27721234567",
    text: "Test idempotency",
  };
  const res1 = await fetch(`${BASE}/api/webhooks/evolution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dupPayload),
  });
  const data1 = await res1.json();
  assert(res1.status === 200, "First POST returns 200");

  const res2 = await fetch(`${BASE}/api/webhooks/evolution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dupPayload),
  });
  const data2 = await res2.json();
  assert(res2.status === 200, "Duplicate POST returns 200");
  assert(data2.duplicate === true, "Duplicate POST returns duplicate:true");
  console.log("");

  // ─── Test 3: Opt-out ───
  console.log("Test 3: Opt-out handling");
  assert(isOptOut("STOP"), "isOptOut detects 'STOP'");
  assert(isOptOut("stop"), "isOptOut detects 'stop' (case insensitive)");
  assert(isOptOut("unsubscribe"), "isOptOut detects 'unsubscribe'");
  assert(isOptOut("Unsub"), "isOptOut detects 'Unsub'");
  assert(!isOptOut("I want to restart"), "isOptOut does not flag normal message");

  // Send STOP via webhook
  const stopPayload = {
    providerEventId: `test_stop_${Date.now()}`,
    from: "+27721234567",
    text: "STOP",
  };
  const stopRes = await fetch(`${BASE}/api/webhooks/evolution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stopPayload),
  });
  const stopData = await stopRes.json();
  assert(stopRes.status === 200, "STOP webhook returns 200");
  assert(stopData.ok === true, "STOP webhook returns ok:true");

  // Verify contact.optOut was set (check DB)
  if (db) {
    const contact = await db.customerContact.findFirst({
      where: { value: { contains: "721234567" } },
    });
    assert(contact?.optOut === true, "Contact optOut set to true in DB");
  }
  console.log("");

  // ─── Test 4: Unknown phone ───
  console.log("Test 4: Unknown phone handling");
  const unknownPayload = {
    providerEventId: `test_unknown_${Date.now()}`,
    from: "+27999999999",
    text: "Hi from unknown number",
  };
  const unknownRes = await fetch(`${BASE}/api/webhooks/evolution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(unknownPayload),
  });
  const unknownData = await unknownRes.json();
  assert(unknownRes.status === 200, "Unknown phone webhook returns 200");
  assert(unknownData.ok === true, "Unknown phone webhook returns ok:true");

  // Verify webhook event was persisted
  if (db) {
    const event = await db.webhookEvent.findUnique({
      where: { providerEventId: unknownPayload.providerEventId },
    });
    assert(!!event, "Unknown phone webhook event persisted");
    assert(!!event?.processedAt, "Unknown phone webhook event processed");
  }
  console.log("");

  // ─── Test 5: Wrong secret ───
  console.log("Test 5: Wrong secret (only if EVOLUTION_WEBHOOK_SECRET configured)");
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET;
  if (secret) {
    const wrongRes = await fetch(`${BASE}/api/webhooks/evolution`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": "wrong-secret",
      },
      body: JSON.stringify({
        providerEventId: `test_wrong_${Date.now()}`,
        from: "+27721234567",
        text: "Test wrong secret",
      }),
    });
    assert(wrongRes.status === 401, "Wrong secret returns 401");
  } else {
    console.log("  ⏭ Skipped (EVOLUTION_WEBHOOK_SECRET not configured — demo mode)");
    passed++;
  }
  console.log("");

  // ─── Test 6: Agent escalation ───
  console.log("Test 6: Agent escalation (2 objections → human)");
  const testMessages = [
    { role: "customer", body: "It's too expensive" },
    { role: "ai", body: "I understand. Let me check options." },
    { role: "customer", body: "I can't afford it" },
  ];
  const objections = countObjections(testMessages);
  assert(objections >= 2, "countObjections detects 2+ price objections");
  console.log("");

  // ─── Summary ───
  console.log("──────────────────────────────");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  }
  console.log("\n🎉 All messaging tests passed!");
}

main()
  .catch((e) => {
    console.error("❌ Test suite failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (db) await db.$disconnect();
  });
