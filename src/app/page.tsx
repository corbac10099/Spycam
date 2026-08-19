"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage, tr, trFormat } from "@/lib/i18n";
import StatCard from "@/components/StatCard";
import SettingsView from "@/components/SettingsView";
import NewsViewComponent from "@/components/NewsViewComponent";
import AgentsWikiComponent from "@/components/AgentsWikiComponent";
import MatchHistory from "@/components/MatchHistory";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import PerformanceCharts from "@/components/PerformanceCharts";

function DebugPanel({ isOpen, onClose, onGenerate }: any) {
  return null;
}

function HomeContent() {
  const { data: realSession, status: realStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSimulatedNewUser = searchParams?.get("simulate") === "true";

  const simulatedSession = useMemo(
    () => ({
      user: {
        name: "test",
        email: "test@spycam.com",
        onboardingDone: true,
        riotId: null,
        riotPuuid: null,
      },
    }),
    []
  );

  const session = isSimulatedNewUser ? simulatedSession : realSession;
  const status = isSimulatedNewUser ? ("authenticated" as const) : realStatus;

  const [riotId, setRiotId] = useState("");
  const [myRiotId, setMyRiotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [playerData, setPlayerData] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("performance");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("features");
  const [debugOpen, setDebugOpen] = useState(false);
  const [newsView, setNewsView] = useState(false);
  const [targetNewsId, setTargetNewsId] = useState<string | null>(null);
  const [agentsView, setAgentsView] = useState(false);
  const { lang: locale, setLanguage: setAppLanguage } = useLanguage();

  // URL Routing Mappings
  const TAB_TO_SLUG: Record<string, string> = useMemo(
    () => ({
      performance: "home",
      agents: "agents-stats",
      matches: "historique",
    }),
    []
  );
  const SLUG_TO_TAB: Record<string, string> = useMemo(
    () => ({
      home: "performance",
      "agents-stats": "agents",
      historique: "matches",
    }),
    []
  );
  const VALID_SLUGS = useMemo(() => ["home", "performance", "historique", "agents", "agents-stats", "actualites", "parametres"], []);

  const riotIdToSlug = useCallback((id: string) => {
    const hashIndex = id.lastIndexOf("#");
    if (hashIndex === -1) return encodeURIComponent(id);
    return encodeURIComponent(id.substring(0, hashIndex) + "-" + id.substring(hashIndex + 1));
  }, []);

  const slugToRiotId = useCallback((slug: string) => {
    const decoded = decodeURIComponent(slug);
    const lastDash = decoded.lastIndexOf("-");
    if (lastDash === -1) return decoded;
    return decoded.substring(0, lastDash) + "#" + decoded.substring(lastDash + 1);
  }, []);

  const pushUrl = useCallback(
    (opts?: {
      tab?: string;
      playerId?: string | null;
      isOwnProfile?: boolean;
      view?: "news" | "agents" | "settings" | null;
      agentSlug?: string | null;
      settingsTab?: string | null;
    }) => {
      const tab = opts?.tab;
      const playerId = opts?.playerId;
      const isOwn = opts?.isOwnProfile ?? false;
      const view = opts?.view;
      const agentSlug = opts?.agentSlug;
      const sTab = opts?.settingsTab;

      let path = "/";

      if (view === "news") {
        path = isOwn || !playerId ? "/actualites" : `/${riotIdToSlug(playerId)}/actualites`;
      } else if (view === "agents") {
        if (agentSlug) {
          path = isOwn || !playerId ? `/agents/${agentSlug}` : `/${riotIdToSlug(playerId)}/agents/${agentSlug}`;
        } else {
          path = isOwn || !playerId ? "/agents" : `/${riotIdToSlug(playerId)}/agents`;
        }
      } else if (view === "settings") {
        path = sTab ? `/parametres/${sTab}` : "/parametres";
      } else if (tab) {
        const slug = TAB_TO_SLUG[tab] || tab;
        if (isOwn || !playerId) {
          path = slug === "home" && !isOwn && !playerId ? "/home" : `/home/${slug}`;
          if (slug === "home" && isOwn) path = "/home";
        } else {
          path = `/${riotIdToSlug(playerId)}/home/${slug}`;
          if (slug === "home") path = `/${riotIdToSlug(playerId)}/home`;
        }
      } else {
        if (isOwn || !playerId) {
          path = "/home";
        } else {
          path = `/${riotIdToSlug(playerId)}/home`;
        }
      }

      if (window.location.pathname !== path) {
        window.history.pushState(null, "", path);
      }
    },
    [riotIdToSlug, TAB_TO_SLUG]
  );

  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [gameMode, setGameMode] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [visibleMatchesCount, setVisibleMatchesCount] = useState(10);

  const availableSeasons = useMemo(() => {
    if (!playerData?.player?.matchHistory) return [];
    const seasons = new Set<string>();
    playerData.player.matchHistory.forEach((m: any) => {
      if (m.season) seasons.add(m.season);
    });
    return Array.from(seasons).sort((a: any, b: any) => b.localeCompare(a));
  }, [playerData]);

  // Settings State
  const [smartRating, setSmartRating] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerOffsetY, setBannerOffsetY] = useState(50);
  const [isPublic, setIsPublic] = useState(true);
  const [videoLoop, setVideoLoop] = useState(true);
  const [videoLoopDelay, setVideoLoopDelay] = useState(500);
  const [hiddenStats, setHiddenStats] = useState<string[]>([]);
  const [enforcePublicStats, setEnforcePublicStats] = useState(false);

  // Favorites State
  const [favorites, setFavorites] = useState<Array<{ riotId: string; gameName: string; tagLine: string; cardUrl: string }>>([]);

  const favoritesKey = session?.user?.email ? `spycam-favorites-${session.user.email}` : "spycam-favorites";

  useEffect(() => {
    try {
      const stored = localStorage.getItem(favoritesKey);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    } catch {}
  }, [favoritesKey]);

  const saveFavorites = (newFavs: typeof favorites) => {
    setFavorites(newFavs);
    try {
      localStorage.setItem(favoritesKey, JSON.stringify(newFavs));
    } catch {}
  };

  const toggleFavorite = (player: any) => {
    const id = `${player.gameName}#${player.tagLine}`;
    const exists = favorites.some((f) => f.riotId === id);
    if (exists) {
      saveFavorites(favorites.filter((f) => f.riotId !== id));
    } else {
      saveFavorites([
        ...favorites,
        {
          riotId: id,
          gameName: player.gameName,
          tagLine: player.tagLine,
          cardUrl: player.cardUrl || "",
        },
      ]);
    }
  };

  const isFavorited = (gameName: string, tagLine: string) => {
    return favorites.some((f) => f.riotId === `${gameName}#${tagLine}`);
  };

  const goHome = () => {
    if (myRiotId) {
      setRiotId(myRiotId);
      setLoading(true);
      setError("");
      setPlayerData(null);
      pushUrl({ tab: activeTab, playerId: myRiotId, isOwnProfile: true });
      fetch("/api/valorant/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId: myRiotId }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.error) setError(d.error);
          else setPlayerData(d);
        })
        .catch(() => setError("Serveur inaccessible."))
        .finally(() => setLoading(false));
    }
  };

  const searchPlayer = (searchId: string) => {
    const isOwn = myRiotId && searchId.toLowerCase() === myRiotId.toLowerCase();
    setRiotId(searchId);
    setLoading(true);
    setError("");
    setPlayerData(null);
    pushUrl({ tab: activeTab, playerId: searchId, isOwnProfile: !!isOwn });
    fetch("/api/valorant/player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riotId: searchId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setPlayerData(d);
      })
      .catch(() => setError("Serveur inaccessible."))
      .finally(() => setLoading(false));
  };

  const canEditProfile =
    !isSimulatedNewUser &&
    (playerData?.player?.puuid?.startsWith("debug-") ||
      (session?.user?.email === "laffont.romain64@gmail.com" && playerData?.player?.gameName === "Gr4phØ") ||
      (session?.user?.email === "spycam_riot_temp@gmail.com" && playerData?.player?.gameName?.toLowerCase() === "riot_test") ||
      (session?.user?.email === "romain.lft64@gmail.com" && playerData?.player?.gameName?.toLowerCase() === "biflette64") ||
      ((session?.user as any)?.riotPuuid && (session?.user as any)?.riotPuuid === playerData?.player?.puuid));

  // Auth redirect & Initial fetch
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" && !isSimulatedNewUser) {
      router.replace("/login");
    } else if (status === "authenticated" && session?.user) {
      const user = session.user as any;
      if (!user.onboardingDone && !isSimulatedNewUser) {
        router.replace("/onboarding");
      } else {
        if (user.theme) setTheme(user.theme);
        if (user.smartRating !== undefined) setSmartRating(user.smartRating);
        if (user.bannerUrl !== undefined) setBannerUrl(user.bannerUrl || "");
        if (user.bannerOffsetY !== undefined) setBannerOffsetY(user.bannerOffsetY ?? 50);
        if (user.isPublic !== undefined) setIsPublic(user.isPublic);
        if (user.videoLoop !== undefined) setVideoLoop(user.videoLoop);
        if (user.videoLoopDelay !== undefined) setVideoLoopDelay(user.videoLoopDelay);
        if (user.hiddenStats !== undefined) {
          try {
            setHiddenStats(JSON.parse(user.hiddenStats));
          } catch {}
        }
        if (user.enforcePublicStats !== undefined) setEnforcePublicStats(user.enforcePublicStats);
        if (user.language) {
          setAppLanguage(user.language);
        }

        if (!playerData && !loading) {
          let initialRiotId = user.riotId;

          if (!isSimulatedNewUser && user.email === "laffont.romain64@gmail.com") {
            initialRiotId = "Gr4phØ#0001";
          } else if (!isSimulatedNewUser && user.email === "spycam_riot_temp@gmail.com") {
            initialRiotId = "riot_test#TEST";
          } else if (!isSimulatedNewUser && user.email === "romain.lft64@gmail.com") {
            initialRiotId = "biflette64#1294";
          }

          if (initialRiotId) setMyRiotId(initialRiotId);
          if (isSimulatedNewUser) initialRiotId = null;

          const pathname = window.location.pathname;
          const segments = pathname.split("/").filter(Boolean);
          let urlRiotId: string | null = null;
          let urlTab: string | null = null;
          let urlView: "news" | "agents" | "settings" | null = null;
          let uAgentSlug: string | null = null;
          let uSettingsTab: string | null = null;

          if (segments.length > 0) {
            if (segments[0] === "actualites") {
              urlView = "news";
            } else if (segments[0] === "agents") {
              urlView = "agents";
              if (segments[1]) uAgentSlug = segments[1];
            } else if (segments[0] === "parametres") {
              urlView = "settings";
              if (segments[1]) uSettingsTab = segments[1];
            } else if (segments[0] === "home") {
              if (segments[1] && SLUG_TO_TAB[segments[1]]) {
                urlTab = SLUG_TO_TAB[segments[1]];
              } else {
                urlTab = "performance";
              }
            } else {
              urlRiotId = slugToRiotId(segments[0]);
              if (segments[1] === "actualites") {
                urlView = "news";
              } else if (segments[1] === "agents") {
                urlView = "agents";
                if (segments[2]) uAgentSlug = segments[2];
              } else if (segments[1] === "parametres") {
                urlView = "settings";
                if (segments[2]) uSettingsTab = segments[2];
              } else if (segments[1] === "home") {
                if (segments[2] && SLUG_TO_TAB[segments[2]]) {
                  urlTab = SLUG_TO_TAB[segments[2]];
                } else {
                  urlTab = "performance";
                }
              }
            }
          }

          if (urlView === "news") setNewsView(true);
          else if (urlView === "agents") setAgentsView(true);
          else if (urlView === "settings") {
            setSettingsOpen(true);
            if (uSettingsTab) setSettingsTab(uSettingsTab);
          }
          if (urlTab) setActiveTab(urlTab);

          const targetRiotId = urlRiotId || initialRiotId;

          if (targetRiotId) {
            setRiotId(targetRiotId);
            setLoading(true);
            setError("");
            setPlayerData(null);
            const isOwn = initialRiotId && targetRiotId.toLowerCase() === initialRiotId.toLowerCase();
            if (pathname === "/" || pathname === "") {
              pushUrl({ tab: urlTab || "performance", playerId: targetRiotId, isOwnProfile: !!isOwn });
            }
            fetch("/api/valorant/player", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ riotId: targetRiotId }),
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.error) setError(d.error);
                else setPlayerData(d);
              })
              .catch(() => setError("Serveur inaccessible."))
              .finally(() => setLoading(false));
          }
        }
      }
    }
  }, [status, isSimulatedNewUser]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const segments = pathname.split("/").filter(Boolean);

      setNewsView(false);
      setAgentsView(false);
      setSettingsOpen(false);

      if (segments.length === 0) {
        if (myRiotId) searchPlayer(myRiotId);
        setActiveTab("performance");
        return;
      }

      let urlRiotId: string | null = null;
      let urlTab: string | null = null;

      if (segments[0] === "actualites") {
        setNewsView(true);
      } else if (segments[0] === "agents") {
        setAgentsView(true);
      } else if (segments[0] === "parametres") {
        setSettingsOpen(true);
        if (segments[1]) setSettingsTab(segments[1]);
      } else if (segments[0] === "home") {
        if (segments[1] && SLUG_TO_TAB[segments[1]]) {
          urlTab = SLUG_TO_TAB[segments[1]];
        } else {
          urlTab = "performance";
        }
      } else {
        urlRiotId = slugToRiotId(segments[0]);
        if (segments[1] === "actualites") {
          setNewsView(true);
        } else if (segments[1] === "agents") {
          setAgentsView(true);
        } else if (segments[1] === "parametres") {
          setSettingsOpen(true);
        } else if (segments[1] === "home") {
          if (segments[2] && SLUG_TO_TAB[segments[2]]) {
            urlTab = SLUG_TO_TAB[segments[2]];
          } else {
            urlTab = "performance";
          }
        }
      }

      if (urlTab) setActiveTab(urlTab);

      if (urlRiotId && urlRiotId !== riotId) {
        setRiotId(urlRiotId);
        setLoading(true);
        setError("");
        setPlayerData(null);
        fetch("/api/valorant/player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ riotId: urlRiotId }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.error) setError(d.error);
            else setPlayerData(d);
          })
          .catch(() => setError("Serveur inaccessible."))
          .finally(() => setLoading(false));
      } else if (!urlRiotId && myRiotId && riotId !== myRiotId) {
        searchPlayer(myRiotId);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [myRiotId, riotId, VALID_SLUGS, SLUG_TO_TAB, slugToRiotId, locale]);

  const filteredMatches = useMemo(() => {
    if (!playerData?.player?.matchHistory) return [];
    return playerData.player.matchHistory.filter((m: any) => {
      const modeMatch =
        gameMode === "all" ||
        (gameMode === "competitive" && m.mode === "competitive") ||
        (gameMode === "unrated" && m.mode === "unrated") ||
        (gameMode === "other" && m.mode !== "competitive" && m.mode !== "unrated");

      const seasonMatch = selectedSeason === "all" || m.season === selectedSeason;
      return modeMatch && seasonMatch;
    });
  }, [playerData?.player?.matchHistory, gameMode, selectedSeason]);

  const filteredAgents = useMemo(() => {
    if (!playerData?.player?.agentStats) return [];
    if (gameMode === "all" && selectedSeason === "all") return playerData.player.agentStats;

    const counts: Record<string, any> = {};
    filteredMatches.forEach((m: any) => {
      if (!counts[m.agent]) counts[m.agent] = { games: 0, wins: 0, kills: 0, deaths: 0, hoursPlayed: 0, icon: m.agentIcon };
      counts[m.agent].games++;
      if (m.won) counts[m.agent].wins++;
      counts[m.agent].kills += m.kills;
      counts[m.agent].deaths += m.deaths;
      counts[m.agent].hoursPlayed += (m.duration || 0) / 3600;
    });

    return Object.keys(counts)
      .map((name) => {
        const data = counts[name];
        const orig = playerData.player.agentStats.find((a: any) => a.name === name);
        return {
          name,
          role: orig?.role || "Agent",
          icon: data.icon,
          games: data.games,
          winRate: Math.round((data.wins / data.games) * 100),
          kd: parseFloat((data.kills / Math.max(data.deaths, 1)).toFixed(2)),
          hoursPlayed: parseFloat(data.hoursPlayed.toFixed(1)),
        };
      })
      .sort((a: any, b: any) => b.games - a.games);
  }, [playerData?.player?.agentStats, gameMode, selectedSeason, filteredMatches]);

  const filteredStats = useMemo(() => {
    if (!playerData?.player?.stats) return null;
    if (gameMode === "all" && selectedSeason === "all") return playerData.player.stats;

    const matches = filteredMatches;
    if (matches.length === 0)
      return {
        ...playerData.player.stats,
        kills: 0,
        deaths: 0,
        assists: 0,
        kdRatio: 0,
        winRate: 0,
        matchesPlayed: 0,
        acs: 0,
        headshotPct: 0,
        aceCount: 0,
      };

    const totalKills = matches.reduce((sum: number, m: any) => sum + m.kills, 0);
    const totalDeaths = matches.reduce((sum: number, m: any) => sum + m.deaths, 0);
    const totalAssists = matches.reduce((sum: number, m: any) => sum + m.assists, 0);
    const wins = matches.filter((m: any) => m.won).length;
    const totalHS = matches.reduce((sum: number, m: any) => sum + (m.headshots || 0), 0);
    const totalShots = matches.reduce((sum: number, m: any) => sum + (m.headshots || 0) + (m.bodyshots || 0) + (m.legshots || 0), 0);
    const totalAces = matches.reduce((sum: number, m: any) => sum + (m.aces || 0), 0);

    return {
      ...playerData.player.stats,
      kills: totalKills,
      deaths: totalDeaths,
      assists: totalAssists,
      kdRatio: parseFloat((totalKills / Math.max(totalDeaths, 1)).toFixed(2)),
      winRate: Math.round((wins / matches.length) * 100),
      matchesPlayed: matches.length,
      acs: Math.round(matches.reduce((sum: number, m: any) => sum + m.acs, 0) / matches.length),
      headshotPct: totalShots > 0 ? parseFloat(((totalHS / totalShots) * 100).toFixed(1)) : playerData.player.stats.headshotPct,
      aceCount: totalAces,
    };
  }, [playerData?.player?.stats, gameMode, selectedSeason, filteredMatches]);

  // Apply logged-in user's theme to body
  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-midnight", "theme-crimson", "theme-ocean", "theme-custom");
    document.documentElement.style.removeProperty("--custom-bg");
    document.documentElement.style.removeProperty("--custom-accent");

    if (theme !== "dark" && !theme?.startsWith("custom:")) {
      document.body.classList.add(`theme-${theme}`);
    } else if (theme?.startsWith("custom:")) {
      document.body.classList.add("theme-custom");
      const matchBg = theme.match(/bg=([^,]+)/);
      const matchAccent = theme.match(/accent=([^,]+)/);
      if (matchBg) document.documentElement.style.setProperty("--custom-bg", matchBg[1]);
      if (matchAccent) document.documentElement.style.setProperty("--custom-accent", matchAccent[1]);
    }
  }, [theme]);

  useEffect(() => {
    const ep = searchParams?.get("error");
    if (ep) setError(ep === "missing_credentials" ? "Client ID RSO manquant." : ep === "token_exchange_failed" ? "Échec token Riot." : "Erreur connexion.");
    if (searchParams?.get("loggedIn") === "true") fetchMyData();
  }, [searchParams]);

  const fetchMyData = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/me");
      const d = await r.json();
      if (!r.ok) setError(d.error);
      else setPlayerData(d);
    } catch {
      setError("Session invalide.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlayerData(null);
    const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();

    setNewsView(false);
    setAgentsView(false);
    setSettingsOpen(false);
    pushUrl({ tab: "performance", playerId: riotId, isOwnProfile: !!isOwn });
    try {
      const r = await fetch("/api/valorant/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId }),
      });
      const d = await r.json();
      if (!r.ok) setError(d.error);
      else setPlayerData(d);
    } catch {
      setError("Serveur inaccessible.");
    } finally {
      setLoading(false);
    }
  };

  const handleDebugGenerate = async () => {
    setLoading(true);
    setError("");
    setPlayerData(null);
    try {
      const r = await fetch("/api/valorant/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debug: true }),
      });
      const d = await r.json();
      if (!r.ok) setError(d.error);
      else setPlayerData(d);
    } catch {
      setError("Erreur debug.");
    } finally {
      setLoading(false);
    }
  };

  const getWarnings = (s: any) => {
    if (!s) return {};
    const w: Record<string, string> = {};
    if (s.kdRatio < 1) w.kd = trFormat("K/D de {kd} — en dessous de 1.0. Vous mourez plus que vous ne tuez. Travaillez le positionnement.", { kd: s.kdRatio });
    if (s.headshotPct < 20) w.hs = trFormat("Headshot à {hs}% — sous la moyenne de 20%. Travaillez le crosshair placement.", { hs: s.headshotPct });
    if (s.winRate < 50) w.wr = trFormat("Win rate de {wr}% — sous 50%. Adaptez vos stratégies et communiquez.", { wr: s.winRate });
    if (s.acs < 200) w.acs = trFormat("ACS de {acs} — sous 200. Participez davantage aux rounds.", { acs: s.acs });
    if (s.kast < 65) w.kast = trFormat("KAST de {kast}% — sous 65%. Impliquez-vous plus (Kill/Assist/Survived/Trade).", { kast: s.kast });
    if (s.ddDelta < 0) w.dd = trFormat("DDΔ négatif ({dd}) — vous subissez plus de dégâts que vous n'en infligez.", { dd: s.ddDelta });
    return w;
  };

  // Keyboard shortcut for debug
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setDebugOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (status === "loading") {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="w-20 h-20 bg-[var(--color-val-red)] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,70,85,0.3)]">
            <span className="text-white text-4xl font-black">V</span>
          </div>
          <p className="text-[var(--color-text-secondary)] uppercase tracking-widest text-sm font-bold">Chargement...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 flex flex-col relative overflow-hidden min-h-screen pb-28 md:pb-16">
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-val-red)] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
        <DebugPanel isOpen={debugOpen} onClose={() => setDebugOpen(false)} onGenerate={handleDebugGenerate} />

        {/* Top Header */}
        <Header
          session={session}
          riotId={riotId}
          setRiotId={setRiotId}
          myRiotId={myRiotId}
          onSearch={handleSearch}
          newsView={newsView}
          agentsView={agentsView}
          settingsOpen={settingsOpen}
          onGoHome={() => {
            setNewsView(false);
            setAgentsView(false);
            setSettingsOpen(false);
            goHome();
          }}
          onOpenNews={(newsId) => {
            setNewsView(true);
            setAgentsView(false);
            setSettingsOpen(false);
            if (newsId) setTargetNewsId(newsId);
            else setTargetNewsId(null);
            const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();
            pushUrl({ view: "news", playerId: riotId || myRiotId, isOwnProfile: !!isOwn });
          }}
          onOpenAgents={() => {
            setAgentsView(true);
            setNewsView(false);
            setSettingsOpen(false);
            const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();
            pushUrl({ view: "agents", playerId: riotId || myRiotId, isOwnProfile: !!isOwn });
          }}
          onToggleSettings={() => {
            const newVal = !settingsOpen;
            setSettingsOpen(newVal);
            if (newVal) {
              pushUrl({ view: "settings" });
            } else {
              const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();
              pushUrl({ tab: activeTab, playerId: riotId || myRiotId, isOwnProfile: !!isOwn });
            }
          }}
          favorites={favorites}
          onSelectFavorite={searchPlayer}
          onRemoveFavorite={toggleFavorite}
          activeGameName={playerData?.player?.gameName}
          playerStats={playerData?.player?.stats}
        />

        {/* Dynamic Views */}
        {settingsOpen ? (
          <SettingsView
            onClose={() => setSettingsOpen(false)}
            smartRating={smartRating}
            setSmartRating={setSmartRating}
            theme={theme}
            setTheme={setTheme}
            bannerUrl={bannerUrl}
            setBannerUrl={setBannerUrl}
            bannerOffsetY={bannerOffsetY}
            setBannerOffsetY={setBannerOffsetY}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            videoLoop={videoLoop}
            setVideoLoop={setVideoLoop}
            videoLoopDelay={videoLoopDelay}
            setVideoLoopDelay={setVideoLoopDelay}
            hiddenStats={hiddenStats}
            setHiddenStats={setHiddenStats}
            enforcePublicStats={enforcePublicStats}
            setEnforcePublicStats={setEnforcePublicStats}
            p={playerData?.player}
            canEditProfile={canEditProfile}
            settingsTab={settingsTab}
            setSettingsTab={setSettingsTab}
            pushUrl={pushUrl}
            locale={locale}
          />
        ) : newsView && !agentsView ? (
          <NewsViewComponent newsItems={newsItems} setNewsItems={setNewsItems} targetNewsId={targetNewsId} />
        ) : agentsView && !newsView ? (
          <AgentsWikiComponent videoLoop={videoLoop} videoLoopDelay={videoLoopDelay} locale={locale} pushUrl={pushUrl} />
        ) : (
          <div className="flex-1 flex flex-col items-center px-4 sm:px-8 z-10 w-full max-w-6xl mx-auto">
            {error &&
              (error.includes("privé") ? (
                <div className="glass-panel rounded-2xl p-10 flex flex-col items-center text-center max-w-lg mb-6 animate-in fade-in duration-500">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-2">Profil Privé</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{error}</p>
                </div>
              ) : (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-3 rounded-lg mb-6 text-center max-w-lg">{error}</div>
              ))}

            {loading && (
              <div className="text-[var(--color-text-secondary)] animate-pulse mt-10 text-xl font-bold tracking-widest uppercase">
                Chargement...
              </div>
            )}

            {!playerData && !loading && (
              <div className="flex flex-col items-center justify-center mt-20 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-[var(--color-val-red)] rounded-3xl mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(255,70,85,0.3)]">
                  <span className="text-white text-5xl font-black">V</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Bienvenue sur SPYCAM</h2>
                <p className="text-[var(--color-text-secondary)] mb-8 max-w-md">Recherchez un joueur ou connectez-vous via RSO.</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-6 opacity-50">Debug : Double-cliquez sur le logo V ou Ctrl+Shift+D</p>
              </div>
            )}

            {playerData &&
              (() => {
                const p = {
                  ...playerData.player,
                  stats: filteredStats || playerData.player.stats,
                  agentStats: filteredAgents,
                  matchHistory: filteredMatches,
                };
                const s = p.stats;
                const w = getWarnings(s);

                const profileBannerUrl = canEditProfile
                  ? bannerUrl || p.customBannerUrl || p.cardWideUrl
                  : p.customBannerUrl || p.cardWideUrl;

                const profileBannerOffsetY = canEditProfile
                  ? (bannerOffsetY ?? p.customBannerOffsetY ?? 50)
                  : (p.customBannerOffsetY ?? 50);

                const profileThemeClass =
                  !canEditProfile && p.customTheme && p.customTheme !== "dark" ? `theme-${p.customTheme}` : "";

                return (
                  <div className={`w-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 ${profileThemeClass}`}>
                    {/* Bannière Profil Responsive */}
                    <div className="w-full relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[0_8px_30px_var(--color-glass-shadow)] bg-[#0a0e13] min-h-[110px] sm:min-h-[140px] aspect-[2.4/1] sm:aspect-[3.6/1] md:aspect-[3.8/1]">
                      <img
                        referrerPolicy="no-referrer"
                        src={profileBannerUrl}
                        alt="Banner"
                        style={{ objectPosition: `center ${profileBannerOffsetY}%` }}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                      />
                      <div className="absolute inset-0 bg-black/40"></div>

                      <div className="relative z-10 px-3 sm:px-6 md:px-8 py-3 sm:py-5 flex items-center justify-between h-full w-full gap-2">
                        {/* Gauche : Avatar + Pseudo + Tag */}
                        <div className="flex items-center gap-2 sm:gap-4 md:gap-5 min-w-0 flex-1">
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div className="w-11 h-11 xs:w-13 xs:h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-[rgba(255,255,255,0.15)] shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
                              <img referrerPolicy="no-referrer" src={p.cardUrl} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            {p.mainAgent && (
                              <div className="hidden sm:flex items-center gap-1.5 bg-[rgba(0,0,0,0.5)] rounded-full px-2 py-0.5 border border-[rgba(255,255,255,0.1)]">
                                <img referrerPolicy="no-referrer" src={p.mainAgent.icon} alt={p.mainAgent.name} className="w-3.5 h-3.5 rounded-full shadow-md" />
                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">{p.mainAgent.name}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col min-w-0" style={{ textShadow: "0px 2px 10px rgba(0,0,0,0.8)" }}>
                            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                              <span className="text-sm xs:text-base sm:text-xl md:text-2xl font-black tracking-tight text-white truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">{p.gameName}</span>
                              <span className="text-[10px] sm:text-xs md:text-sm text-[var(--color-text-secondary)] font-medium">#{p.tagLine}</span>
                            </div>
                            {p.mainAgent && (
                              <span className="text-[8px] sm:text-[9px] md:text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-0.5 font-bold truncate">
                                Main • {p.mainAgent.role}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Centre : Niveau */}
                        <div className="flex flex-col items-center flex-shrink-0 px-1 sm:px-3">
                          <span className="text-[8px] sm:text-[9px] md:text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.15em] mb-0.5 sm:mb-1 font-bold" style={{ textShadow: "0px 2px 8px rgba(0,0,0,0.8)" }}>
                            Niveau
                          </span>
                          <div className="relative flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 md:w-16 md:h-16">
                            <div className="absolute inset-0 border-2 border-[var(--color-val-light)] opacity-50 transform rotate-45 rounded-md sm:rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]"></div>
                            <span className="text-xs xs:text-sm sm:text-xl md:text-3xl font-black text-[var(--color-val-light)] drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] z-10">
                              {p.level}
                            </span>
                          </div>
                        </div>

                        {/* Droite : Rang + Favori */}
                        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 flex-shrink-0">
                          <div className="flex flex-col items-end hidden md:flex" style={{ textShadow: "0px 2px 10px rgba(0,0,0,0.8)" }}>
                            <span className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-bold">Rang</span>
                            <span className="text-xs sm:text-lg font-black text-white uppercase tracking-wider">{p.rank}</span>
                          </div>
                          <img referrerPolicy="no-referrer" src={p.rankUrl} alt={p.rank} className="w-9 h-9 xs:w-11 xs:h-11 sm:w-14 sm:h-14 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]" />

                          {!canEditProfile && (
                            <button
                              onClick={() => toggleFavorite(p)}
                              title={isFavorited(p.gameName, p.tagLine) ? "Retirer des favoris" : "Ajouter aux favoris"}
                              className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border cursor-pointer ${
                                isFavorited(p.gameName, p.tagLine)
                                  ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                                  : "bg-black/30 border-white/10 text-white/50 hover:text-yellow-400 hover:border-yellow-500/30"
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={isFavorited(p.gameName, p.tagLine) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tabs + Mode Filter */}
                    <div className="w-full mt-4 sm:mt-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[var(--color-border)] mb-4 sm:mb-6 gap-3">
                        <div className="flex items-center gap-4 sm:gap-8">
                          {[
                            { id: "performance", label: "Performances" },
                            { id: "agents", label: "Agents" },
                            { id: "matches", label: "Historique" },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => {
                                setActiveTab(tab.id);
                                const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();
                                pushUrl({ tab: tab.id, playerId: riotId || myRiotId, isOwnProfile: !!isOwn });
                              }}
                              className={`pb-3 text-xs sm:text-sm uppercase tracking-widest font-bold transition-all relative cursor-pointer ${
                                activeTab === tab.id
                                  ? "text-[var(--color-val-red)]"
                                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                              }`}
                            >
                              {tab.label}
                              {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-val-red)] shadow-[0_0_10px_var(--color-val-red)]"></div>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Filtres mode de jeu & saison */}
                        <div className="flex items-center gap-2 sm:gap-3 pb-3 flex-wrap">
                          <select
                            value={selectedSeason}
                            onChange={(e) => {
                              setSelectedSeason(e.target.value);
                              setVisibleMatchesCount(10);
                            }}
                            className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold rounded-lg px-2.5 sm:px-3 py-1.5 outline-none cursor-pointer hover:border-[var(--color-val-red)] transition-colors"
                          >
                            <option value="all">Toutes les saisons</option>
                            {availableSeasons.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            {[
                              { id: "all", label: "Tout" },
                              { id: "competitive", label: "Classé" },
                              { id: "unrated", label: "Non classé" },
                              { id: "other", label: "Autres" },
                            ].map((mode) => (
                              <button
                                key={mode.id}
                                onClick={() => {
                                  setGameMode(mode.id);
                                  setVisibleMatchesCount(10);
                                }}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                  gameMode === mode.id
                                    ? "bg-[var(--color-val-red)] text-white shadow-[0_0_10px_rgba(255,70,85,0.3)]"
                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
                                }`}
                              >
                                {mode.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Performance Tab */}
                      {activeTab === "performance" && s && (
                        <>
                          {/* Performance Progression Charts */}
                          <PerformanceCharts matchHistory={filteredMatches} />

                          {(() => {
                            let appliedHiddenStats: string[] = [];
                            if (canEditProfile) {
                              appliedHiddenStats = hiddenStats;
                            } else if (playerData?.player?.enforcePublicStats) {
                              try {
                                appliedHiddenStats =
                                  typeof playerData.player.hiddenStats === "string"
                                    ? JSON.parse(playerData.player.hiddenStats)
                                    : playerData.player.hiddenStats || [];
                              } catch {
                                appliedHiddenStats = [];
                              }
                            }

                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3.5 animate-in fade-in duration-500">
                                {!appliedHiddenStats.includes("kills") && (
                                  <StatCard label="Éliminations" value={s.kills} smartRating={smartRating} />
                                )}
                                {!appliedHiddenStats.includes("deaths") && (
                                  <StatCard label="Morts" value={s.deaths} smartRating={smartRating} />
                                )}
                                {!appliedHiddenStats.includes("assists") && (
                                  <StatCard label="Passes décisives" value={s.assists} smartRating={smartRating} />
                                )}
                                {!appliedHiddenStats.includes("kd") && (
                                  <StatCard
                                    label="Ratio K/D"
                                    value={s.kdRatio.toFixed(2)}
                                    highlight
                                    warning={w.kd}
                                    smartRating={smartRating}
                                  />
                                )}

                                {!appliedHiddenStats.includes("adr") && (
                                  <StatCard label="Dégâts/Tour (ADR)" value={s.adr} highlight smartRating={smartRating} />
                                )}
                                {!appliedHiddenStats.includes("hs") && (
                                  <StatCard
                                    label="Headshot %"
                                    value={s.headshotPct}
                                    suffix="%"
                                    warning={w.hs}
                                    smartRating={smartRating}
                                  />
                                )}
                                {!appliedHiddenStats.includes("wr") && (
                                  <StatCard
                                    label="Win Rate"
                                    value={s.winRate}
                                    suffix="%"
                                    warning={w.wr}
                                    smartRating={smartRating}
                                  />
                                )}
                                {!appliedHiddenStats.includes("acs") && (
                                  <StatCard
                                    label="ACS Moyen"
                                    value={s.acs}
                                    highlight
                                    warning={w.acs}
                                    smartRating={smartRating}
                                  />
                                )}

                                {!appliedHiddenStats.includes("fb") && (
                                  <StatCard label="Premiers sangs" value={s.firstBloods} smartRating={smartRating} />
                                )}
                                {!appliedHiddenStats.includes("ace") && (
                                  <StatCard label="ACE" value={s.aceCount} smartRating={smartRating} />
                                )}
                                {!appliedHiddenStats.includes("kast") && (
                                  <StatCard
                                    label="KAST"
                                    value={s.kast}
                                    suffix="%"
                                    sub={s.kastPercentile}
                                    warning={w.kast}
                                    smartRating={smartRating}
                                  />
                                )}
                                {!appliedHiddenStats.includes("dd") && (
                                  <StatCard
                                    label="DDΔ / Round"
                                    value={s.ddDelta > 0 ? `+${s.ddDelta}` : s.ddDelta}
                                    warning={w.dd}
                                    smartRating={smartRating}
                                  />
                                )}

                                {!appliedHiddenStats.includes("wins") && (
                                  <StatCard
                                    label="Victoires"
                                    value={Math.round((s.winRate / 100) * s.matchesPlayed)}
                                    smartRating={smartRating}
                                  />
                                )}
                                {!appliedHiddenStats.includes("matches") && (
                                  <StatCard label="Parties" value={s.matchesPlayed} smartRating={smartRating} />
                                )}
                              </div>
                            );
                          })()}
                        </>
                      )}

                      {/* Agents Tab */}
                      {activeTab === "agents" && p.agentStats && (
                        <div className="space-y-3 animate-in fade-in duration-500">
                          {p.agentStats.map((agent: any) => (
                            <div
                              key={agent.name}
                              className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 hover:bg-[var(--color-surface-hover)] transition-all duration-300"
                            >
                              <img
                                referrerPolicy="no-referrer"
                                src={agent.icon}
                                alt={agent.name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-[rgba(255,255,255,0.1)] flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-[var(--color-text-on-surface)] text-base sm:text-lg">{agent.name}</span>
                                  <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full">
                                    {agent.role}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-5 mt-2 flex-wrap">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold">
                                      Parties
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-[var(--color-text-on-surface)]">{agent.games}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold">
                                      Win Rate
                                    </span>
                                    <span className={`text-xs sm:text-sm font-bold ${agent.winRate >= 50 ? "text-emerald-400" : "text-red-400"}`}>
                                      {agent.winRate}%
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold">
                                      K/D
                                    </span>
                                    <span className={`text-xs sm:text-sm font-bold ${agent.kd >= 1 ? "text-emerald-400" : "text-red-400"}`}>
                                      {agent.kd}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold">
                                      Heures
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-[var(--color-text-on-surface)]">{agent.hoursPlayed}h</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-20 sm:w-24 h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden hidden sm:block flex-shrink-0">
                                <div
                                  className={`h-full rounded-full transition-all ${agent.winRate >= 50 ? "bg-emerald-500" : "bg-red-500"}`}
                                  style={{ width: `${agent.winRate}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Matches Tab */}
                      {activeTab === "matches" && filteredMatches && (
                        <MatchHistory
                          matches={filteredMatches}
                          searchPlayer={searchPlayer}
                          visibleCount={visibleMatchesCount}
                          onLoadMore={() => setVisibleMatchesCount((prev) => prev + 10)}
                        />
                      )}
                    </div>
                  </div>
                );
              })()}
          </div>
        )}

        {/* Bottom Mobile Navigation (< 768px) */}
        <MobileNav
          activeTab={activeTab}
          newsView={newsView}
          agentsView={agentsView}
          settingsOpen={settingsOpen}
          onGoHome={() => {
            setNewsView(false);
            setAgentsView(false);
            setSettingsOpen(false);
            goHome();
          }}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();
            pushUrl({ tab, playerId: riotId || myRiotId, isOwnProfile: !!isOwn });
          }}
          onOpenNews={() => {
            setNewsView(true);
            setAgentsView(false);
            setSettingsOpen(false);
            const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();
            pushUrl({ view: "news", playerId: riotId || myRiotId, isOwnProfile: !!isOwn });
          }}
          onOpenAgents={() => {
            setAgentsView(true);
            setNewsView(false);
            setSettingsOpen(false);
            const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();
            pushUrl({ view: "agents", playerId: riotId || myRiotId, isOwnProfile: !!isOwn });
          }}
          onToggleSettings={() => {
            const newVal = !settingsOpen;
            setSettingsOpen(newVal);
            if (newVal) {
              pushUrl({ view: "settings" });
            } else {
              const isOwn = myRiotId && riotId.toLowerCase() === myRiotId.toLowerCase();
              pushUrl({ tab: activeTab, playerId: riotId || myRiotId, isOwnProfile: !!isOwn });
            }
          }}
        />
      </main>

      {/* Legal Disclaimer */}
      <footer className="w-full text-center px-4 py-8 max-w-4xl mx-auto opacity-40 text-[10px] md:text-xs text-[var(--color-text-secondary)] leading-relaxed mb-12 md:mb-0">
        Spycam n&apos;est pas affilié à Riot Games et ne reflète pas les opinions de Riot Games ni de toute personne impliquée dans la production ou la gestion des propriétés de Riot Games. Riot Games et toutes les propriétés associées sont des marques commerciales ou des marques déposées de Riot Games, Inc.
      </footer>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[var(--color-text-secondary)] font-bold tracking-widest uppercase animate-pulse">
          Chargement...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
