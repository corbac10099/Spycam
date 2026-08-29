// Official Riot Games API Client (No third-party dependencies)
const RIOT_API_KEY = process.env.RIOT_API_KEY || process.env.VALORANT_API_KEY;

const CLUSTERS: Record<string, string> = {
  eu: "europe",
  na: "americas",
  latam: "americas",
  br: "americas",
  ap: "asia",
  kr: "asia",
};

const REGIONS: Record<string, string> = {
  eu: "eu",
  na: "na",
  latam: "latam",
  br: "br",
  ap: "ap",
  kr: "kr",
};

export async function fetchRiotAccount(gameName: string, tagLine: string, region = "eu") {
  if (!RIOT_API_KEY) return null;
  const cluster = CLUSTERS[region.toLowerCase()] || "europe";
  const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[Riot API] Error fetching account:", err);
    return null;
  }
}

export async function fetchRiotMatchlist(puuid: string, region = "eu") {
  if (!RIOT_API_KEY) return null;
  const valRegion = REGIONS[region.toLowerCase()] || "eu";
  const url = `https://${valRegion}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[Riot API] Error fetching matchlist:", err);
    return null;
  }
}

export async function fetchRiotMatchDetails(matchId: string, region = "eu") {
  if (!RIOT_API_KEY) return null;
  const valRegion = REGIONS[region.toLowerCase()] || "eu";
  const url = `https://${valRegion}.api.riotgames.com/val/match/v1/matches/${matchId}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[Riot API] Error fetching match details:", err);
    return null;
  }
}

export async function fetchRiotLeaderboard(actId: string, region = "eu", size = 100, startIndex = 0) {
  if (!RIOT_API_KEY) return null;
  const valRegion = REGIONS[region.toLowerCase()] || "eu";
  const url = `https://${valRegion}.api.riotgames.com/val/ranked/v1/leaderboards/by-act/${actId}?size=${size}&startIndex=${startIndex}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[Riot API] Error fetching leaderboard:", err);
    return null;
  }
}
