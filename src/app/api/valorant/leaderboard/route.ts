import { NextRequest, NextResponse } from "next/server";
import { fetchRiotLeaderboard } from "@/lib/valorant/riotApi";
import { LeaderboardPlayerEntry } from "@/lib/valorant/types";

export const dynamic = "force-dynamic";

// Mock Fallback Leaderboard
const MOCK_LEADERBOARD: LeaderboardPlayerEntry[] = [
  { leaderboardRank: 1, puuid: "p1", gameName: "TenZ", tagLine: "SEN", rankedRating: 1124, numberOfWins: 148, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
  { leaderboardRank: 2, puuid: "p2", gameName: "cNed", tagLine: "FUT", rankedRating: 1088, numberOfWins: 135, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
  { leaderboardRank: 3, puuid: "p3", gameName: "Chronicle", tagLine: "FNC", rankedRating: 1045, numberOfWins: 129, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
  { leaderboardRank: 4, puuid: "p4", gameName: "Derke", tagLine: "VIT", rankedRating: 994, numberOfWins: 118, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
  { leaderboardRank: 5, puuid: "p5", gameName: "Aspas", tagLine: "LEV", rankedRating: 980, numberOfWins: 112, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
  { leaderboardRank: 6, puuid: "p6", gameName: "Boaster", tagLine: "FNC", rankedRating: 942, numberOfWins: 106, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
  { leaderboardRank: 7, puuid: "p7", gameName: "ScreaM", tagLine: "EDG", rankedRating: 915, numberOfWins: 98, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
  { leaderboardRank: 8, puuid: "p8", gameName: "Cryocells", tagLine: "100T", rankedRating: 890, numberOfWins: 94, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
  { leaderboardRank: 9, puuid: "p9", gameName: "Alfajer", tagLine: "FNC", rankedRating: 875, numberOfWins: 91, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
  { leaderboardRank: 10, puuid: "p10", gameName: "yay", tagLine: "BLEED", rankedRating: 860, numberOfWins: 88, tier: 27, tierName: "Radiant", tierIcon: "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png" },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = (searchParams.get("region") || "eu").toLowerCase();
    const actId = searchParams.get("actId") || "e9a3";

    const realData = await fetchRiotLeaderboard(actId, region, 50, 0);

    if (realData && Array.isArray(realData.players)) {
      const formatted: LeaderboardPlayerEntry[] = realData.players.map((p: any) => ({
        leaderboardRank: p.leaderboardRank,
        puuid: p.puuid,
        gameName: p.gameName || "Anonyme",
        tagLine: p.tagLine || "EU1",
        rankedRating: p.rankedRating,
        numberOfWins: p.numberOfWins,
        tier: p.tier || 27,
        tierName: p.tier >= 27 ? "Radiant" : "Immortal 3",
        tierIcon: `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${p.tier || 27}/largeicon.png`,
      }));
      return NextResponse.json({ region, players: formatted });
    }

    return NextResponse.json({ region, players: MOCK_LEADERBOARD });
  } catch (error: any) {
    return NextResponse.json({ region: "eu", players: MOCK_LEADERBOARD });
  }
}
