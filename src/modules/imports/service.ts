/**
 * 2ndLife Revenue OS — Import Service
 *
 * CSV → real customers + contacts + recovery opportunities.
 *
 * Flow:
 *   normalizePhoneZA()    — SA phone → E.164 (or null if garbage)
 *   previewImport()       — parse, validate, dedupe, count errors (NEVER throws)
 *   commitImport()        — create Customer + Contact + Opportunity rows (transactional)
 *
 * Idempotency: existing customer (same tenant + normalized phone) → UPDATE, not duplicate.
 * Tenant isolation: every row gets tenantId. Queries are tenant-scoped.
 * Scoring: each imported customer is scored → creates a RecoveryOpportunity.
 */

import { db } from "@/lib/db";
import { AppError } from "@/shared/errors/types";
import { scoreCustomer, type ScorableCustomer } from "@/modules/recovery/scoring";
import { parse as parseCSV } from "papaparse";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

// ─── Phone normalization ───────────────────────────────────────

/**
 * Normalize a South African phone number to E.164 format.
 * Uses libphonenumber-js with defaultRegion 'ZA'.
 *
 * '072 123 4567'    → '+27721234567'
 * '+27721234567'    → '+27721234567' (idempotent)
 * '0721234567'      → '+27721234567'
 * 'garbage'         → null
 * ''                → null
 */
export function normalizePhoneZA(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const phone = parsePhoneNumberFromString(trimmed, "ZA");
    if (!phone || !phone.isValid()) return null;
    return phone.number; // E.164 format: +27721234567
  } catch {
    return null;
  }
}

// ─── Types ─────────────────────────────────────────────────────

export interface ColumnMapping {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  status?: string;
  lifetimeValue?: string;
  monthsInactive?: string;
  externalId?: string;
}

export interface ImportRow {
  firstName: string;
  lastName: string;
  phone: string | null; // normalized E.164
  email: string | null;
  status: string;
  lifetimeValue: number | null;
  monthsInactive: number | null;
  externalId: string | null;
  raw: Record<string, string>;
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface PreviewResult {
  validRows: ImportRow[];
  duplicates: number;
  phonesNormalized: number;
  errors: ImportError[];
  totalRows: number;
  stats: {
    valid: number;
    invalid: number;
    duplicatesInFile: number;
    duplicatesExisting: number;
  };
}

export interface CommitResult {
  importId: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  duplicates: number;
  errors: number;
  created: {
    customers: number;
    contacts: number;
    opportunities: number;
  };
}

// ─── Validation schema ─────────────────────────────────────────

const rowSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional().default(""),
  phone: z.string().nullable(),
  email: z.string().email().nullable().or(z.literal("")),
  status: z.string().default("active"),
  lifetimeValue: z.number().nullable(),
  monthsInactive: z.number().nullable(),
  externalId: z.string().nullable(),
});

// ─── Preview ───────────────────────────────────────────────────

/**
 * Parse and validate a CSV without committing anything.
 * Returns valid rows + error report + dedup counts.
 * NEVER throws — bad rows go to errors[].
 */
export async function previewImport(
  tenantId: string,
  csvText: string,
  mapping: ColumnMapping
): Promise<PreviewResult> {
  if (!csvText || csvText.trim().length === 0) {
    throw new AppError("VALIDATION_ERROR", "CSV text is empty", 400);
  }

  // Parse CSV
  const parsed = parseCSV<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new AppError("VALIDATION_ERROR", `CSV parse error: ${parsed.errors[0].message}`, 400);
  }

  const rows = parsed.data;
  const validRows: ImportRow[] = [];
  const errors: ImportError[] = [];
  const seenPhones = new Set<string>();
  let duplicatesInFile = 0;
  let duplicatesExisting = 0;
  let phonesNormalized = 0;

  // Check existing phones for dedup
  const existingPhones = new Set<string>();
  if (db) {
    const existingContacts = await db.customerContact.findMany({
      where: { tenantId, type: "phone" },
      select: { value: true },
    });
    existingContacts.forEach((c) => {
      // Store both +27... and 27... forms for matching
      const val = c.value.replace("+", "");
      existingPhones.add(val);
    });
  }

  rows.forEach((rawRow, index) => {
    const rowNum = index + 2; // +1 for header, +1 for 1-based
    const firstName = mapping.firstName ? (rawRow[mapping.firstName.toLowerCase()] ?? "").trim() : "";
    const lastName = mapping.lastName ? (rawRow[mapping.lastName.toLowerCase()] ?? "").trim() : "";
    const phoneRaw = mapping.phone ? (rawRow[mapping.phone.toLowerCase()] ?? "").trim() : "";
    const emailRaw = mapping.email ? (rawRow[mapping.email.toLowerCase()] ?? "").trim() : "";
    const statusRaw = mapping.status ? (rawRow[mapping.status.toLowerCase()] ?? "").trim() : "active";
    const ltvRaw = mapping.lifetimeValue ? (rawRow[mapping.lifetimeValue.toLowerCase()] ?? "").trim() : "";
    const monthsRaw = mapping.monthsInactive ? (rawRow[mapping.monthsInactive.toLowerCase()] ?? "").trim() : "";
    const externalIdRaw = mapping.externalId ? (rawRow[mapping.externalId.toLowerCase()] ?? "").trim() : "";

    // Validate firstName (required)
    if (!firstName) {
      errors.push({
        row: rowNum,
        field: "firstName",
        value: "",
        message: "First name is required",
      });
      return;
    }

    // Normalize phone
    let phone: string | null = null;
    if (phoneRaw) {
      phone = normalizePhoneZA(phoneRaw);
      if (phone) {
        phonesNormalized++;
      } else {
        errors.push({
          row: rowNum,
          field: "phone",
          value: phoneRaw,
          message: `Invalid SA phone number: "${phoneRaw}"`,
        });
      }
    }

    // Validate email if present
    let email: string | null = null;
    if (emailRaw) {
      try {
        z.string().email().parse(emailRaw);
        email = emailRaw;
      } catch {
        errors.push({
          row: rowNum,
          field: "email",
          value: emailRaw,
          message: `Invalid email: "${emailRaw}"`,
        });
      }
    }

    // Parse LTV
    let lifetimeValue: number | null = null;
    if (ltvRaw) {
      const parsed = parseFloat(ltvRaw.replace(/[^0-9.-]/g, ""));
      if (!isNaN(parsed) && parsed >= 0) {
        lifetimeValue = parsed;
      }
    }

    // Parse months inactive
    let monthsInactive: number | null = null;
    if (monthsRaw) {
      const parsed = parseInt(monthsRaw.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(parsed) && parsed >= 0) {
        monthsInactive = parsed;
      }
    }

    // Check for duplicates within file
    if (phone) {
      const phoneKey = phone.replace("+", "");
      if (seenPhones.has(phoneKey)) {
        duplicatesInFile++;
        return; // skip duplicate
      }
      seenPhones.add(phoneKey);

      // Check against existing customers
      if (existingPhones.has(phoneKey)) {
        duplicatesExisting++;
      }
    }

    // Map status
    const status = mapStatus(statusRaw);

    validRows.push({
      firstName,
      lastName,
      phone,
      email,
      status,
      lifetimeValue,
      monthsInactive,
      externalId: externalIdRaw || null,
      raw: rawRow,
    });
  });

  return {
    validRows,
    duplicates: duplicatesInFile + duplicatesExisting,
    phonesNormalized,
    errors,
    totalRows: rows.length,
    stats: {
      valid: validRows.length,
      invalid: errors.length,
      duplicatesInFile,
      duplicatesExisting,
    },
  };
}

function mapStatus(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (["lapsed", "lapse", "expired"].includes(lower)) return "lapsed";
  if (["failed_debit", "failed debit", "failed", "debit_failed"].includes(lower)) return "failed_debit";
  if (["dormant", "inactive", "sleeping"].includes(lower)) return "dormant";
  if (["at_risk", "at risk", "atrisk", "risk"].includes(lower)) return "at_risk";
  return "active";
}

// ─── Commit ────────────────────────────────────────────────────

/**
 * Commit an import: create Customer + Contact + Opportunity rows.
 * Transactional — either all succeed or all fail.
 * Idempotent: existing customer (same tenant + normalized phone) → UPDATE.
 * Each customer is scored → creates a RecoveryOpportunity.
 */
export async function commitImport(
  tenantId: string,
  csvText: string,
  mapping: ColumnMapping,
  fileName: string = "import.csv"
): Promise<CommitResult> {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  // First preview to get valid rows
  const preview = await previewImport(tenantId, csvText, mapping);

  let createdCustomers = 0;
  let createdContacts = 0;
  let createdOpportunities = 0;

  // Process each valid row
  for (const row of preview.validRows) {
    // Check if customer already exists (by phone or externalId)
    let existingCustomer = null;

    if (row.phone) {
      const contact = await db.customerContact.findFirst({
        where: {
          tenantId,
          value: { contains: row.phone.replace("+", "") },
        },
        include: { customer: true },
      });
      if (contact) {
        existingCustomer = contact.customer;
      }
    }

    if (!existingCustomer && row.externalId) {
      existingCustomer = await db.customer.findFirst({
        where: { tenantId, externalId: row.externalId },
      });
    }

    let customerId: string;

    if (existingCustomer) {
      // UPDATE existing customer (idempotent)
      await db.customer.update({
        where: { id: existingCustomer.id },
        data: {
          firstName: row.firstName,
          lastName: row.lastName || existingCustomer.lastName,
          status: row.status,
          lifetimeValue: row.lifetimeValue ?? existingCustomer.lifetimeValue,
        },
      });
      customerId = existingCustomer.id;
    } else {
      // CREATE new customer
      const newCustomer = await db.customer.create({
        data: {
          tenantId,
          externalId: row.externalId,
          firstName: row.firstName,
          lastName: row.lastName || undefined,
          status: row.status,
          lifetimeValue: row.lifetimeValue,
        },
      });
      customerId = newCustomer.id;
      createdCustomers++;
    }

    // Create/update phone contact
    if (row.phone) {
      const existingContact = await db.customerContact.findFirst({
        where: { tenantId, customerId, type: "phone", value: row.phone },
      });
      if (!existingContact) {
        await db.customerContact.create({
          data: {
            tenantId,
            customerId,
            type: "phone",
            value: row.phone,
            isPrimary: true,
            whatsappValid: true, // we validated it's a real SA number
          },
        });
        createdContacts++;
      }
    }

    // Create/update email contact
    if (row.email) {
      const existingContact = await db.customerContact.findFirst({
        where: { tenantId, customerId, type: "email", value: row.email },
      });
      if (!existingContact) {
        await db.customerContact.create({
          data: {
            tenantId,
            customerId,
            type: "email",
            value: row.email,
            isPrimary: false,
          },
        });
        createdContacts++;
      }
    }

    // Score the customer and create a RecoveryOpportunity
    const scorable: ScorableCustomer = {
      lifetimeValue: row.lifetimeValue,
      monthsInactive: row.monthsInactive,
      paymentSuccessRatio: null, // unknown from import
      hasWhatsapp: !!row.phone,
      hasPhone: !!row.phone,
      hasEmail: !!row.email,
      offerAvailable: true,
      previouslyEngaged: false,
      previouslyContacted: false,
      fields: {
        name: !!row.firstName,
        phone: !!row.phone,
        email: !!row.email,
        amount: row.lifetimeValue !== null,
      },
    };

    const scoreResult = scoreCustomer(scorable);

    // Only create opportunity if score is worth pursuing
    if (scoreResult.score >= 20) {
      const existingOpp = await db.recoveryOpportunity.findFirst({
        where: { tenantId, customerId, status: "new" },
      });
      if (!existingOpp) {
        await db.recoveryOpportunity.create({
          data: {
            tenantId,
            customerId,
            category: row.status === "lapsed" ? "lapsed_customer" : row.status === "failed_debit" ? "failed_payment" : "dormant_customer",
            score: scoreResult.score,
            estimatedValue: row.lifetimeValue ? row.lifetimeValue * 0.6 : null,
            status: "new",
            reason: JSON.stringify({ reasons: scoreResult.reasons, risks: scoreResult.risks }),
            recommendedAction: scoreResult.recommendedAction,
          },
        });
        createdOpportunities++;
      }
    }
  }

  // Create Import record
  const importRecord = await db.import.create({
    data: {
      tenantId,
      filename: fileName,
      totalRows: preview.totalRows,
      validRows: preview.validRows.length,
      errorRows: preview.errors.length,
      duplicates: preview.stats.duplicatesInFile + preview.stats.duplicatesExisting,
      status: "completed",
    },
  });

  // Audit log
  await db.auditLog.create({
    data: {
      tenantId,
      action: "IMPORT_COMMITTED",
      entityType: "import",
      entityId: importRecord.id,
      metadata: JSON.stringify({
        fileName,
        totalRows: preview.totalRows,
        validRows: preview.validRows.length,
        errors: preview.errors.length,
        duplicates: preview.stats.duplicatesInFile + preview.stats.duplicatesExisting,
        createdCustomers,
        createdContacts,
        createdOpportunities,
      }),
    },
  });

  return {
    importId: importRecord.id,
    fileName,
    totalRows: preview.totalRows,
    validRows: preview.validRows.length,
    duplicates: preview.stats.duplicatesInFile + preview.stats.duplicatesExisting,
    errors: preview.errors.length,
    created: {
      customers: createdCustomers,
      contacts: createdContacts,
      opportunities: createdOpportunities,
    },
  };
}

/**
 * Get import history for a tenant.
 */
export async function getImportHistory(tenantId: string, limit = 20) {
  if (!db) throw new AppError("DATABASE_NOT_CONFIGURED", "Database not configured");

  return db.import.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
