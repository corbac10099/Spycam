import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, riotId, badge, showBadge } = body;

    if (!email && !riotId) {
      return NextResponse.json({ error: "email ou riotId requis" }, { status: 400 });
    }

    const badgeValue = Array.isArray(badge)
      ? JSON.stringify(badge.filter(Boolean))
      : typeof badge === "string" && badge.trim()
      ? badge.trim()
      : null;

    const updated = await (prisma.user as any).updateMany({
      where: {
        OR: [
          ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
          ...(riotId ? [{ riotGameName: { equals: riotId, mode: "insensitive" as const } }] : []),
        ],
      },
      data: {
        badge: badgeValue,
        ...(showBadge !== undefined ? { showBadge: Boolean(showBadge) } : {}),
      },
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (err: any) {
    console.error("[Badge CMS Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
