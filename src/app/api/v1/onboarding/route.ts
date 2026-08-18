import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, industryPack, whatsAppNumber } = body;

    if (!businessName || !industryPack) {
      return NextResponse.json(
        { error: "Business name and industry pack are required" },
        { status: 400 }
      );
    }

    // 1. Create Tenant
    const tenant = await db.tenant.create({
      data: {
        name: String(businessName).trim(),
        industry: String(industryPack).trim(),
        whatsAppAccountId: whatsAppNumber ? String(whatsAppNumber).trim() : null,
      },
    });

    // 2. If Clerk authenticated, link user
    try {
      const { userId } = await auth();
      if (userId) {
        const clerkUser = await currentUser();
        const email =
          clerkUser?.primaryEmailAddress?.emailAddress || `${userId}@2ndlife.internal`;
        const name = clerkUser?.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : businessName;

        const dbUser = await db.user.upsert({
          where: { clerkId: userId },
          update: { email, name },
          create: {
            clerkId: userId,
            email,
            name,
          },
        });

        await db.membership.create({
          data: {
            tenantId: tenant.id,
            userId: dbUser.id,
            role: "owner",
          },
        });
      }
    } catch (authErr) {
      console.warn("[Onboarding] Auth linking skipped/errored:", authErr);
    }

    return NextResponse.json({ ok: true, tenant });
  } catch (err: any) {
    console.error("[Onboarding] Failed to complete onboarding:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create organization" },
      { status: 500 }
    );
  }
}
