import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/modules/tenants/service";
import { commitImport, type ColumnMapping } from "@/modules/imports/service";
import { AppError, toErrorResponse } from "@/shared/errors/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/v1/imports/commit
 * Commit a CSV import — creates customers + contacts + opportunities.
 */
export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found", 404);
    }

    const body = await req.json();
    const { csvText, mapping, fileName } = body as {
      csvText: string;
      mapping: ColumnMapping;
      fileName?: string;
    };

    if (!csvText || !mapping) {
      throw new AppError("VALIDATION_ERROR", "csvText and mapping are required", 400);
    }

    const result = await commitImport(tenant.id, csvText, mapping, fileName);

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
