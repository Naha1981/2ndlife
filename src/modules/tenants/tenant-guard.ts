/**
 * Tenant isolation guard.
 * Every service query MUST filter by tenantId. This helper enforces it.
 */

import { Prisma } from "@prisma/client";

/**
 * Returns a Prisma where clause that enforces tenant scoping.
 * Throws if tenantId is missing — fail closed, never leak data.
 */
export function tenantWhere(tenantId: string): { tenantId: string } {
  if (!tenantId || typeof tenantId !== "string") {
    throw new Error("TENANT_ISOLATION: tenantId required for every query");
  }
  return { tenantId };
}

/**
 * Combines tenant isolation with an additional where clause.
 */
export function tenantScopedWhere<T extends Prisma.WhereInput>(
  tenantId: string,
  extra: T
): T & { tenantId: string } {
  return { ...extra, ...tenantWhere(tenantId) };
}
