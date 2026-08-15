import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/modules/tenants/service";
import { previewImport, type ColumnMapping } from "@/modules/imports/service";
import { AppError, toErrorResponse } from "@/shared/errors/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/v1/imports/preview
 * Preview a CSV import without committing.
 */
export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found", 404);
    }

    const body = await req.json();
    const { csvText, mapping } = body as { csvText: string; mapping: ColumnMapping };

    if (!csvText || !mapping) {
      throw new AppError("VALIDATION_ERROR", "csvText and mapping are required", 400);
    }

    const result = await previewImport(tenant.id, csvText, mapping);

    return NextResponse.json({ data: result });
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
