import {
  ValorantProfileResponse,
  ValorantMatchData,
  WeaponPerformanceStat,
  AgentPerformanceStat,
} from "./types";

export const AGENTS_CATALOG: Record<string, { uuid: string; role: string }> = {
  Jett: { uuid: "add6443a-41bd-e414-f6ad-e58d267f4e95", role: "Duelist" },
  Reyna: { uuid: "a3bfb854-4339-14a8-37aa-94dd04e61a5c", role: "Duelist" },
  Raze: { uuid: "f94c3b30-42be-e959-889c-5aa313dba261", role: "Duelist" },
  Omen: { uuid: "8e253930-4c05-31dd-1b6c-968525494517", role: "Controller" },
  Clove: { uuid: "1dbf2edd-4729-0984-3115-daa5eed44993", role: "Controller" },
  Sova: { uuid: "3207ddbf-4ed4-822c-05a8-aa467a10ae50", role: "Initiator" },
  Cypher: { uuid: "11742724-4ac4-02d6-8c0b-9f452aa61049", role: "Sentinel" },
  Killjoy: { uuid: "1e58de9c-4950-5125-93e9-a0aee9f98746", role: "Sentinel" },
  Iso: { uuid: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c", role: "Duelist" },
  Viper: { uuid: "707eab51-4836-f488-046a-cda6bf494859", role: "Controller" },
  Chamber: { uuid: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7", role: "Sentinel" },
  Gekko: { uuid: "e370fa57-4757-3604-3648-499e1f642d3f", role: "Initiator" },
  Fade: { uuid: "dade69b4-4f5a-8528-247b-219e5a1facd6", role: "Initiator" },
};

export const MAPS = ["Ascent", "Haven", "Bind", "Split", "Sunset", "Lotus", "Abyss"];

export const OFFICIAL_WEAPONS: WeaponPerformanceStat[] = [
  {
    id: "vandal",
    name: "Vandale",
    category: "Fusils d'assaut",
    icon: "https://media.valorant-api.com/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872/displayicon.png",
    kills: 71,
    headshots: 12,
    bodyshots: 81,
    legshots: 8,
  },
  {
    id: "ghost",
    name: "Fantôme",
    category: "Armes de poing",
    icon: "https://media.valorant-api.com/weapons/1baa85b4-4c70-1284-64bb-6481dfc3bb4e/displayicon.png",
    kills: 30,
    headshots: 16,
    bodyshots: 71,
    legshots: 13,
  },
  {
    id: "phantom",
    name: "Fantôme",
    category: "Fusils d'assaut",
    icon: "https://media.valorant-api.com/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a/displayicon.png",
    kills: 8,
    headshots: 4,
    bodyshots: 83,
    legshots: 13,
  },
  {
    id: "sheriff",
    name: "Sheriff",
    category: "Armes de poing",
    icon: "https://media.valorant-api.com/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702/displayicon.png",
    kills: 6,
    headshots: 28,
    bodyshots: 65,
    legshots: 7,
  },
  {
    id: "classic",
    name: "Classic",
    category: "Armes de poing",
    icon: "https://media.valorant-api.com/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8/displayicon.png",
    kills: 5,
    headshots: 18,
    bodyshots: 72,
    legshots: 10,
  },
];

export function generateMockProfile(gameName = "Player", tagLine = "EU1"): ValorantProfileResponse {
  const matchHistory: ValorantMatchData[] = [];
  const agentNames = Object.keys(AGENTS_CATALOG);
  const agentPlayCount: Record<string, { games: number; wins: number; kills: number; deaths: number; assists: number; minutes: number }> = {};

  for (let i = 0; i < 20; i++) {
    const agentName = agentNames[i % agentNames.length];
    const agent = AGENTS_CATALOG[agentName];
    const map = MAPS[i % MAPS.length];
    const won = Math.random() > 0.42;
    const myTeamScore = won ? 13 : Math.floor(Math.random() * 11) + 2;
    const enemyTeamScore = won ? Math.floor(Math.random() * 11) + 2 : 13;
    const roundsPlayed = myTeamScore + enemyTeamScore;

    const kills = Math.floor(Math.random() * 22) + 8;
    const deaths = Math.floor(Math.random() * 18) + 6;
    const assists = Math.floor(Math.random() * 10) + 2;
    const duration = `${Math.floor(Math.random() * 15) + 25}m ${Math.floor(Math.random() * 59)}s`;

    if (!agentPlayCount[agentName]) {
      agentPlayCount[agentName] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, minutes: 0 };
    }
    agentPlayCount[agentName].games++;
    if (won) agentPlayCount[agentName].wins++;
    agentPlayCount[agentName].kills += kills;
    agentPlayCount[agentName].deaths += deaths;
    agentPlayCount[agentName].assists += assists;
    agentPlayCount[agentName].minutes += 32;

    const myAcs = Math.floor(Math.random() * 140) + 160;
    const hs = Math.floor(kills * 0.85);
    const bs = Math.floor(kills * 1.9);
    const ls = Math.floor(kills * 0.25);

    const timeline = [];
    for (let r = 1; r <= roundsPlayed; r++) {
      const winner = Math.random() > 0.5 ? "myTeam" : "enemyTeam";
      timeline.push({
        roundNum: r,
        winner: winner as "myTeam" | "enemyTeam",
        winCondition: Math.random() > 0.3 ? "Elimination" : "SpikeDefused",
        myKillsInRound: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
        diedInRound: Math.random() > 0.45,
      });
    }

    matchHistory.push({
      matchId: `match-${Date.now()}-${i}`,
      mode: "competitive",
      modeIcon: "https://media.valorant-api.com/gamemodes/96bd3920-4f36-d026-2b28-c683eb0bcac5/displayicon.png",
      map,
      agent: agentName,
      agentIcon: `https://media.valorant-api.com/agents/${agent.uuid}/displayicon.png`,
      won,
      score: `${myTeamScore} - ${enemyTeamScore}`,
      kills,
      deaths,
      assists,
      headshots: hs,
      bodyshots: bs,
      legshots: ls,
      aces: timeline.filter((r) => r.myKillsInRound >= 5).length,
      season: "E9: A3",
      acs: myAcs,
      damage: Math.floor(kills * 148),
      firstBloods: Math.floor(Math.random() * 4),
      roundsPlayed,
      duration,
      date: new Date(Date.now() - i * 3600000 * 4).toISOString(),
      myTeam: [],
      enemyTeam: [],
      timeline: timeline as any,
      duels: [],
    });
  }

  let mainAgentName = "Clove";
  let maxGames = 0;
  for (const [name, data] of Object.entries(agentPlayCount)) {
    if (data.games > maxGames) {
      maxGames = data.games;
      mainAgentName = name;
    }
  }

  const agentStats: AgentPerformanceStat[] = Object.entries(agentPlayCount)
    .map(([name, data]) => ({
      name,
      uuid: AGENTS_CATALOG[name]?.uuid || AGENTS_CATALOG.Clove.uuid,
      role: AGENTS_CATALOG[name]?.role || "Controller",
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
  const totalAces = matchHistory.reduce((s, m) => s + m.aces, 0);

  const rankTier = 24; // Ascendant 3

  const cardSmall = "https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/smallart.png";
  const cardLarge = "https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/largeart.png";
  const cardWide = "https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/wideart.png";
  const rankUrl = `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${rankTier}/largeicon.png`;

  const statsObj = {
    kills: totalKills,
    deaths: totalDeaths,
    assists: totalAssists,
    kdRatio: parseFloat((totalKills / Math.max(totalDeaths, 1)).toFixed(2)),
    headshotPct: totalShots > 0 ? parseFloat(((totalHS / totalShots) * 100).toFixed(1)) : 24.8,
    winRate: Math.round((totalWins / matchHistory.length) * 100),
    matchesPlayed: matchHistory.length,
    acs: Math.round(matchHistory.reduce((s, m) => s + m.acs, 0) / matchHistory.length),
    aceCount: totalAces,
    kast: 74.2,
    kastPercentile: "Top 12%",
    ddDelta: 16.8,
    adr: 154.2,
    firstBloods: 22,
  };

  const mainAgentObj = {
    name: mainAgentName,
    uuid: AGENTS_CATALOG[mainAgentName]?.uuid || AGENTS_CATALOG.Clove.uuid,
    role: AGENTS_CATALOG[mainAgentName]?.role || "Controller",
    icon: `https://media.valorant-api.com/agents/${AGENTS_CATALOG[mainAgentName]?.uuid || AGENTS_CATALOG.Clove.uuid}/displayicon.png`,
    fullPortrait: `https://media.valorant-api.com/agents/${AGENTS_CATALOG[mainAgentName]?.uuid || AGENTS_CATALOG.Clove.uuid}/fullportrait.png`,
  };

  return {
    player: {
      puuid: `mock-puuid-${gameName}`,
      gameName,
      tagLine,
      region: "eu",
      accountLevel: 142,
      level: 142,
      cardUrl: cardSmall,
      cardSmall,
      cardLarge,
      cardWide,
      cardWideUrl: cardWide,
      badge: "verified",
      showBadge: true,
      isOwner: true,
      canEdit: true,
      rank: "Ascendant 3",
      rankUrl,
      rankTier,
      mainAgent: mainAgentObj,
      stats: statsObj,
      agentStats,
      weapons: OFFICIAL_WEAPONS,
      matchHistory,
    },
    rank: "Ascendant 3",
    rankUrl,
    rankTier,
    level: 142,
    mainAgent: mainAgentObj,
    stats: statsObj,
    agentStats,
    weapons: OFFICIAL_WEAPONS,
    matchHistory,
    warnings: {},
  };
}
