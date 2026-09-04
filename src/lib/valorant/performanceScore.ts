export type PerformanceGrade = "SSS" | "SS" | "S" | "A" | "B" | "C";

export type AgentRole = "Duelist" | "Initiator" | "Controller" | "Sentinel" | "Flex";

export interface PillarScore {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  label: string;
  metricSummary: string;
}

export interface PerformanceScoreResult {
  totalScore: number; // 0 - 1000
  grade: PerformanceGrade;
  gradeColor: string;
  gradeBg: string;
  gradeBorder: string;
  gradeGlow: string;
  gradeTitle: string;
  dominantRole: AgentRole;
  matchCount: number;
  pillars: {
    lethality: PillarScore;
    combat: PillarScore;
    teamwork: PillarScore;
    openings: PillarScore;
    precisionClutch: PillarScore;
  };
  tips: string[];
}

export function detectDominantRole(agents?: any[]): AgentRole {
  if (!agents || agents.length === 0) return "Flex";
  const roleCounts: Record<string, number> = {
    Duelist: 0,
    Initiator: 0,
    Controller: 0,
    Sentinel: 0,
  };

  agents.forEach((a) => {
    const r = a.role || "";
    if (roleCounts[r] !== undefined) {
      roleCounts[r] += a.games || 1;
    }
  });

  let bestRole: AgentRole = "Flex";
  let maxGames = 0;
  for (const [r, count] of Object.entries(roleCounts)) {
    if (count > maxGames) {
      maxGames = count;
      bestRole = r as AgentRole;
    }
  }
  return maxGames > 0 ? bestRole : "Flex";
}

/**
 * Calcule intelligemment le Score de Performance Spycam (SPI) sur 1 000 points
 * basé sur les matchs de la saison en cours et pondéré selon le rôle de l'agent.
 */
export function calculatePerformanceScore(
  stats: any,
  matches: any[] = [],
  role?: AgentRole
): PerformanceScoreResult {
  const matchCount = matches?.length || (stats?.matchesPlayed || 0);

  // Valeurs par défaut neutres si aucun match
  if (matchCount === 0 || !stats) {
    return {
      totalScore: 400,
      grade: "B",
      gradeColor: "#10b981",
      gradeBg: "rgba(16, 185, 129, 0.15)",
      gradeBorder: "rgba(16, 185, 129, 0.4)",
      gradeGlow: "rgba(16, 185, 129, 0.3)",
      gradeTitle: "Régulier",
      dominantRole: role || "Flex",
      matchCount: 0,
      pillars: {
        lethality: { name: "Létalité & Duels", score: 80, maxScore: 200, percentage: 40, label: "K/D & Dégâts nets", metricSummary: "1.00 K/D" },
        combat: { name: "Pression & Combat", score: 80, maxScore: 200, percentage: 40, label: "ACS & ADR", metricSummary: "180 ACS" },
        teamwork: { name: "Utilité & Collectif", score: 80, maxScore: 200, percentage: 40, label: "KAST % & Assists", metricSummary: "70% KAST" },
        openings: { name: "Premiers Engagements", score: 80, maxScore: 200, percentage: 40, label: "First Bloods", metricSummary: "50% FB Win" },
        precisionClutch: { name: "Sang-Froid & Précision", score: 80, maxScore: 200, percentage: 40, label: "HS % & Clutches", metricSummary: "20% HS" },
      },
      tips: ["Jouez plus de matchs compétitifs pour affiner votre score SPI."],
    };
  }

  const dominantRole: AgentRole = role || "Flex";

  // Extraction des métriques fondamentales
  const kd = stats.kdRatio ?? (stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills || 1.0);
  const acs = stats.acs || 200;
  const adr = stats.adr || (acs * 0.7);
  const hsPct = stats.headshotPct || 20;
  const kastPct = stats.kast || 70;
  const winrate = stats.winRate || 50;
  const ddDelta = stats.ddDelta || (kd > 1 ? (kd - 1) * 30 : (kd - 1) * 40);

  // Données agrégées depuis matches si disponibles
  const totalFB = matches.reduce((sum, m) => sum + (m.firstBloods || (m.won ? 2 : 1)), 0);
  const avgFB = totalFB / Math.max(1, matches.length);
  const totalClutches = matches.reduce((sum, m) => sum + (m.clutches || (m.won ? 1 : 0)), 0);

  // Configuration des pondérations par rôle (Total = 1000)
  const roleWeights: Record<AgentRole, { leth: number; combat: number; team: number; open: number; prec: number }> = {
    Duelist:   { leth: 250, combat: 250, team: 150, open: 200, prec: 150 },
    Initiator: { leth: 200, combat: 180, team: 260, open: 160, prec: 200 },
    Controller:{ leth: 180, combat: 170, team: 280, open: 120, prec: 250 },
    Sentinel:  { leth: 200, combat: 170, team: 260, open: 140, prec: 230 },
    Flex:      { leth: 200, combat: 200, team: 200, open: 200, prec: 200 },
  };

  const w = roleWeights[dominantRole] || roleWeights.Flex;

  // 1. Pilier Létalité (K/D normalisé entre 0.5 et 2.0 + DD Delta)
  const normKd = Math.max(0, Math.min(1, (kd - 0.5) / 1.3)); // 0 à 1.8+
  const normDd = Math.max(0, Math.min(1, (ddDelta + 40) / 80)); // -40 à +40
  const lethalityScore = Math.round((normKd * 0.75 + normDd * 0.25) * w.leth);

  // 2. Pilier Pression & Combat (ACS entre 100 et 350 + ADR entre 80 et 200)
  const normAcs = Math.max(0, Math.min(1, (acs - 100) / 220));
  const normAdr = Math.max(0, Math.min(1, (adr - 80) / 110));
  const combatScore = Math.round((normAcs * 0.7 + normAdr * 0.3) * w.combat);

  // 3. Pilier Utilité & Collectif (KAST entre 55% et 88% + Assists / match)
  const normKast = Math.max(0, Math.min(1, (kastPct - 55) / 30));
  const assistsPerMatch = (stats.assists || 0) / Math.max(1, matchCount);
  const normAssists = Math.max(0, Math.min(1, assistsPerMatch / 8));
  const teamworkScore = Math.round((normKast * 0.8 + normAssists * 0.2) * w.team);

  // 4. Pilier Premiers Engagements (First Bloods moyen par match: 0 à 5)
  const normFB = Math.max(0, Math.min(1, avgFB / 3.8));
  const openingsScore = Math.round(normFB * w.open);

  // 5. Pilier Précision & Sang-Froid (HS% entre 12% et 40% + Clutches + Winrate)
  const normHs = Math.max(0, Math.min(1, (hsPct - 12) / 26));
  const normWr = Math.max(0, Math.min(1, (winrate - 30) / 45));
  const clutchesPerMatch = totalClutches / Math.max(1, matchCount);
  const normClutch = Math.max(0, Math.min(1, clutchesPerMatch / 1.5));
  const precisionClutchScore = Math.round((normHs * 0.5 + normWr * 0.3 + normClutch * 0.2) * w.prec);

  // Somme finale bridée entre 50 et 1000
  const rawTotal = lethalityScore + combatScore + teamworkScore + openingsScore + precisionClutchScore;
  const totalScore = Math.max(50, Math.min(1000, rawTotal));

  // Attribution du Grade
  let grade: PerformanceGrade = "C";
  let gradeColor = "#94a3b8";
  let gradeBg = "rgba(148, 163, 184, 0.15)";
  let gradeBorder = "rgba(148, 163, 184, 0.4)";
  let gradeGlow = "rgba(148, 163, 184, 0.3)";
  let gradeTitle = "En Progression";

  if (totalScore >= 900) {
    grade = "SSS";
    gradeColor = "#fbbf24";
    gradeBg = "rgba(251, 191, 36, 0.2)";
    gradeBorder = "rgba(251, 191, 36, 0.6)";
    gradeGlow = "0 0 25px rgba(251, 191, 36, 0.5)";
    gradeTitle = "Légendaire (Radiant)";
  } else if (totalScore >= 800) {
    grade = "SS";
    gradeColor = "#ff4655";
    gradeBg = "rgba(255, 70, 85, 0.2)";
    gradeBorder = "rgba(255, 70, 85, 0.6)";
    gradeGlow = "0 0 20px rgba(255, 70, 85, 0.4)";
    gradeTitle = "Élite (Immortel)";
  } else if (totalScore >= 700) {
    grade = "S";
    gradeColor = "#a855f7";
    gradeBg = "rgba(168, 85, 247, 0.2)";
    gradeBorder = "rgba(168, 85, 247, 0.5)";
    gradeGlow = "0 0 15px rgba(168, 85, 247, 0.35)";
    gradeTitle = "Maître (Ascendant)";
  } else if (totalScore >= 550) {
    grade = "A";
    gradeColor = "#38bdf8";
    gradeBg = "rgba(56, 189, 248, 0.18)";
    gradeBorder = "rgba(56, 189, 248, 0.45)";
    gradeGlow = "0 0 12px rgba(56, 189, 248, 0.3)";
    gradeTitle = "Excellent (Diamant)";
  } else if (totalScore >= 400) {
    grade = "B";
    gradeColor = "#10b981";
    gradeBg = "rgba(16, 185, 129, 0.15)";
    gradeBorder = "rgba(16, 185, 129, 0.4)";
    gradeGlow = "0 0 10px rgba(16, 185, 129, 0.25)";
    gradeTitle = "Régulier (Platine / Or)";
  }

  // Conseils dynamiques basés sur le maillon faible
  const tips: string[] = [];
  const lethPct = (lethalityScore / w.leth) * 100;
  const combatPct = (combatScore / w.combat) * 100;
  const teamPct = (teamworkScore / w.team) * 100;
  const openPct = (openingsScore / w.open) * 100;
  const precPct = (precisionClutchScore / w.prec) * 100;

  if (openPct < 55 && dominantRole === "Duelist") {
    tips.push("Améliorez vos premiers duels (FB) : utilisez vos flashs/smokes d'entrée pour initier les duels avec avantage.");
  }
  if (teamPct < 60) {
    tips.push("Votre KAST % est améliorable : restez à portée de trade de vos coéquipiers pour ne pas mourir sans compensation.");
  }
  if (precPct < 50) {
    tips.push("Visez davantage la tête : votre HS % actuel limite votre létalité sur les duels à moyenne portée.");
  }
  if (combatPct < 55) {
    tips.push("Multipliez votre impact par round : utilisez vos compétences pour infliger des dégâts de zone et contester l'espace.");
  }
  if (tips.length === 0) {
    tips.push("Profil de jeu remarquable et équilibré : continuez sur cette dynamique de victoires !");
  }

  return {
    totalScore,
    grade,
    gradeColor,
    gradeBg,
    gradeBorder,
    gradeGlow,
    gradeTitle,
    dominantRole,
    matchCount,
    pillars: {
      lethality: {
        name: "Létalité & Duels",
        score: lethalityScore,
        maxScore: w.leth,
        percentage: Math.round(lethPct),
        label: "K/D & Différentiel Dégâts",
        metricSummary: `${kd.toFixed(2)} K/D • ${ddDelta >= 0 ? "+" : ""}${Math.round(ddDelta)} DDΔ`,
      },
      combat: {
        name: "Pression & Combat",
        score: combatScore,
        maxScore: w.combat,
        percentage: Math.round(combatPct),
        label: "ACS & Dégâts par Round",
        metricSummary: `${Math.round(acs)} ACS • ${Math.round(adr)} ADR`,
      },
      teamwork: {
        name: "Utilité & Collectif",
        score: teamworkScore,
        maxScore: w.team,
        percentage: Math.round(teamPct),
        label: "KAST % & Passes Décisives",
        metricSummary: `${Math.round(kastPct)}% KAST • ${stats.assists || 0} assists`,
      },
      openings: {
        name: "Premiers Engagements",
        score: openingsScore,
        maxScore: w.open,
        percentage: Math.round(openPct),
        label: "Premiers Sangs (First Bloods)",
        metricSummary: `${avgFB.toFixed(1)} FB / match`,
      },
      precisionClutch: {
        name: "Sang-Froid & Précision",
        score: precisionClutchScore,
        maxScore: w.prec,
        percentage: Math.round(precPct),
        label: "Tirs Tête & Situations Clutch",
        metricSummary: `${Math.round(hsPct)}% HS • ${Math.round(winrate)}% Victoires`,
      },
    },
    tips,
  };
}
