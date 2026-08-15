/**
 * Tenant context resolution.
 *
 * Two modes:
 * 1. Clerk mode (CLERK_SECRET_KEY present): auth().userId → users.clerk_id → membership → tenant
 * 2. Demo mode (no Clerk): returns seeded demo tenant + UI shows "Demo mode" banner
 *
 * This is the SINGLE AUTHORITY for tenant resolution.
 */

import { db } from "@/lib/db";
import { AppError } from "@/shared/errors/types";

export interface TenantContext {
  id: string;
  name: string;
  industry: string;
  role: "owner" | "admin" | "member";
  demoMode: boolean;
}

/**
 * Check if Clerk is configured.
 */
export function isClerkConfigured(): boolean {
  return !!process.env.CLERK_SECRET_KEY && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

/**
 * Get the tenant context for the current request.
 *
 * In Clerk mode: looks up the user by clerkId, finds their membership, returns tenant.
 * In demo mode: returns the seeded demo tenant.
 */
export async function getTenantContext(clerkId?: string): Promise<TenantContext | null> {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  // Clerk mode: if Clerk is configured, try to resolve via clerkId
  if (isClerkConfigured()) {
    // In API routes, clerkId comes from auth().userId
    // For now, if no clerkId is passed, fall back to demo tenant
    // (This allows the demo to work even with Clerk configured but no signed-in user)
    if (clerkId) {
      const membership = await db.membership.findFirst({
        where: { user: { clerkId } },
        include: { tenant: true, user: true },
      });

      if (membership) {
        return {
          id: membership.tenant.id,
          name: membership.tenant.name,
          industry: membership.tenant.industry,
          role: membership.role as "owner" | "admin" | "member",
          demoMode: false,
        };
      }
    }
  }

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
    demoMode: !isClerkConfigured(),
  };
}

/**
 * Creates a new tenant with an owner membership.
 * Used during onboarding when a new Clerk user signs up.
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
      demoMode: false,
    };
  });
}
