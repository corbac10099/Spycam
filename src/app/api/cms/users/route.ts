import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const setCORSHeaders = (res: NextResponse) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
};

export async function OPTIONS() {
  return setCORSHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET() {
  try {
    const users = await (prisma.user as any).findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        sgsRole: true,
        riotGameName: true,
        riotConnected: true,
        googleConnected: true,
        googleEmail: true,
        badge: true,
        showBadge: true,
        isPublic: true,
        theme: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return setCORSHeaders(NextResponse.json(users));
  } catch (err: any) {
    console.error("[Users List CMS Error]", err);
    return setCORSHeaders(NextResponse.json({ error: err.message }, { status: 500 }));
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return setCORSHeaders(NextResponse.json({ error: "userId requis" }, { status: 400 }));
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return setCORSHeaders(NextResponse.json({ success: true, message: "Utilisateur supprimé" }));
  } catch (err: any) {
    console.error("[Delete User CMS Error]", err);
    return setCORSHeaders(NextResponse.json({ error: err.message }, { status: 500 }));
  }
}
