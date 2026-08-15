# WhatsApp Architecture & User Journey — The Complete Reference

This document explains how WhatsApp works as the **central transactional channel** across all 28 modules and every vertical. This is the single source of truth for the WhatsApp layer.

---

## 1. Architectural Principles

### 1.1 WhatsApp is the primary transactional channel

Every customer interaction that leads to revenue flows through WhatsApp:
```
Social/Website/Ad/QR/Google → WhatsApp AI Employee → Qualification → Booking → Payment → Customer
```

Email is secondary. Web chat is secondary. Phone is secondary. WhatsApp is the spine.

### 1.2 Single Provider Abstraction

All WhatsApp code goes through `MessagingProvider` interface. No file outside `src/lib/2ndlife/messaging/` may call the Evolution API directly. This lets you swap providers (Evolution → WhatsApp Business Cloud API → 360dialog) with a one-file change.

```ts
interface MessagingProvider {
  sendMessage(input: OutboundMessage): Promise<OutboundResult>
  getStatus(providerMessageId: string): Promise<DeliveryStatus>
}
```

### 1.3 Webhook-first, never polling

Evolution pushes events to `/api/webhooks/evolution`. The app never polls Evolution for status. This is how WhatsApp achieves idempotency and auditability.

### 1.4 Tool-grounded AI conversations

The AI Employee uses a **tool registry** to fetch real business data. It never invents prices, availability, offers, or customer facts. Every factual statement in a WhatsApp reply traces back to a tool call.

---

## 2. Technical Architecture

### 2.1 Inbound message flow (customer → AI)

```
Customer WhatsApp
    ↓
Evolution API (on Render)
    ↓
POST /api/webhooks/evolution (with secret header)
    ↓
1. Verify signature (fail closed if wrong)
2. Persist raw payload to webhook_events (audit + replay)
3. Check idempotency key (providerEventId) — duplicate → 200 { duplicate: true }
4. Normalize at boundary (phone → E.164, ignore bot messages)
5. Handle opt-out (STOP/STOPPE/UNSUB → set contact.optOut, audit log, no reply)
6. Find or open Conversation (link to top open Opportunity if exists)
7. Append customer Message to conversation_messages
8. Call AI Revenue Employee service:
   - Load conversation history
   - Load Business Brain (tenant's knowledge)
   - Load customer 360 context (minimized per POPIA)
   - Call Vercel AI SDK with tools
   - AI returns reply + actions[]
9. Append AI Message
10. For each action: execute via tool (create_booking, send_payment, etc.)
11. ALWAYS return 2xx (Evolution retries on 5xx)
```

### 2.2 Outbound message flow (AI/system → customer)

```
Service decides to send (campaign, AI reply, reminder, etc.)
    ↓
getMessagingProvider().sendMessage({ tenantId, to, text, conversationId })
    ↓
EvolutionAdapter POSTs to Evolution API
    ↓
Result persisted (providerMessageId + status)
    ↓
Later: Evolution webhook pushes delivery/read status → /api/webhooks/evolution
    ↓
Message.deliveryStatus updated (sent → delivered → read)
```

### 2.3 The AI tool registry (what the AI can do)

Every tool is Zod-validated, tenant-scoped, permission-checked, and audit-logged:

| Tool | Category | Effect |
|---|---|---|
| `get_business_info` | Read | Brand, services, hours, policies |
| `get_service` / `get_price` | Read | Service details, approved pricing bands |
| `get_availability` | Read | Real-time calendar slots |
| `get_customer` | Read | Customer 360 (context-minimized) |
| `get_loyalty_balance` | Read | Points, tier, rewards |
| `get_recovery_opportunity` | Read | Outstanding balance, approved offers |
| `get_demand_signal` | Read | Trending topics (for proactive outreach) |
| `create_booking` | Write | Books appointment (availability-checked) |
| `create_payment_request` | Write | Generates payment link (Ozow/Yoco/PayFast) |
| `send_whatsapp` | Write | Sends follow-up message |
| `create_campaign` | Write | Creates recovery/retention campaign |
| `update_recovery_status` | Write | Advances opportunity through states |
| `escalate_to_human` | Write | Routes conversation to staff |
| `record_opt_out` | Write | Honours STOP, suppresses contact |

**What AI may NEVER do independently:** invent discounts, change pricing, confirm payments, delete customer data, mark revenue recovered, bypass campaign limits, ignore opt-outs, diagnose medical conditions, give financial advice.

### 2.4 Conversation state machine

```
        ┌──────────┐
        │   NEW    │  (first inbound)
        └────┬─────┘
             ↓
      ┌──────────────┐
      │  QUALIFYING  │  (AI determining intent)
      └──────┬───────┘
             ↓
      ┌──────────────┐      ┌──────────────┐
      │  ENGAGED     │ ←──→ │  NEGOTIATING │
      └──────┬───────┘      └──────┬───────┘
             ↓                     ↓
      ┌──────────────┐      ┌──────────────┐
      │   BOOKED     │      │  ESCALATED   │ (human takes over)
      └──────┬───────┘      └──────────────┘
             ↓
      ┌──────────────┐
      │ PAYMENT_SENT │ (request sent, awaiting webhook)
      └──────┬───────┘
             ↓
      ┌──────────────┐
      │  CONFIRMED   │ (webhook verified)
      └──────┬───────┘
             ↓
      ┌──────────────┐
      │  CONVERTED   │ (customer lifecycle advances)
      └──────────────┘
```

Parallel states: `SUPPRESSED` (opt-out), `FAILED` (unresponsive after N attempts), `UNRESPONSIVE` (no reply in window).

---

## 3. User Journey by Industry

### 3.1 Dental / Aesthetic / Medical Clinics
1. Customer sees Instagram Reel about teeth whitening (content engine produced it from a detected social question)
2. Clicks "WhatsApp us" button on website
3. AI Employee qualifies: "Are you looking for whitening, implants, or a check-up?"
4. Customer: "Whitening"
5. AI: uses `get_service('whitening')` → "We offer in-chair whitening from R1,800. It takes 60 minutes. Would you like to book a consultation?"
6. Customer: "Yes, Saturday"
7. AI: uses `get_availability(saturday)` → "I have 10:00 or 14:00 open. Which works?"
8. Customer: "10:00"
9. AI: uses `create_booking()` → "Booked. R300 deposit to confirm — here's your secure link."
10. Customer pays via Ozow → webhook confirms → `CONFIRMED`
11. 48h, 24h, 6h reminders sent automatically
12. Customer attends → treatment done → follow-up 24h later
13. 6 months later: retention engine detects silence → win-back campaign
14. If patient lapses: Recovery Engine scores and re-engages

**Vertical guardrails:** No diagnosis. No treatment claims. No fabricated results. Escalate clinical questions to practitioner immediately. HPCSA-aligned.

### 3.2 Restaurants
1. Customer comments on Facebook post: "Do you have vegan options?"
2. Social Micro-Reply Agent answers: "Yes — we have 8 vegan mains. Full menu on WhatsApp →"
3. Customer clicks → AI Employee qualifies: "Booking for tonight?"
4. Customer: "Table for 4, 19:00"
5. AI: `get_availability()` → "19:00 has 2 tables left. Name?"
6. `create_booking()` → confirmation sent
7. Day-of reminder with Google Maps link
8. Post-dinner: "How was your meal? ⭐⭐⭐⭐⭐ → tap to review on Google"
9. Next visit: "Welcome back, Thabo. Your usual table?"
10. Loyalty: "JOIN" → points per visit → "BALANCE" → "REDEEM" for free dessert
11. Tuesday 14:00 empty slot detected → Fill Quiet Hours engine targets nearby customers
12. Customer who hasn't visited in 60 days → retention campaign

### 3.3 Salons / Barbers / Spas
1. Customer DMs Instagram: "How much for balayage?"
2. AI qualifies: length, current colour, desired result
3. `get_service('balayage')` → price band "R1,200–R2,500 depending on length"
4. `get_availability()` with stylist preferences
5. Booking + deposit
6. Reminders
7. Post-service: "How's your hair feeling? Book your touch-up in 8 weeks"
8. Retail follow-up: "Time to restock your shampoo? Order via WhatsApp"
9. Loyalty points on every visit
10. Stylist going on leave → AI proactively rebooks affected clients

### 3.4 Funeral / Insurance / Financial Services
1. CSV import of 10,000 lapsed policies
2. Scoring Engine ranks each 0–100 (deterministic, explainable)
3. Campaign created: "Win back high-value lapsed members"
4. WhatsApp outbound to top-scored customers (business hours, rate-limited)
5. AI Employee: "Hi Sipho, your cover lapsed in January. You don't owe arrears. Want to restart for R150/mo?"
6. Customer: "Too expensive"
7. AI: uses `pricing.get_allowed_offer` → "I understand. We can look at a lower-cost option. Shall I check?"
8. Customer: "Yes"
9. AI presents approved R120/mo option
10. `create_payment_request()` via Ozow
11. Customer pays → webhook verifies → `opportunity.status = 'recovered'`
12. Dashboard: "R150 recovered, verified via webhook"
13. If customer objects twice → escalate to human agent

**Vertical guardrails:** FAIS/FSCA-compliant. No unauthorized financial advice. Approved product information only.

### 3.5–3.10 Automotive, Gyms, B2B Services, Retail, Education, Pet Services
(See full journeys in the source document — each follows the same DISCOVER → ENQUIRE → QUALIFY → BOOK/PAY → ATTEND → DELIGHT → RETAIN → AT-RISK → DORMANT → RECOVER lifecycle.)

---

## 4. The Universal Customer Journey (ALL verticals)

```
1. DISCOVER  →  Customer finds business (content, search, social, referral, ad)
      ↓
2. ENQUIRE   →  First contact (WhatsApp, web form, DM, call)
      ↓
3. QUALIFY   →  AI determines intent, budget, urgency, fit
      ↓
4. BOOK/PAY  →  Commitment captured (booking + deposit, or direct payment)
      ↓
5. ATTEND    →  Service delivered / product received
      ↓
6. DELIGHT   →  Follow-up, review request, satisfaction check
      ↓
7. RETAIN    →  Reminders, loyalty, replenishment, upsell
      ↓
8. AT-RISK   →  Silence detected, retention campaign
      ↓
9. DORMANT   →  Win-back campaign
      ↓
10. RECOVER  →  Lapsed recovery OR final suppression
```

---

## 5. Guardrails & Safety (non-negotiable)

### 5.1 POPIA compliance
- Explicit consent recorded at first contact
- Opt-out honoured instantly (STOP/STOPPE/UNSUB/END)
- Purpose limitation: only message for stated purpose
- Data minimization: AI receives only task-relevant fields
- Right to deletion: one command wipes all customer data + AI memory
- Retention limits: configurable per tenant

### 5.2 Content guardrails
- AI never invents pricing, availability, offers, or customer facts
- All factual claims traceable to tool call
- Restricted topics per vertical (clinical, financial, legal)
- Compliance check before any outbound message in regulated verticals

### 5.3 Cadence guardrails
- Business hours respected (default 09:00–17:00 SAST, configurable)
- Rate limits per channel (Evolution API limits respected)
- Max attempts per customer (configurable, default 3)
- Stop conditions: opt-out, hard bounce, "do not contact"

### 5.4 Escalation rules
- AI escalation triggers: 2+ objections, clinical question, legal question, high-value deal, frustrated tone, explicit request
- Handoff preserves full conversation context
- Human can take over mid-conversation without customer noticing
- Audit log of every handoff

---

## 6. Attribution Chain (the closed loop)

Every WhatsApp message is tagged with a `conversation_id`, which links to:
- `lead_id` (source: content, ad, social, search)
- `opportunity_id` (recovery or new business)
- `campaign_id` (if part of campaign)
- `booking_id` (if converted)
- `payment_id` (if paid)
- `revenue_event_id` (verified revenue)
- `capi_event_id` (sent to Meta CAPI)
- `google_conversion_id` (sent to Google)

This enables:
- **Forward attribution:** "This TikTok comment → 3 days later → R1,200 booking"
- **Backward attribution:** "This R1,200 booking ← came from this content brief ← triggered by this social question"
- **Campaign ROI:** "Win-back campaign A recovered R47,000 at R0.12 per message"
- **Channel ROI:** "WhatsApp converts at 12.4%, email at 1.8%"

---

## 7. Multi-Tenant Isolation (WhatsApp-specific)

- One Evolution API instance per tenant (or shared with strict instance routing)
- Every inbound webhook matched to tenant via phone number → contact → tenant_id
- Outbound messages always scoped to tenant's Evolution instance
- Conversation history strictly tenant-scoped
- AI memory strictly tenant-scoped (pgvector namespace per tenant)
- Cross-tenant leak tests run in CI — a leak is Sev-1
