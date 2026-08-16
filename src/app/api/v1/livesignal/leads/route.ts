/**
 * GET /api/v1/livesignal/leads — list leads for authenticated tenant
 *
 * Returns LiveLead rows with signalIds deserialized from JSON.
 * Tenant isolation: only returns leads where tenantId matches.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ error: "Missing X-Tenant-Id header" }, { status: 401 });
  }

  const leads = await prisma.liveLead.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { room: { select: { name: true } } },
  });

  return NextResponse.json({
    leads: leads.map((l) => ({
      id: l.id,
      tenantId: l.tenantId,
      roomId: l.roomId,
      roomName: l.room.name,
      sessionId: l.sessionId,
      signalIds: JSON.parse(l.signalIds || "[]") as string[],
      handoffSent: l.handoffSent,
      handoffAt: l.handoffAt?.toISOString() ?? null,
      consentStatus: l.consentStatus,
      createdAt: l.createdAt.toISOString(),
    })),
  });
}

/**
 * PATCH /api/v1/livesignal/leads — update consent status for a lead
 */
import { z } from "zod";

const PatchSchema = z.object({
  leadId: z.string(),
  consentStatus: z.enum(["pending", "granted", "denied"]),
});

export async function PATCH(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ error: "Missing X-Tenant-Id header" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Tenant isolation — verify lead belongs to this tenant
  const lead = await prisma.liveLead.findFirst({
    where: { id: parsed.data.leadId, tenantId },
  });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const updated = await prisma.liveLead.update({
    where: { id: parsed.data.leadId },
    data: { consentStatus: parsed.data.consentStatus, updatedAt: new Date() },
  });

  return NextResponse.json({ lead: { id: updated.id, consentStatus: updated.consentStatus } });
}
