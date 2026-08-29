import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRiotAccount, fetchRiotMatchlist, fetchRiotMatchDetails } from "@/lib/valorant/riotApi";
import { generateMockProfile } from "@/lib/valorant/mock";
import { parseRiotMatchData } from "@/lib/valorant/parser";
import { ValorantProfileResponse } from "@/lib/valorant/types";

export const dynamic = "force-dynamic";

async function handlePlayerRequest(gameName: string, tagLine: string, region: string = "eu") {
  try {
    // Check Neon database for registered user & custom settings
    let customOwnerSettings: any = null;
    try {
      const user = await (prisma.user as any).findFirst({
        where: {
          OR: [
            { riotGameName: { equals: `${gameName}#${tagLine}`, mode: "insensitive" } },
            { riotGameName: { equals: gameName, mode: "insensitive" } },
          ],
        },
      });
      if (user) {
        customOwnerSettings = {
          theme: user.theme,
          bannerUrl: user.bannerUrl,
          bannerOffsetY: user.bannerOffsetY,
          isPublic: user.isPublic,
          hiddenStats: user.hiddenStats,
          dashboardGrid: user.dashboardGrid,
          badge: user.badge || null,
          showBadge: user.showBadge !== false,
          puuid: user.riotPuuid,
        };
      }
    } catch (dbErr) {
      console.warn("[Prisma] User lookup warning:", dbErr);
    }

    // Check if current viewer is the authenticated owner of the profile
    let isOwner = false;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const currentUser = await (prisma.user as any).findUnique({ where: { email: session.user.email } });
        if (currentUser?.riotGameName) {
          isOwner = currentUser.riotGameName.toLowerCase() === `${gameName}#${tagLine}`.toLowerCase();
        }
      }
    } catch {}

    // 1. Try Official Riot Games API
    let profileData: ValorantProfileResponse | null = null;
    try {
      const account = await fetchRiotAccount(gameName, tagLine, region);

      if (account && account.puuid) {
        const matchlist = await fetchRiotMatchlist(account.puuid, region);
        const matchIds: string[] = matchlist?.history?.slice(0, 10)?.map((m: any) => m.matchId) || [];

        const matchDetails = await Promise.all(
          matchIds.map((id) => fetchRiotMatchDetails(id, region))
        );

        const parsed = parseRiotMatchData(matchDetails.filter(Boolean), account.puuid);

        profileData = {
          player: {
            puuid: account.puuid,
            gameName: account.gameName || gameName,
            tagLine: account.tagLine || tagLine,
            region,
            accountLevel: 100,
            isOwner,
            canEdit: isOwner,
            badge: customOwnerSettings?.badge || null,
            showBadge: customOwnerSettings?.showBadge ?? true,
          },
          rank: "Ascendant 2",
          rankUrl: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/23/largeicon.png",
          rankTier: 23,
          level: 100,
          mainAgent: {
            name: "Clove",
            uuid: "1dbf2edd-4729-0984-3115-daa5eed44993",
            role: "Controller",
            icon: "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png",
            fullPortrait: "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/fullportrait.png",
          },
          stats: parsed.stats,
          agentStats: parsed.agentStats,
          weapons: parsed.weapons,
          matchHistory: parsed.matchHistory,
        };
      }
    } catch (riotErr) {
      console.warn("[Riot API Fetch] Falling back to mock:", riotErr);
    }

    // 2. Fallback to realistic structured mock generator
    if (!profileData) {
      profileData = generateMockProfile(gameName, tagLine);
      profileData.player.isOwner = isOwner;
      profileData.player.canEdit = isOwner;
    }

    // 3. Attach custom Neon user configuration
    if (customOwnerSettings) {
      profileData.player = {
        ...profileData.player,
        theme: customOwnerSettings.theme || null,
        bannerUrl: customOwnerSettings.bannerUrl || null,
        bannerOffsetY: customOwnerSettings.bannerOffsetY || 0,
        isPublic: customOwnerSettings.isPublic ?? true,
        hiddenStats: customOwnerSettings.hiddenStats || null,
        dashboardGrid: customOwnerSettings.dashboardGrid || null,
        badge: customOwnerSettings.badge || profileData.player.badge,
        showBadge: customOwnerSettings.showBadge ?? profileData.player.showBadge,
      };
    }

    return NextResponse.json(profileData);
  } catch (error: any) {
    console.error("[API Error] /api/valorant/player:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des données", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawName = searchParams.get("name") || searchParams.get("riotId") || "Corbac";
  let gameName = rawName;
  let tagLine = searchParams.get("tag") || "EU1";

  if (rawName.includes("#")) {
    const parts = rawName.split("#");
    gameName = parts[0];
    tagLine = parts[1] || tagLine;
  }

  const region = (searchParams.get("region") || "eu").toLowerCase();
  return handlePlayerRequest(decodeURIComponent(gameName).trim(), decodeURIComponent(tagLine).trim(), region);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let gameName = body.name || body.gameName || "";
    let tagLine = body.tag || body.tagLine || "EU1";

    if (body.riotId) {
      if (body.riotId.includes("#")) {
        const parts = body.riotId.split("#");
        gameName = parts[0];
        tagLine = parts[1] || tagLine;
      } else {
        gameName = body.riotId;
      }
    }

    if (!gameName) {
      gameName = "Corbac";
      tagLine = "EU1";
    }

    const region = (body.region || "eu").toLowerCase();
    return handlePlayerRequest(gameName.trim(), tagLine.trim(), region);
  } catch (err: any) {
    return NextResponse.json({ error: "Requête invalide", details: err.message }, { status: 400 });
  }
}
