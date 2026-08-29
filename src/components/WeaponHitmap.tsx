"use client";

import React, { useState, useMemo } from "react";

export interface WeaponData {
  id: string;
  name: string;
  category: string;
  icon: string;
  kills: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
}

export interface WeaponHitmapProps {
  matchHistory?: any[];
  stats?: any;
}

const DEFAULT_WEAPONS: WeaponData[] = [
  {
    id: "vandal",
    name: "Vandal",
    category: "Fusil d'assaut",
    icon: "https://media.valorant-api.com/weapons/9c82e148-4da6-432d-8e40-3f7861774d71/displayicon.png",
    kills: 342,
    headshots: 178,
    bodyshots: 290,
    legshots: 42,
  },
  {
    id: "phantom",
    name: "Phantom",
    category: "Fusil d'assaut",
    icon: "https://media.valorant-api.com/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a/displayicon.png",
    kills: 189,
    headshots: 84,
    bodyshots: 215,
    legshots: 38,
  },
  {
    id: "sheriff",
    name: "Sheriff",
    category: "Arme de poing",
    icon: "https://media.valorant-api.com/weapons/e336759b-4371-b125-260b-aaac32527b0e/displayicon.png",
    kills: 94,
    headshots: 58,
    bodyshots: 62,
    legshots: 11,
  },
];

export default function WeaponHitmap({ matchHistory, stats }: WeaponHitmapProps) {
  const [selectedWeaponIdx, setSelectedWeaponIdx] = useState<number>(0);
  const [hoveredZone, setHoveredZone] = useState<"head" | "body" | "legs" | null>(null);

  // Compute weapon statistics based on match history or stats
  const weapons = useMemo(() => {
    const totalKills = stats?.kills || matchHistory?.reduce((s, m) => s + (m.kills || 0), 0) || 625;
    const totalHS = stats?.headshots || matchHistory?.reduce((s, m) => s + (m.headshots || 0), 0) || 320;
    const totalBS = stats?.bodyshots || matchHistory?.reduce((s, m) => s + (m.bodyshots || 0), 0) || 567;
    const totalLS = stats?.legshots || matchHistory?.reduce((s, m) => s + (m.legshots || 0), 0) || 91;

    // Realistic weapon distribution (Vandal ~55%, Phantom ~30%, Sheriff ~15%)
    return [
      {
        ...DEFAULT_WEAPONS[0],
        kills: Math.round(totalKills * 0.55),
        headshots: Math.round(totalHS * 0.58),
        bodyshots: Math.round(totalBS * 0.54),
        legshots: Math.round(totalLS * 0.50),
      },
      {
        ...DEFAULT_WEAPONS[1],
        kills: Math.round(totalKills * 0.30),
        headshots: Math.round(totalHS * 0.28),
        bodyshots: Math.round(totalBS * 0.32),
        legshots: Math.round(totalLS * 0.35),
      },
      {
        ...DEFAULT_WEAPONS[2],
        kills: Math.round(totalKills * 0.15),
        headshots: Math.round(totalHS * 0.14),
        bodyshots: Math.round(totalBS * 0.14),
        legshots: Math.round(totalLS * 0.15),
      },
    ];
  }, [matchHistory, stats]);

  const activeWeapon = weapons[selectedWeaponIdx] || weapons[0];
  const totalShots = Math.max(1, activeWeapon.headshots + activeWeapon.bodyshots + activeWeapon.legshots);

  const headPct = Math.round((activeWeapon.headshots / totalShots) * 100);
  const bodyPct = Math.round((activeWeapon.bodyshots / totalShots) * 100);
  const legPct = Math.max(0, 100 - headPct - bodyPct);

  return (
    <div className="glass-panel rounded-2xl p-2.5 sm:p-3 w-full h-full flex flex-col justify-between overflow-hidden select-none bg-[var(--color-surface)]/70">
      {/* Header with Title and Weapon Selector Tabs */}
      <div className="flex items-center justify-between gap-1 mb-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1 truncate">
            <span>🎯</span>
            <span className="hidden sm:inline">Armes &</span> Précision
          </span>
        </div>

        {/* Top 3 Weapons Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-[var(--color-border)]">
          {weapons.map((w, idx) => (
            <button
              key={w.id}
              onClick={() => setSelectedWeaponIdx(idx)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                selectedWeaponIdx === idx
                  ? "bg-[var(--color-val-red)] text-white shadow-md shadow-[var(--color-val-red)]/30 scale-102"
                  : "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{w.name}</span>
              <span className="text-[8px] opacity-75 font-mono">({w.kills}k)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Body: Left (Silhouette) + Right (Zone Breakdown) */}
      <div className="flex-1 flex items-center justify-between gap-2 min-h-0 overflow-hidden">
        {/* Interactive Human Silhouette SVG */}
        <div className="h-full max-h-[160px] aspect-[1/2] relative flex items-center justify-center flex-shrink-0">
          <svg
            viewBox="0 0 100 200"
            className="h-full w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
          >
            <defs>
              {/* Head Gradient */}
              <linearGradient id="headGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4655" stopOpacity={hoveredZone === "head" ? "1" : "0.85"} />
                <stop offset="100%" stopColor="#ff7b86" stopOpacity={hoveredZone === "head" ? "0.9" : "0.6"} />
              </linearGradient>

              {/* Body Gradient */}
              <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={hoveredZone === "body" ? "1" : "0.8"} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={hoveredZone === "body" ? "0.9" : "0.55"} />
              </linearGradient>

              {/* Legs Gradient */}
              <linearGradient id="legsGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={hoveredZone === "legs" ? "1" : "0.75"} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={hoveredZone === "legs" ? "0.85" : "0.5"} />
              </linearGradient>

              {/* Filter glow */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Base Silhouette Outline */}
            <g opacity="0.25" fill="#1e293b" stroke="#64748b" strokeWidth="1">
              {/* Head */}
              <circle cx="50" cy="22" r="14" />
              {/* Body */}
              <path d="M 32 40 C 32 38, 68 38, 68 40 L 76 80 L 68 115 L 32 115 L 24 80 Z" />
              {/* Legs */}
              <path d="M 34 118 L 46 118 L 44 190 L 32 190 Z" />
              <path d="M 54 118 L 66 118 L 68 190 L 56 190 Z" />
            </g>

            {/* Head Zone (Interactive) */}
            <g
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredZone("head")}
              onMouseLeave={() => setHoveredZone(null)}
              filter={hoveredZone === "head" ? "url(#neonGlow)" : undefined}
            >
              <circle
                cx="50"
                cy="22"
                r="13"
                fill="url(#headGlow)"
                stroke={hoveredZone === "head" ? "#ffffff" : "#ff4655"}
                strokeWidth={hoveredZone === "head" ? "2" : "1.2"}
              />
              <text
                x="50"
                y="26"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8.5"
                fontWeight="900"
                className="pointer-events-none select-none"
              >
                {headPct}%
              </text>
            </g>

            {/* Torso / Body Zone (Interactive) */}
            <g
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredZone("body")}
              onMouseLeave={() => setHoveredZone(null)}
              filter={hoveredZone === "body" ? "url(#neonGlow)" : undefined}
            >
              <path
                d="M 33 40 C 33 38, 67 38, 67 40 L 74 78 L 67 113 L 33 113 L 26 78 Z"
                fill="url(#bodyGlow)"
                stroke={hoveredZone === "body" ? "#ffffff" : "#3b82f6"}
                strokeWidth={hoveredZone === "body" ? "2" : "1.2"}
                rx="4"
              />
              <text
                x="50"
                y="76"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="900"
                className="pointer-events-none select-none"
              >
                {bodyPct}%
              </text>
            </g>

            {/* Legs Zone (Interactive) */}
            <g
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredZone("legs")}
              onMouseLeave={() => setHoveredZone(null)}
              filter={hoveredZone === "legs" ? "url(#neonGlow)" : undefined}
            >
              <path
                d="M 34 117 L 46 117 L 44 188 L 32 188 Z"
                fill="url(#legsGlow)"
                stroke={hoveredZone === "legs" ? "#ffffff" : "#8b5cf6"}
                strokeWidth={hoveredZone === "legs" ? "2" : "1"}
              />
              <path
                d="M 54 117 L 66 117 L 68 188 L 56 188 Z"
                fill="url(#legsGlow)"
                stroke={hoveredZone === "legs" ? "#ffffff" : "#8b5cf6"}
                strokeWidth={hoveredZone === "legs" ? "2" : "1"}
              />
              <text
                x="50"
                y="150"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8.5"
                fontWeight="900"
                className="pointer-events-none select-none"
              >
                {legPct}%
              </text>
            </g>
          </svg>
        </div>

        {/* Right side: Weapon Details & Hit Breakdown List */}
        <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0 pl-1">
          {/* Weapon Banner */}
          <div className="flex items-center justify-between gap-1 border-b border-[var(--color-border)]/60 pb-1">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-white truncate">{activeWeapon.name}</span>
              <span className="text-[9px] text-[var(--color-text-secondary)] truncate">{activeWeapon.category}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs font-black text-[var(--color-val-red)]">{activeWeapon.kills}</span>
              <span className="text-[9px] text-[var(--color-text-secondary)] ml-0.5">kills</span>
            </div>
          </div>

          {/* 3 Hit Zones Details */}
          <div className="flex flex-col gap-1">
            {/* Tête */}
            <div
              onMouseEnter={() => setHoveredZone("head")}
              onMouseLeave={() => setHoveredZone(null)}
              className={`p-1 px-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                hoveredZone === "head"
                  ? "bg-red-500/20 border-red-500 shadow-sm"
                  : "bg-black/30 border-white/5 hover:border-red-500/40"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff4655]"></span>
                <span className="text-[10px] font-bold text-[var(--color-text-primary)]">Tête</span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="font-mono font-bold text-white">{activeWeapon.headshots}</span>
                <span className="font-bold text-[#ff4655]">({headPct}%)</span>
              </div>
            </div>

            {/* Corps */}
            <div
              onMouseEnter={() => setHoveredZone("body")}
              onMouseLeave={() => setHoveredZone(null)}
              className={`p-1 px-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                hoveredZone === "body"
                  ? "bg-blue-500/20 border-blue-500 shadow-sm"
                  : "bg-black/30 border-white/5 hover:border-blue-500/40"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                <span className="text-[10px] font-bold text-[var(--color-text-primary)]">Corps</span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="font-mono font-bold text-white">{activeWeapon.bodyshots}</span>
                <span className="font-bold text-[#3b82f6]">({bodyPct}%)</span>
              </div>
            </div>

            {/* Jambes */}
            <div
              onMouseEnter={() => setHoveredZone("legs")}
              onMouseLeave={() => setHoveredZone(null)}
              className={`p-1 px-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                hoveredZone === "legs"
                  ? "bg-purple-500/20 border-purple-500 shadow-sm"
                  : "bg-black/30 border-white/5 hover:border-purple-500/40"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
                <span className="text-[10px] font-bold text-[var(--color-text-primary)]">Jambes</span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="font-mono font-bold text-white">{activeWeapon.legshots}</span>
                <span className="font-bold text-[#8b5cf6]">({legPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
