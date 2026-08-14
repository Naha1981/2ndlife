import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext } from "@/modules/tenants/service";
import { AppError, toErrorResponse } from "@/shared/errors/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/v1/conversations/:id
 * Returns a conversation with its messages (tenant-scoped).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found", 404);
    }

    if (!db) {
      throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");
    }

    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, tenantId: tenant.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        customer: {
          include: { contacts: true },
        },
        opportunity: true,
      },
    });

    if (!conversation) {
      throw new AppError("NOT_FOUND", "Conversation not found", 404);
    }

    return NextResponse.json({ data: conversation });
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
