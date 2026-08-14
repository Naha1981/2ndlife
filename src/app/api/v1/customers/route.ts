import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/modules/tenants/service";
import { listCustomers, createCustomer } from "@/modules/customers/service";
import { AppError, toErrorResponse } from "@/shared/errors/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/v1/customers?limit=50&offset=0&status=lapsed
 * Lists customers for the current tenant.
 */
export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found for current user", 404);
    }

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const status = url.searchParams.get("status") ?? undefined;

    const result = await listCustomers({
      tenantId: tenant.id,
      limit,
      offset,
      status: status as "active" | "lapsed" | "failed_debit" | "dormant" | "at_risk" | undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}

/**
 * POST /api/v1/customers
 * Creates a new customer for the current tenant.
 */
export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found for current user", 404);
    }

    const body = await req.json();
    const created = await createCustomer({
      ...body,
      tenantId: tenant.id,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
