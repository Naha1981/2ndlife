import { NextResponse } from "next/server";
import { getTenantContext } from "@/modules/tenants/service";
import { getImportHistory } from "@/modules/imports/service";
import { AppError, toErrorResponse } from "@/shared/errors/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/v1/imports
 * Returns import history for the current tenant.
 */
export async function GET() {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found", 404);
    }

    const history = await getImportHistory(tenant.id);
    return NextResponse.json({ data: history });
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
