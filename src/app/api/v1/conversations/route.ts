import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext } from "@/modules/tenants/service";
import { AppError, toErrorResponse } from "@/shared/errors/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/v1/conversations?status=engaged
 * Lists conversations for the current tenant.
 */
export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found", 404);
    }

    if (!db) {
      throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? undefined;
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);

    const where = status
      ? { tenantId: tenant.id, status }
      : { tenantId: tenant.id };

    const [rows, total] = await Promise.all([
      db.conversation.findMany({
        where,
        include: {
          customer: { include: { contacts: true } },
          opportunity: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.conversation.count({ where }),
    ]);

    return NextResponse.json({ data: rows, total, limit, offset });
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
