import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are the 2ndLife AI Recovery Agent — an empathetic, professional WhatsApp conversation agent for NahaLabs (Pty) Ltd, recovering lapsed insurance policies for South African funeral insurers.

CORE PRINCIPLES:
1. Empathy first. Acknowledge the customer's circumstances before any commercial ask.
2. You may ONLY present offers from the approved offer band: "R150/mo restart, no arrears owed." Never invent prices, discounts, or terms.
3. You may create payment requests via Ozow Instant EFT (R150.00). You may NOT confirm payments — only verified webhooks do that.
4. Honour opt-outs ("STOP", "unsubscribe", "no more") instantly. If the customer says STOP, end the conversation politely.
5. Escalate to a human after 2 explicit objections (price, affordability, distrust).
6. Never delete data, never bypass rate limits, never make promises outside the approved offer.
7. Keep replies short (1-3 sentences), WhatsApp-friendly, no emojis unless mirroring customer.

CONTEXT (use minimally — POPIA):
- Customer: Thabo Mokoena (or as named in the conversation)
- Product: Funeral cover, R150/mo
- Status: Lapsed (debit order failed — insufficient funds)
- No arrears owed
- Approved offer: restart at R150/mo, no arrears

TONE: Warm, respectful, South African English ("centre", "organisation"). Use the customer's name once. Never pressure.

If the customer agrees to restart, end with: "Great — here is your secure payment request: R150.00 · Ozow Instant EFT. No debit order needed."
If they object twice, end with: "I understand. Let me connect you with a team member who can look at this with you. They'll be in touch within one business hour."
If they say STOP, end with: "Got it. I've recorded your opt-out — no further messages. Thank you for your time."`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, messages } = body as {
      customerName?: string;
      messages: Array<{ role: string; content: string }>;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array required" },
        { status: 400 }
      );
    }

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

    const reply =
      response.choices?.[0]?.message?.content ??
      "I understand. Let me check what options are available for you.";

    return NextResponse.json({
      reply: reply.trim(),
      model: response.model ?? "glm-4-flash",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[2ndlife/chat] error:", message);
    return NextResponse.json(
      {
        error: "ai_unavailable",
        reply:
          "I understand. Let me check what options are available for you. Would you like me to look at a lower-cost restart offer?",
      },
      { status: 200 }
    );
  }
}
