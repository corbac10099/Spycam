"use client";

import React, { useState, useEffect } from "react";
import { IconTrophy, IconSearch, IconCrown, IconTarget, IconUsers, IconEye } from "./icons/SpyIcons";
import { LeaderboardPlayerEntry } from "@/lib/valorant/types";
import { getPlayerAvatar } from "./LobbiesView";
import { sounds } from "@/lib/soundEffects";

export interface LeaderboardViewProps {
  onSelectPlayer?: (riotId: string) => void;
}

const REGIONS = [
  { id: "eu", label: "Europe (EU)", flag: "🇪🇺" },
  { id: "na", label: "North America (NA)", flag: "🇺🇸" },
  { id: "ap", label: "Asia Pacific (AP)", flag: "🌏" },
  { id: "kr", label: "Korea (KR)", flag: "🇰🇷" },
];

export default function LeaderboardViewComponent({ onSelectPlayer }: LeaderboardViewProps) {
  const [region, setRegion] = useState<string>("eu");
  const [search, setSearch] = useState<string>("");
  const [players, setPlayers] = useState<LeaderboardPlayerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/valorant/leaderboard?region=${region}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.players)) {
          setPlayers(data.players);
        } else {
          setPlayers([]);
        }
      })
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, [region]);

  const filteredPlayers = players.filter((p) =>
    (p.gameName || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.tagLine || "").toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filteredPlayers.slice(0, 3);
  const remaining = filteredPlayers.slice(3);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#121c26]/90 via-[#0a0e14]/95 to-[#1a1018]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--color-val-red)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <IconTrophy size={14} className="text-amber-400" />
              <span>Classement Compétitif Officiel</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Leaderboard Valorant <span className="text-[var(--color-val-red)]">Régional</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl">
              Consultez en temps réel les meilleurs joueurs Radiant et Immortal de chaque région officielle Riot Games.
            </p>
          </div>

          {/* Region Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md self-start md:self-auto">
            {REGIONS.map((r) => {
              const isActive = region === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    sounds.playTabSwitch();
                    setRegion(r.id);
                  }}
                  onMouseEnter={() => sounds.playHover()}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? "bg-[var(--color-val-red)] text-white shadow-[0_0_15px_rgba(255,70,85,0.5)]"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.07]"
                  }`}
                >
                  <span>{r.flag}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top 3 Podium (when available) */}
      {!loading && top3.length >= 3 && !search && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end pt-4">
          {/* #2 Silver (Left) */}
          <div className="order-2 md:order-1 rounded-3xl p-5 border border-slate-400/30 bg-gradient-to-b from-slate-800/40 to-black/60 backdrop-blur-xl space-y-4 shadow-xl hover:border-slate-300/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-slate-300 text-black font-black text-sm flex items-center justify-center shadow-lg">
                #2
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Argent</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={getPlayerAvatar(top3[1].gameName)}
                alt={top3[1].gameName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-300 shadow-md"
              />
              <div className="min-w-0">
                <div className="text-base font-black text-white truncate">{top3[1].gameName}</div>
                <div className="text-xs text-slate-400">#{top3[1].tagLine}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <span className="text-amber-400 font-bold">{top3[1].rankedRating} RR</span>
              <span className="text-slate-300 font-bold">{top3[1].numberOfWins} Victoires</span>
            </div>
            {onSelectPlayer && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectPlayer(`${top3[1].gameName}#${top3[1].tagLine}`);
                }}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <IconEye size={13} />
                <span>Voir Profil</span>
              </button>
            )}
          </div>

          {/* #1 Gold Champion (Center, Elevated) */}
          <div className="order-1 md:order-2 rounded-3xl p-6 border-2 border-amber-400/50 bg-gradient-to-b from-amber-500/20 via-[#1a1408]/80 to-black/80 backdrop-blur-xl space-y-4 shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:border-amber-300 transition-all md:-translate-y-3">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-black font-black text-base flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse">
                👑 #1
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                Champion Régional
              </span>
            </div>
            <div className="flex items-center gap-3.5">
              <img
                src={getPlayerAvatar(top3[0].gameName)}
                alt={top3[0].gameName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
              />
              <div className="min-w-0">
                <div className="text-lg font-black text-white truncate">{top3[0].gameName}</div>
                <div className="text-xs text-amber-300 font-bold">#{top3[0].tagLine}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-amber-500/20 font-black">
              <span className="text-amber-300">{top3[0].rankedRating} RR</span>
              <span className="text-white">{top3[0].numberOfWins} Victoires</span>
            </div>
            {onSelectPlayer && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectPlayer(`${top3[0].gameName}#${top3[0].tagLine}`);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5"
              >
                <IconEye size={14} />
                <span>Voir Profil Leader</span>
              </button>
            )}
          </div>

          {/* #3 Bronze (Right) */}
          <div className="order-3 rounded-3xl p-5 border border-amber-700/30 bg-gradient-to-b from-amber-900/30 to-black/60 backdrop-blur-xl space-y-4 shadow-xl hover:border-amber-600/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-lg">
                #3
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Bronze</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={getPlayerAvatar(top3[2].gameName)}
                alt={top3[2].gameName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-600/60 shadow-md"
              />
              <div className="min-w-0">
                <div className="text-base font-black text-white truncate">{top3[2].gameName}</div>
                <div className="text-xs text-amber-500/80">#{top3[2].tagLine}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <span className="text-amber-400 font-bold">{top3[2].rankedRating} RR</span>
              <span className="text-amber-200/80 font-bold">{top3[2].numberOfWins} Victoires</span>
            </div>
            {onSelectPlayer && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectPlayer(`${top3[2].gameName}#${top3[2].tagLine}`);
                }}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <IconEye size={13} />
                <span>Voir Profil</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Leaderboard Table Section */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 sm:p-6 space-y-4 shadow-xl">
        {/* Search Filter Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <IconTarget size={18} className="text-[var(--color-val-red)]" />
            <span className="text-sm font-black text-white uppercase tracking-wider">
              Joueurs Classés ({filteredPlayers.length})
            </span>
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer par pseudo ou #tag..."
              className="w-full px-4 py-2 pl-9 rounded-xl bg-[var(--color-surface)] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-val-red)] transition-colors"
            />
            <span className="absolute left-3 top-2.5 text-gray-500">
              <IconSearch size={14} />
            </span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-10 h-10 border-2 border-[var(--color-val-red)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Récupération du classement officiel Riot...
            </p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-gray-500">
            <IconUsers size={32} className="mx-auto opacity-50" />
            <p className="text-xs">Aucun joueur ne correspond à votre recherche pour cette région.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                  <th className="py-3 px-4">Rang</th>
                  <th className="py-3 px-4">Joueur</th>
                  <th className="py-3 px-4">Rang Actuel</th>
                  <th className="py-3 px-4 text-right">Points RR</th>
                  <th className="py-3 px-4 text-right">Victoires</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPlayers.map((player) => {
                  const isTop1 = player.leaderboardRank === 1;
                  const isTop2 = player.leaderboardRank === 2;
                  const isTop3 = player.leaderboardRank === 3;

                  return (
                    <tr
                      key={player.puuid || `${player.gameName}_${player.tagLine}_${player.leaderboardRank}`}
                      className="hover:bg-white/[0.04] transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center justify-center font-black text-xs px-2.5 py-1 rounded-lg ${
                            isTop1
                              ? "bg-amber-400 text-black shadow-md shadow-amber-400/40"
                              : isTop2
                              ? "bg-slate-300 text-black"
                              : isTop3
                              ? "bg-amber-700 text-white"
                              : "bg-white/5 text-white/80 border border-white/10"
                          }`}
                        >
                          #{player.leaderboardRank}
                        </span>
                      </td>

                      {/* Player Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPlayerAvatar(player.gameName)}
                            alt={player.gameName}
                            className="w-8 h-8 rounded-xl object-cover border border-white/15 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-white truncate block">
                              {player.gameName}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">
                              #{player.tagLine}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {player.tierIcon && (
                            <img src={player.tierIcon} alt={player.tierName} className="w-5 h-5 object-contain" />
                          )}
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                            {player.tierName || "Radiant"}
                          </span>
                        </div>
                      </td>

                      {/* RR */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-xs sm:text-sm text-amber-400">
                          {player.rankedRating} <span className="text-[9px] text-amber-400/70">RR</span>
                        </span>
                      </td>

                      {/* Wins */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-xs text-white/90">
                          {player.numberOfWins}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        {onSelectPlayer && (
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              onSelectPlayer(`${player.gameName}#${player.tagLine}`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[var(--color-val-red)] hover:text-white text-gray-300 border border-white/10 hover:border-transparent transition-all text-xs font-bold cursor-pointer"
                          >
                            Analyser
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
