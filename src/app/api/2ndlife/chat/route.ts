import { NextRequest, NextResponse } from "next/server";
import { runRecoveryAgentForUI } from "@/modules/messaging/recovery-agent-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/2ndlife/chat
 * UI chat panel endpoint — a human plays the customer and the AI replies.
 * This is the demo/testing path. The real inbound path is /api/webhooks/evolution.
 */
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

    const result = await runRecoveryAgentForUI(customerName, messages);

    return NextResponse.json({
      reply: result.reply,
      model: "glm-4-flash",
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
