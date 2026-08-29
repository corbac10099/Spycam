import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const guestId = req.headers.get("x-guest-id") || body?.guestId;

    let userId = (session?.user as any)?.id;

    if (!userId && guestId) {
      // Vérifier que c'est bien un compte invité temporaire
      const guestUser = await prisma.user.findFirst({
        where: {
          id: guestId,
          email: { endsWith: "@temp.spycam.gg" },
        },
      });
      if (guestUser) {
        userId = guestUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { theme, bannerUrl, bannerOffsetY, smartRating, isPublic, videoLoop, videoLoopDelay, hiddenStats, enforcePublicStats, language } = body;
    const updateData: any = {};

    if (theme !== undefined) updateData.theme = theme;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (bannerOffsetY !== undefined) updateData.bannerOffsetY = bannerOffsetY;
    if (smartRating !== undefined) updateData.smartRating = smartRating;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (videoLoop !== undefined) updateData.videoLoop = videoLoop;
    if (videoLoopDelay !== undefined) updateData.videoLoopDelay = videoLoopDelay;
    if (hiddenStats !== undefined) updateData.hiddenStats = hiddenStats;
    if (enforcePublicStats !== undefined) updateData.enforcePublicStats = enforcePublicStats;
    if (language !== undefined) updateData.language = language;

    // S'il n'y a rien à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true });
    }

    // Mettre à jour l'utilisateur en base de données
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Erreur API user/settings:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde des paramètres' }, { status: 500 });
  }
}
