import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantContext } from "@/modules/tenants/service";
import { getVerifiedRecoveredRevenue, getPaymentStats } from "@/modules/payments/service";
import { AppError, toErrorResponse } from "@/shared/errors/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/v1/revenue-stats
 *
 * Returns REAL revenue statistics from the database.
 * "Revenue Recovered" = sum of payments with status='confirmed' (verified webhook only).
 *
 * This is the ONLY source of truth for recovered revenue.
 * The dashboard MUST use this endpoint, not hardcoded numbers.
 */
export async function GET() {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new AppError("NOT_FOUND", "No tenant found", 404);
    }

    if (!db) {
      throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");
    }

    // ─── Verified recovered revenue (from confirmed payments) ───
    const recoveredRevenue = await getVerifiedRecoveredRevenue(tenant.id);

    // ─── Payment stats ───
    const paymentStats = await getPaymentStats(tenant.id);

    // ─── Revenue at risk: sum of opportunity estimatedValue where status != 'recovered' ───
    const atRiskResult = await db.recoveryOpportunity.aggregate({
      where: {
        tenantId: tenant.id,
        status: { notIn: ["recovered", "suppressed", "declined"] },
      },
      _sum: { estimatedValue: true },
      _count: true,
    });

    // ─── Total opportunities ───
    const totalOpportunities = await db.recoveryOpportunity.count({
      where: { tenantId: tenant.id },
    });

    // ─── Recovered opportunities count ───
    const recoveredOpportunities = await db.recoveryOpportunity.count({
      where: { tenantId: tenant.id, status: "recovered" },
    });

    // ─── Recovery funnel (from real DB data) ───
    const [uploaded, contacted, engaged, payments, recovered] = await Promise.all([
      db.recoveryOpportunity.count({ where: { tenantId: tenant.id } }),
      db.recoveryOpportunity.count({
        where: { tenantId: tenant.id, status: { in: ["contacted", "engaged", "negotiating", "converted", "recovered", "declined", "unresponsive"] } },
      }),
      db.recoveryOpportunity.count({
        where: { tenantId: tenant.id, status: { in: ["engaged", "negotiating", "converted", "recovered"] } },
      }),
      db.payment.count({ where: { tenantId: tenant.id, status: "confirmed" } }),
      db.recoveryOpportunity.count({ where: { tenantId: tenant.id, status: "recovered" } }),
    ]);

    return NextResponse.json({
      data: {
        revenueRecovered: recoveredRevenue,
        revenueAtRisk: atRiskResult._sum.estimatedValue ?? 0,
        atRiskOpportunities: atRiskResult._count,
        paymentStats,
        funnel: {
          uploaded,
          contacted,
          engaged,
          payments,
          recovered,
        },
        totalOpportunities,
        recoveredOpportunities,
      },
    });
  } catch (err) {
    const { error, status } = toErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
