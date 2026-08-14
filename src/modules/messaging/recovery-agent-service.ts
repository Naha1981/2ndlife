/**
 * Recovery Agent Service — the shared AI logic for WhatsApp recovery conversations.
 *
 * This is the SINGLE AUTHORITY for AI-driven conversation logic.
 * Called by:
 *   1. /api/2ndlife/chat (UI chat panel — human plays customer)
 *   2. /api/webhooks/evolution (real inbound WhatsApp messages)
 *
 * Returns the AI reply + any actions to take (escalate, opt-out, payment request).
 */

import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

export interface AgentAction {
  type: "escalate" | "opt_out" | "payment_request" | "none";
  amount?: number;
}

export interface AgentResult {
  reply: string;
  actions: AgentAction[];
}

const SYSTEM_PROMPT = `You are the 2ndLife AI Recovery Agent — an empathetic, professional WhatsApp conversation agent for NahaLabs (Pty) Ltd, recovering lapsed customers and lost revenue for South African businesses.

CORE PRINCIPLES:
1. Empathy first. Acknowledge the customer's circumstances before any commercial ask.
2. You may ONLY present offers from the approved offer band provided in context. Never invent prices, discounts, or terms.
3. You may create payment requests via Instant EFT (Ozow). You may NOT confirm payments — only verified webhooks do that.
4. Honour opt-outs ("STOP", "unsubscribe", "no more") instantly. If the customer says STOP, end the conversation politely.
5. Escalate to a human after 2 explicit objections (price, affordability, distrust).
6. Never delete data, never bypass rate limits, never make promises outside the approved offer.
7. Keep replies short (1-3 sentences), WhatsApp-friendly, no emojis unless mirroring customer.

TONE: Warm, respectful, South African English ("centre", "organisation"). Use the customer's name once. Never pressure.

If the customer agrees to restart, end with: "Great — here is your secure payment request: R150.00 · Ozow Instant EFT. No debit order needed."
If they object twice, end with: "I understand. Let me connect you with a team member who can look at this with you. They'll be in touch within one business hour."
If they say STOP, end with: "Got it. I've recorded your opt-out — no further messages. Thank you for your time."`;

const OPT_OUT_REGEX = /^(stop|stoppe|unsub|unsubscribe|end|opt[\s-]?out|no more|remove)\b/i;

const OBJECTION_KEYWORDS = [
  "expensive",
  "afford",
  "can't pay",
  "cannot pay",
  "too much",
  "price",
  "cost",
  "money",
  "distrust",
  "don't trust",
  "scam",
];

/**
 * Detect opt-out intent from customer message.
 */
export function isOptOut(text: string): boolean {
  return OPT_OUT_REGEX.test(text.trim());
}

/**
 * Count objection signals in conversation history.
 */
export function countObjections(messages: Array<{ role: string; body: string }>): number {
  return messages.filter(
    (m) =>
      m.role === "customer" &&
      OBJECTION_KEYWORDS.some((kw) => m.body.toLowerCase().includes(kw))
  ).length;
}

/**
 * Run the recovery agent on a conversation.
 *
 * @param tenantId - tenant scope
 * @param conversationId - the conversation to process
 * @param customerText - the inbound customer message text
 * @returns { reply, actions[] } — the AI reply and any actions to take
 */
export async function runRecoveryAgent(
  tenantId: string,
  conversationId: string,
  customerText: string
): Promise<AgentResult> {
  if (!db) {
    return {
      reply: "I understand. Let me check what options are available for you.",
      actions: [{ type: "none" }],
    };
  }

  // Load conversation + messages + customer context
  const conversation = await db.conversation.findFirst({
    where: { id: conversationId, tenantId },
    include: {
      customer: { include: { contacts: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
      opportunity: true,
    },
  });

  if (!conversation) {
    return {
      reply: "I understand. Let me check what options are available for you.",
      actions: [{ type: "none" }],
    };
  }

  // Check opt-out FIRST — before calling AI
  if (isOptOut(customerText)) {
    return {
      reply: "Got it. I've recorded your opt-out — no further messages. Thank you for your time.",
      actions: [{ type: "opt_out" }],
    };
  }

  // Build context for the AI (minimized — POPIA)
  const customerName = conversation.customer
    ? `${conversation.customer.firstName ?? ""} ${conversation.customer.lastName ?? ""}`.trim()
    : "the customer";

  const opportunity = conversation.opportunity;
  const contextLine = opportunity
    ? `\n\nCUSTOMER CONTEXT:\n- Name: ${customerName}\n- Category: ${opportunity.category}\n- Estimated value: R${opportunity.estimatedValue ?? 0}\n- Approved offer: R150/mo restart, no arrears\n- Status: ${opportunity.status}`
    : `\n\nCUSTOMER NAME: ${customerName}`;

  // Count objections in history + current message
  const allMessages = [
    ...conversation.messages.map((m) => ({ role: m.role, body: m.body })),
    { role: "customer", body: customerText },
  ];
  const objections = countObjections(allMessages);

  // If 2+ objections, escalate — don't call AI for a commercial reply
  if (objections >= 2) {
    return {
      reply:
        "I understand. Let me connect you with a team member who can look at this with you. They'll be in touch within one business hour.",
      actions: [{ type: "escalate" }],
    };
  }

  // Call the AI via z-ai-web-dev-sdk
  try {
    const zai = await ZAI.create();
    const systemWithCustomer = SYSTEM_PROMPT + contextLine;

    const response = await zai.chat.completions.create({
      model: "glm-4-flash",
      messages: [
        { role: "system", content: systemWithCustomer },
        ...allMessages.map((m) => ({
          role: m.role === "ai" ? "assistant" : m.role === "customer" ? "user" : m.role,
          content: m.body,
        })),
      ],
      temperature: 0.7,
      max_tokens: 220,
    });

    const reply =
      response.choices?.[0]?.message?.content?.trim() ??
      "I understand. Let me check what options are available for you.";

    // Detect payment request intent in the reply
    const actions: AgentAction[] = [{ type: "none" }];
    if (/R150\.00|payment request|Ozow/i.test(reply)) {
      actions.push({ type: "payment_request", amount: 150 });
    }

    return { reply, actions };
  } catch (err) {
    console.error("[recovery-agent] AI error:", err instanceof Error ? err.message : err);
    return {
      reply:
        "I understand. Let me check what options are available for you. Would you like me to look at a lower-cost restart offer?",
      actions: [{ type: "none" }],
    };
  }
}

/**
 * Lightweight version for the UI chat panel (no DB conversation needed).
 * Used when a human is playing the customer in the demo.
 */
export async function runRecoveryAgentForUI(
  customerName: string | undefined,
  messages: Array<{ role: string; content: string }>
): Promise<{ reply: string }> {
  // Check opt-out
  const lastCustomerMsg = [...messages].reverse().find((m) => m.role === "customer");
  if (lastCustomerMsg && isOptOut(lastCustomerMsg.content)) {
    return {
      reply: "Got it. I've recorded your opt-out — no further messages. Thank you for your time.",
    };
  }

  // Count objections
  const objections = messages.filter(
    (m) =>
      m.role === "customer" &&
      OBJECTION_KEYWORDS.some((kw) => m.content.toLowerCase().includes(kw))
  ).length;

  if (objections >= 2) {
    return {
      reply:
        "I understand. Let me connect you with a team member who can look at this with you. They'll be in touch within one business hour.",
    };
  }

  try {
    const zai = await ZAI.create();
    const systemWithCustomer = customerName
      ? `${SYSTEM_PROMPT}\n\nCUSTOMER NAME: ${customerName}`
      : SYSTEM_PROMPT;

    const response = await zai.chat.completions.create({
      model: "glm-4-flash",
      messages: [
        { role: "system", content: systemWithCustomer },
        ...messages.map((m) => ({
          role: m.role === "ai" ? "assistant" : m.role === "customer" ? "user" : m.role,
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 220,
    });

    return {
      reply:
        response.choices?.[0]?.message?.content?.trim() ??
        "I understand. Let me check what options are available for you.",
    };
  } catch (err) {
    console.error("[recovery-agent] UI AI error:", err instanceof Error ? err.message : err);
    return {
      reply:
        "I understand. Let me check what options are available for you. Would you like me to look at a lower-cost restart offer?",
    };
  }
}
