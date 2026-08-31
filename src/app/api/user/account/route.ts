import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const userEmail = session?.user?.email || queryEmail;

    if (!userEmail) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const hasPassword = !!user.password;
    const isGoogleLinked = user.googleConnected || user.accounts.some((a) => a.provider === "google");
    const isRiotLinked = user.riotConnected || !!user.riotGameName;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.riotGameName || "Joueur",
        firstName: user.firstName,
        lastName: user.lastName,
        sgsRole: user.sgsRole,
        badge: user.badge,
        riotGameName: user.riotGameName,
        riotPuuid: user.riotPuuid,
        googleEmail: user.googleEmail,
        hasPassword,
        isGoogleLinked,
        isRiotLinked,
        providers: user.accounts.map((a) => a.provider),
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const userEmail = session?.user?.email || body.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const { newEmail, name, currentPassword, newPassword } = body;
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    // Changing password
    if (newPassword) {
      if (user.password && currentPassword) {
        const hashedCurrent = hashPassword(currentPassword);
        if (hashedCurrent !== user.password) {
          return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
        }
      }
      updateData.password = hashPassword(newPassword);
    }

    // Changing email
    if (newEmail && newEmail !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: newEmail },
      });
      if (existing) {
        return NextResponse.json({ error: "Cette adresse email est déjà utilisée" }, { status: 400 });
      }
      updateData.email = newEmail;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ACTION: Link / Unlink Providers (Google, Riot)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const userEmail = session?.user?.email || body.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const { action, provider, data } = body;

    if (action === "link-riot") {
      const { riotGameName, riotPuuid } = data || {};
      await prisma.user.update({
        where: { id: user.id },
        data: {
          riotGameName: riotGameName || user.riotGameName,
          riotPuuid: riotPuuid || user.riotPuuid,
          riotConnected: true,
        },
      });
      return NextResponse.json({ success: true, message: "Compte Riot lié avec succès" });
    }

    if (action === "unlink-riot") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          riotGameName: null,
          riotPuuid: null,
          riotConnected: false,
        },
      });
      return NextResponse.json({ success: true, message: "Compte Riot délié" });
    }

    if (action === "link-google") {
      const { googleEmail } = data || {};
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleConnected: true,
          googleEmail: googleEmail || user.email,
        },
      });
      return NextResponse.json({ success: true, message: "Compte Google lié avec succès" });
    }

    if (action === "unlink-google") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleConnected: false,
          googleEmail: null,
        },
      });
      return NextResponse.json({ success: true, message: "Compte Google délié" });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Permanent Account Erasure (RGPD right to erasure)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const userEmail = session?.user?.email || queryEmail;

    if (!userEmail) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Delete user and all cascade relations (accounts, sessions, etc.)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ success: true, message: "Compte et toutes les données supprimés définitivement" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
