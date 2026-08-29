import { NextResponse } from "next/server";
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
        firstName: true,
        lastName: true,
        riotGameName: true,
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
