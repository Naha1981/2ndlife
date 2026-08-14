/**
 * Customer service — tenant-isolated, Zod-validated.
 * UI never touches DB directly; it goes through this service via /api/v1/customers.
 */

import { db } from "@/lib/db";
import { AppError } from "@/shared/errors/types";
import { tenantWhere } from "@/modules/tenants/tenant-guard";
import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────

export const listCustomersSchema = z.object({
  tenantId: z.string().min(1),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  status: z
    .enum(["active", "lapsed", "failed_debit", "dormant", "at_risk"])
    .optional(),
});
export type ListCustomersInput = z.infer<typeof listCustomersSchema>;

export const getCustomerSchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
});
export type GetCustomerInput = z.infer<typeof getCustomerSchema>;

export const createCustomerSchema = z.object({
  tenantId: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100).optional(),
  externalId: z.string().max(100).optional(),
  status: z
    .enum(["active", "lapsed", "failed_debit", "dormant", "at_risk"])
    .default("active"),
  lifetimeValue: z.number().min(0).optional(),
  contacts: z
    .array(
      z.object({
        type: z.enum(["phone", "email"]),
        value: z.string().min(1).max(200),
        isPrimary: z.boolean().default(false),
        whatsappValid: z.boolean().default(false),
      })
    )
    .default([]),
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

// ─── Service functions ──────────────────────────────────────────

export async function listCustomers(input: ListCustomersInput) {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");
  const { tenantId, limit, offset, status } = listCustomersSchema.parse(input);

  const where = status
    ? { ...tenantWhere(tenantId), status }
    : tenantWhere(tenantId);

  const [rows, total] = await Promise.all([
    db.customer.findMany({
      where,
      include: { contacts: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    db.customer.count({ where }),
  ]);

  return { data: rows, total, limit, offset };
}

export async function getCustomer(input: GetCustomerInput) {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");
  const { tenantId, customerId } = getCustomerSchema.parse(input);

  const row = await db.customer.findFirst({
    where: { ...tenantWhere(tenantId), id: customerId },
    include: {
      contacts: true,
      opportunities: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      conversations: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { messages: { take: 5, orderBy: { createdAt: "desc" } } },
      },
    },
  });

  if (!row) {
    throw new AppError("NOT_FOUND", "Customer not found", 404);
  }
  return row;
}

export async function createCustomer(input: CreateCustomerInput) {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");
  const parsed = createCustomerSchema.parse(input);
  const { contacts, ...customerData } = parsed;

  return db.customer.create({
    data: {
      ...customerData,
      ...tenantWhere(parsed.tenantId),
      contacts: contacts.length
        ? {
            create: contacts.map((c) => ({
              ...c,
              tenantId: parsed.tenantId,
            })),
          }
        : undefined,
    },
    include: { contacts: true },
  });
}

/**
 * Tenant isolation test — verifies that tenant B cannot see tenant A's customers.
 * Used by the test suite.
 */
export async function assertTenantIsolation(tenantA: string, tenantB: string) {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  const aCustomer = await db.customer.create({
    data: {
      ...tenantWhere(tenantA),
      firstName: "IsolationTest",
      lastName: "TenantA",
    },
  });

  // Tenant B should NOT see tenant A's customer
  const bQuery = await db.customer.findFirst({
    where: { ...tenantWhere(tenantB), id: aCustomer.id },
  });

  if (bQuery) {
    throw new AppError(
      "TENANT_ISOLATION",
      "CRITICAL: tenant B can see tenant A's customer — isolation broken!"
    );
  }

  // Cleanup
  await db.customer.delete({ where: { id: aCustomer.id } });
  return { isolated: true };
}
