/**
 * GET  /api/v1/livesignal/rooms  — list rooms for authenticated tenant
 * POST /api/v1/livesignal/rooms  — create a new room
 *
 * Tenant isolation: tenantId resolved from X-Tenant-Id header.
 * A cannot see B's rooms (verified in tenant-isolation.test.ts).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultMode } from "@/modules/livesignal/room-mode";
import { z } from "zod";

function getTenantId(req: NextRequest): string | null {
  return req.headers.get("x-tenant-id");
}

export async function GET(req: NextRequest) {
  const tenantId = getTenantId(req);
  if (!tenantId) {
    return NextResponse.json({ error: "Missing X-Tenant-Id header" }, { status: 401 });
  }

  const rooms = await prisma.liveRoom.findMany({
    where: { tenantId },
    include: {
      _count: { select: { signals: true, leads: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    rooms: rooms.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      mode: r.mode,
      isActive: r.isActive,
      signalCount: r._count.signals,
      leadCount: r._count.leads,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

const CreateRoomSchema = z.object({
  name: z.string().min(1).max(100),
  packSlug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const tenantId = getTenantId(req);
  if (!tenantId) {
    return NextResponse.json({ error: "Missing X-Tenant-Id header" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const mode = getDefaultMode(parsed.data.packSlug ?? "general");

  const room = await prisma.liveRoom.create({
    data: {
      tenantId,
      name: parsed.data.name,
      mode,
      isActive: false,
    },
  });

  return NextResponse.json({ room }, { status: 201 });
}
