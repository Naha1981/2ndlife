/**
 * GET /api/v1/livesignal/rooms/[roomId]/signals
 *
 * Returns classified signals for a room.
 * Privacy invariant: no raw transcript field is ever returned.
 * Tenant isolation enforced — roomId must belong to tenantId.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ error: "Missing X-Tenant-Id header" }, { status: 401 });
  }

  const { roomId } = params;

  // Tenant isolation — verify the room belongs to this tenant
  const room = await prisma.liveRoom.findFirst({
    where: { id: roomId, tenantId },
  });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const signals = await prisma.liveSignal.findMany({
    where: { roomId, tenantId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    signals: signals.map((s) => ({
      id: s.id,
      tenantId: s.tenantId,
      roomId: s.roomId,
      category: s.category,
      // excerpt is already PII-stripped at ingest — safe to return
      excerpt: s.excerpt,
      promotedToRadar: s.promotedToRadar,
      occurrences: s.occurrences,
      createdAt: s.createdAt.toISOString(),
      // rawText field does NOT exist — privacy enforced at schema level
    })),
  });
}
