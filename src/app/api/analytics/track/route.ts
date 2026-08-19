import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = body.path || '/';
    const pageName = body.pageName || 'Accueil';
    const userAgent = req.headers.get('user-agent') || undefined;

    await prisma.pageVisit.create({
      data: {
        path,
        pageName,
        userAgent: userAgent ? userAgent.substring(0, 255) : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
