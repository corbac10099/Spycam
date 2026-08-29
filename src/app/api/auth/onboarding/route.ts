import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const guestId = request.headers.get("x-guest-id") || body?.guestId;

    let targetEmail = session?.user?.email;
    let isGuest = false;

    if (!targetEmail && guestId) {
      const guestUser = await prisma.user.findFirst({
        where: {
          id: guestId,
          email: { endsWith: "@temp.spycam.gg" },
        },
      });
      if (guestUser) {
        targetEmail = guestUser.email;
        isGuest = true;
      }
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: 'Non authentifié.' },
        { status: 401 }
      );
    }

    const { language, theme, isPublic } = body;

    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: {
        language: language || 'fr',
        theme: theme || 'dark',
        isPublic: isPublic === true,
        onboardingDone: true,
      },
    });

    return NextResponse.json({
      message: 'Onboarding terminé.',
      user: {
        language: updatedUser.language,
        theme: updatedUser.theme,
        isPublic: updatedUser.isPublic,
        onboardingDone: updatedUser.onboardingDone,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
