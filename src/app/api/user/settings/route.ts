import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    // Extraire uniquement les champs autorisés
    const { theme, bannerUrl, bannerOffsetY, smartRating } = body;
    const updateData: any = {};

    if (theme !== undefined) updateData.theme = theme;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (bannerOffsetY !== undefined) updateData.bannerOffsetY = bannerOffsetY;
    if (smartRating !== undefined) updateData.smartRating = smartRating;

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
