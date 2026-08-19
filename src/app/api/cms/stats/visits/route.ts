import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Visits grouped by page
    const visitsByPageRaw = await prisma.pageVisit.groupBy({
      by: ['pageName'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    }).catch(() => []);

    const byPage = visitsByPageRaw.map((v: any) => ({
      pageName: v.pageName || 'Accueil',
      count: v._count.id,
    }));

    // Timeline for the last N days
    const timelineData: { date: string; label: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await prisma.pageVisit.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }).catch(() => 0);

      timelineData.push({
        date: isoDate,
        label: dayLabel,
        count: count,
      });
    }

    return NextResponse.json({
      byPage: byPage,
      timeline: timelineData,
      days,
    });
  } catch (error: any) {
    console.error('Error fetching visits stats:', error);
    return NextResponse.json({ error: 'Erreur stats visites' }, { status: 500 });
  }
}
