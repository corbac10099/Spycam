import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { language, theme, isPublic } = body;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
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
