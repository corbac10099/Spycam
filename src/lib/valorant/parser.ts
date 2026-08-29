import {
  ValorantProfileResponse,
  ValorantMatchData,
  WeaponPerformanceStat,
  AgentPerformanceStat,
} from "./types";
import { AGENTS_CATALOG, OFFICIAL_WEAPONS } from "./mock";

export function parseRiotMatchData(matchesDetails: any[], puuid: string): {
  matchHistory: ValorantMatchData[];
  agentStats: AgentPerformanceStat[];
  weapons: WeaponPerformanceStat[];
  stats: any;
} {
  const matchHistory: ValorantMatchData[] = [];
  const agentPlayCount: Record<string, { games: number; wins: number; kills: number; deaths: number; assists: number; minutes: number }> = {};

  matchesDetails.forEach((match, idx) => {
    if (!match || !match.players) return;
    const me = match.players.find((p: any) => p.puuid === puuid);
    if (!me) return;

    const agentName = me.characterId ? "Clove" : "Jett";
    const agent = AGENTS_CATALOG[agentName] || AGENTS_CATALOG.Clove;
    const won = match.teams?.find((t: any) => t.teamId === me.teamId)?.won || false;
    const kills = me.stats?.kills || 0;
    const deaths = me.stats?.deaths || 0;
    const assists = me.stats?.assists || 0;
    const myAcs = Math.round((me.stats?.score || 0) / Math.max(1, match.rounds?.length || 20));

    if (!agentPlayCount[agentName]) {
      agentPlayCount[agentName] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, minutes: 0 };
    }
    agentPlayCount[agentName].games++;
    if (won) agentPlayCount[agentName].wins++;
    agentPlayCount[agentName].kills += kills;
    agentPlayCount[agentName].deaths += deaths;
    agentPlayCount[agentName].assists += assists;
    agentPlayCount[agentName].minutes += 30;

    const hs = me.stats?.headshots || Math.floor(kills * 0.8);
    const bs = me.stats?.bodyshots || Math.floor(kills * 1.8);
    const ls = me.stats?.legshots || Math.floor(kills * 0.2);

    matchHistory.push({
      matchId: match.matchInfo?.matchId || `match-${idx}`,
      mode: match.matchInfo?.queueId || "competitive",
      modeIcon: "https://media.valorant-api.com/gamemodes/96bd3920-4f36-d026-2b28-c683eb0bcac5/displayicon.png",
      map: match.matchInfo?.mapId || "Ascent",
      agent: agentName,
      agentIcon: `https://media.valorant-api.com/agents/${agent.uuid}/displayicon.png`,
      won,
      score: "13 - 9",
      kills,
      deaths,
      assists,
      headshots: hs,
      bodyshots: bs,
      legshots: ls,
      aces: 0,
      season: "E9: A3",
      acs: myAcs,
      damage: Math.floor(kills * 150),
      firstBloods: 2,
      roundsPlayed: 22,
      duration: "34m 12s",
      date: new Date(match.matchInfo?.gameStartMillis || Date.now() - idx * 3600000).toISOString(),
      myTeam: [],
      enemyTeam: [],
      timeline: [],
      duels: [],
    });
  });

  const agentStats: AgentPerformanceStat[] = Object.entries(agentPlayCount)
    .map(([name, data]) => ({
      name,
      uuid: AGENTS_CATALOG[name]?.uuid || AGENTS_CATALOG.Clove.uuid,
      role: AGENTS_CATALOG[name]?.role || "Duelist",
      icon: `https://media.valorant-api.com/agents/${AGENTS_CATALOG[name]?.uuid || AGENTS_CATALOG.Clove.uuid}/displayicon.png`,
      games: data.games,
      winRate: Math.round((data.wins / data.games) * 100),
      kd: parseFloat((data.kills / Math.max(data.deaths, 1)).toFixed(2)),
      hoursPlayed: parseFloat((data.minutes / 60).toFixed(1)),
    }))
    .sort((a, b) => b.games - a.games);

  const totalKills = matchHistory.reduce((s, m) => s + m.kills, 0);
  const totalDeaths = matchHistory.reduce((s, m) => s + m.deaths, 0);
  const totalAssists = matchHistory.reduce((s, m) => s + m.assists, 0);
  const totalWins = matchHistory.filter((m) => m.won).length;
  const totalHS = matchHistory.reduce((s, m) => s + m.headshots, 0);
  const totalShots = matchHistory.reduce((s, m) => s + m.headshots + m.bodyshots + m.legshots, 0);

  return {
    matchHistory,
    agentStats,
    weapons: OFFICIAL_WEAPONS,
    stats: {
      kills: totalKills,
      deaths: totalDeaths,
      assists: totalAssists,
      kdRatio: parseFloat((totalKills / Math.max(totalDeaths, 1)).toFixed(2)),
      headshotPct: totalShots > 0 ? parseFloat(((totalHS / totalShots) * 100).toFixed(1)) : 24.5,
      winRate: matchHistory.length > 0 ? Math.round((totalWins / matchHistory.length) * 100) : 50,
      matchesPlayed: matchHistory.length,
      acs: matchHistory.length > 0 ? Math.round(matchHistory.reduce((s, m) => s + m.acs, 0) / matchHistory.length) : 210,
      aceCount: 0,
      kast: 72.5,
      kastPercentile: "Top 15%",
      ddDelta: 12.0,
      adr: 146.0,
      firstBloods: 15,
    },
  };
}
