import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/modules/tenants/service";
import { createPaymentRequest, getPaymentStats } from "@/modules/payments/service";
import { AppError, toErrorResponse } from "@/shared/errors/types";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/v1/payments
 * Creates a payment request (idempotent).
 */
export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found", 404);
    }

    const body = await req.json();
    const result = await createPaymentRequest({
      ...body,
      tenantId: tenant.id,
      idempotencyKey: body.idempotencyKey ?? `pay_${randomUUID()}`,
    });

    return NextResponse.json(
      {
        data: result.payment,
        checkoutUrl: result.checkoutUrl,
        duplicate: result.duplicate,
      },
      { status: result.duplicate ? 200 : 201 }
    );
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}

/**
 * GET /api/v1/payments
 * Returns payment statistics for the dashboard.
 */
export async function GET() {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found", 404);
    }

    const stats = await getPaymentStats(tenant.id);
    return NextResponse.json({ data: stats });
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
