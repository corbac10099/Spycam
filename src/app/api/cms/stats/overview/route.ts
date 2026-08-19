import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      agentsCount,
      mapsCount,
      bannersCount,
      newsCount,
      usersCount,
      privateUsersCount,
      totalVisits,
      recentVisits,
    ] = await Promise.all([
      prisma.agent.count().catch(() => 0),
      prisma.map.count().catch(() => 0),
      prisma.banner.count().catch(() => 0),
      prisma.news.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.user.count({ where: { isPublic: false } }).catch(() => 0),
      prisma.pageVisit.count().catch(() => 0),
      prisma.pageVisit.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }).catch(() => 0),
    ]);

    const publicUsersCount = Math.max(0, usersCount - privateUsersCount);

    return NextResponse.json({
      agentsCount,
      mapsCount,
      bannersCount,
      newsCount,
      usersCount,
      privateUsersCount,
      publicUsersCount,
      totalVisits,
      todayVisits: recentVisits,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching stats overview:', error);
    return NextResponse.json({ error: 'Erreur stats overview' }, { status: 500 });
  }
}
