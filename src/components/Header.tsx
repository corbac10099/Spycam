"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import NotificationsDropdown from "./NotificationsDropdown";
import LiveClock from "./LiveClock";

import { sounds } from "@/lib/soundEffects";
import { IconTrophy, IconSettings } from "./icons/SpyIcons";

export interface HeaderProps {
  session: any;
  riotId: string;
  setRiotId: (id: string) => void;
  myRiotId: string;
  onSearch: (e: React.FormEvent) => void;
  newsView: boolean;
  agentsView: boolean;
  lobbiesView?: boolean;
  settingsOpen: boolean;
  onGoHome: () => void;
  onOpenNews: (newsId?: string) => void;
  onOpenAgents: () => void;
  onOpenLobbies?: () => void;
  onOpenHotkeys?: () => void;
  onToggleSettings: () => void;
  onOpenLeaderboard?: () => void;
  leaderboardOpen?: boolean;
  favorites: Array<{ riotId: string; gameName: string; tagLine: string; cardUrl: string; rank?: string }>;
  onSelectFavorite: (riotId: string) => void;
  onRemoveFavorite?: (player: any) => void;
  activeGameName?: string;
  playerStats?: any;
}

export default function Header({
  session,
  riotId,
  setRiotId,
  myRiotId,
  onSearch,
  newsView,
  agentsView,
  lobbiesView = false,
  settingsOpen,
  onGoHome,
  onOpenNews,
  onOpenAgents,
  onOpenLobbies,
  onOpenHotkeys,
  onToggleSettings,
  onOpenLeaderboard,
  leaderboardOpen = false,
  favorites,
  onSelectFavorite,
  onRemoveFavorite,
  activeGameName,
  playerStats,
}: HeaderProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("spycam_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const clean = query.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem("spycam_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const removeRecentSearch = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== query);
    setRecentSearches(updated);
    try {
      localStorage.setItem("spycam_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem("spycam_recent_searches");
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    saveRecentSearch(riotId);
    setIsFocused(false);
    onSearch(e);
  };

  // Keyboard shortcut: Ctrl + K / Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      } else if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md sticky top-0 mb-6 sm:mb-8 flex flex-col">
      {/* Top Navbar */}
      <div className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 w-full">
        {/* Left: Logo + Nav buttons */}
        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          <div
            onClick={onGoHome}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 group"
            title="Spycam Accueil"
          >
            <img
              src="/spycam-icon.png"
              alt="Spycam Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,70,85,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(255,70,85,0.9)] transition-all"
            />
          </div>
          <span className="font-black text-lg text-[var(--color-text-primary)] tracking-widest hidden md:inline-block">
            SPYCAM
          </span>

          {/* Home button (Desktop only) */}
          {myRiotId && (
            <button
              onClick={() => {
                sounds.playTabSwitch();
                onGoHome();
              }}
              onMouseEnter={() => sounds.playHover()}
              title="Retour à mon profil"
              className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-all duration-300 border cursor-pointer ${
                !newsView && !agentsView && !settingsOpen
                  ? "bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]"
                  : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:text-[var(--color-val-red)]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
          )}

          {/* News button (Desktop only) */}
          <button
            onClick={() => {
              sounds.playTabSwitch();
              onOpenNews();
            }}
            onMouseEnter={() => sounds.playHover()}
            title="Actualités"
            className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-all duration-300 border cursor-pointer ${
              newsView && !agentsView
                ? "bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]"
                : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:text-[var(--color-val-red)]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          </button>

          {/* Agents Wiki button (Desktop only) */}
          <button
            onClick={() => {
              sounds.playTabSwitch();
              onOpenAgents();
            }}
            onMouseEnter={() => sounds.playHover()}
            title="Wiki Agents"
            className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-all duration-300 border cursor-pointer ${
              agentsView
                ? "bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]"
                : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:text-[var(--color-val-red)]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>

          {/* LFG Lobbies button (Desktop only) */}
          {onOpenLobbies && (
            <button
              onClick={() => {
                sounds.playTabSwitch();
                onOpenLobbies();
              }}
              onMouseEnter={() => sounds.playHover()}
              title="Recherche de Salons / LFG"
              className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-all duration-300 border cursor-pointer ${
                lobbiesView
                  ? "bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]"
                  : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:text-[var(--color-val-red)]"
              }`}
            >
              <span className="text-sm">👥</span>
            </button>
          )}

          {/* Hotkeys modal button (Desktop only) */}
          {onOpenHotkeys && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenHotkeys();
              }}
              onMouseEnter={() => sounds.playHover()}
              title="Raccourcis Clavier (?)"
              className="hidden lg:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-all duration-300 border cursor-pointer bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:text-[var(--color-val-red)]"
            >
              <span className="text-xs font-mono font-black">⌨️</span>
            </button>
          )}
        </div>

        {/* Center: Search Bar — absolutely centered in the header */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 sm:px-6">
          <div ref={searchContainerRef} className="relative w-full max-w-sm sm:max-w-md pointer-events-auto">
            <form onSubmit={handleSubmit} className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher (Pseudo#Tag)"
                value={riotId}
                onChange={(e) => {
                  sounds.playTyping();
                  setRiotId(e.target.value);
                }}
                onKeyDown={() => sounds.playTyping()}
                onFocus={() => setIsFocused(true)}
                className={`w-full bg-[var(--color-text-primary)] text-[var(--color-background)] font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm outline-none transition-all duration-300 pr-16 ${
                  isFocused ? "shadow-[0_0_25px_rgba(255,255,255,0.3)] ring-2 ring-[var(--color-val-red)]" : ""
                }`}
                required
              />

              {/* Shortcut Badge */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none select-none">
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white bg-[#0f1923] border border-white/20 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  Ctrl K
                </kbd>
              </div>
            </form>

            {/* Smart Search Suggestions Dropdown */}
            {isFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-2">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                      <span>Recherches récentes</span>
                      <button
                        type="button"
                        onClick={clearAllRecent}
                        className="text-red-400 hover:underline cursor-pointer"
                      >
                        Effacer
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((query) => (
                        <div
                          key={query}
                          onMouseEnter={() => sounds.playHover()}
                          onClick={() => {
                            sounds.playClick();
                            setRiotId(query);
                            setIsFocused(false);
                            onSelectFavorite(query);
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--color-surface-hover)] cursor-pointer text-xs font-bold text-[var(--color-text-primary)] transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-secondary)]">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{query}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(query, e)}
                            className="text-[var(--color-text-secondary)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-xs cursor-pointer"
                            title="Retirer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Favorites Section */}
                {favorites.length > 0 && (
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                      Favoris rapides
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {favorites.slice(0, 4).map((fav) => (
                        <button
                          key={fav.riotId}
                          type="button"
                          onClick={() => {
                            setRiotId(fav.riotId);
                            setIsFocused(false);
                            onSelectFavorite(fav.riotId);
                          }}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--color-surface-hover)] cursor-pointer text-left transition-colors border border-transparent hover:border-[var(--color-border)]"
                        >
                          {fav.cardUrl ? (
                            <img referrerPolicy="no-referrer" src={fav.cardUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[var(--color-val-red)]/20 text-[var(--color-val-red)] flex items-center justify-center text-[10px] font-bold">
                              {fav.gameName[0]}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">{fav.gameName}</span>
                            <span className="text-[9px] text-[var(--color-text-secondary)]">#{fav.tagLine}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {recentSearches.length === 0 && favorites.length === 0 && (
                  <div className="p-4 text-center text-xs text-[var(--color-text-secondary)]">
                    Tapez un <strong className="text-[var(--color-text-primary)]">Pseudo#Tag</strong> et appuyez sur Entrée
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Clock, Notifications, Auth & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Clock (Desktop PC only) */}
          <LiveClock />

          {/* Notifications Dropdown */}
          <NotificationsDropdown
            onNavigateToNews={onOpenNews}
            onNavigateToAgents={onOpenAgents}
            playerStats={playerStats}
          />

          {/* Desktop Leaderboard Button */}
          {onOpenLeaderboard && (
            <button
              type="button"
              onClick={() => {
                sounds.playTabSwitch();
                onOpenLeaderboard();
              }}
              onMouseEnter={() => sounds.playHover()}
              title="Classement Régional Riot"
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border text-xs font-bold cursor-pointer ${
                leaderboardOpen
                  ? "bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]"
                  : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-white hover:text-[var(--color-val-red)]"
              }`}
            >
              <IconTrophy size={15} className="text-white" />
              <span className="hidden lg:inline text-white">Classement</span>
            </button>
          )}

          {session?.user && (
            <span className="text-xs text-[var(--color-text-secondary)] hidden md:block max-w-[120px] truncate">
              {(session.user as any).firstName || session.user.name || session.user.email}
            </span>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              signOut({ callbackUrl: "/login" });
            }}
            onMouseEnter={() => sounds.playHover()}
            className="hidden sm:flex bg-[var(--color-surface-hover)] hover:bg-[var(--color-val-red)] transition-colors text-[var(--color-text-primary)] hover:text-white font-bold px-3 py-1.5 rounded-full items-center text-xs gap-1.5 border border-[var(--color-border)] cursor-pointer"
            title="Déconnexion"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Déconnexion</span>
          </button>

          <button
            onClick={() => {
              sounds.playTabSwitch();
              onToggleSettings();
            }}
            onMouseEnter={() => sounds.playHover()}
            title="Paramètres"
            className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-colors items-center justify-center border cursor-pointer ${
              settingsOpen
                ? "bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]"
                : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-white hover:text-[var(--color-val-red)]"
            }`}
          >
            <IconSettings size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Enhanced Favorites Bar */}
      {favorites.length > 0 && !settingsOpen && (
        <div className="w-full px-4 sm:px-6 py-2 flex items-center gap-2 border-t border-[var(--color-border)]/50 bg-[var(--color-background)]/50 overflow-x-auto custom-scrollbar">
          <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold mr-1 flex-shrink-0 flex items-center gap-1">
            <span className="text-yellow-400">★</span> Favoris
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {favorites.map((fav) => (
              <div
                key={fav.riotId}
                onMouseEnter={() => sounds.playHover()}
                onClick={() => {
                  sounds.playClick();
                  onSelectFavorite(fav.riotId);
                }}
                className={`group flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 text-xs font-bold border flex-shrink-0 cursor-pointer ${
                  activeGameName === fav.gameName
                    ? "bg-[var(--color-val-red)]/15 border-[var(--color-val-red)]/50 text-[var(--color-val-red)] shadow-[0_0_12px_rgba(255,70,85,0.25)]"
                    : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {fav.cardUrl && <img referrerPolicy="no-referrer" src={fav.cardUrl} alt="" className="w-4 h-4 rounded-full object-cover" />}
                <span>{fav.gameName}</span>
                <span className="text-[var(--color-text-secondary)] opacity-50 text-[10px]">#{fav.tagLine}</span>

                {/* Quick Remove Button on Hover */}
                {onRemoveFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite({ gameName: fav.gameName, tagLine: fav.tagLine });
                    }}
                    className="w-3.5 h-3.5 rounded-full hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-1 text-[9px] cursor-pointer"
                    title="Retirer des favoris"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
