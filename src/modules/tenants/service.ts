/**
 * Tenant context resolution.
 * In production: maps Clerk userId → tenant via memberships table.
 * In this sandbox demo: uses a seeded demo tenant so the API works without auth.
 */

import { db } from "@/lib/db";
import { AppError } from "@/shared/errors/types";

export interface TenantContext {
  id: string;
  name: string;
  industry: string;
  role: "owner" | "admin" | "member";
}

/**
 * Demo mode: returns the seeded demo tenant.
 * Production: would look up memberships by clerkId.
 */
export async function getTenantContext(clerkId?: string): Promise<TenantContext | null> {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  // In production, this would be:
  // const membership = await db.membership.findFirst({
  //   where: { user: { clerkId } },
  //   include: { tenant: true }
  // });

  // Demo mode: return the seeded demo tenant
  const tenant = await db.tenant.findFirst({
    where: { id: "demo-tenant" },
  });
  if (!tenant) return null;

  return {
    id: tenant.id,
    name: tenant.name,
    industry: tenant.industry,
    role: "owner",
  };
}

/**
 * Creates a new tenant with an owner membership.
 */
export async function createTenantWithOwner(input: {
  name: string;
  industry?: string;
  clerkId: string;
  email: string;
  userName?: string;
}): Promise<TenantContext> {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  return db.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        id: `tenant-${Date.now()}`,
        name: input.name,
        industry: input.industry ?? "general",
      },
    });
    const user = await tx.user.upsert({
      where: { clerkId: input.clerkId },
      update: {},
      create: {
        clerkId: input.clerkId,
        email: input.email,
        name: input.userName,
      },
    });
    await tx.membership.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: "owner",
      },
    });
    return {
      id: tenant.id,
      name: tenant.name,
      industry: tenant.industry,
      role: "owner" as const,
    };
  });
}
