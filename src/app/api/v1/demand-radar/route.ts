import { NextResponse } from "next/server";
import { getTenantContext } from "@/modules/tenants/service";
import { getDemandRadar } from "@/modules/marketing-brain/service";
import { AppError, toErrorResponse } from "@/shared/errors/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/v1/demand-radar
 * Returns demand signals grouped by status (emerging, opportunities, briefed).
 */
export async function GET() {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found", 404);
    }

    const radar = await getDemandRadar(tenant.id);
    return NextResponse.json({ data: radar });
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
