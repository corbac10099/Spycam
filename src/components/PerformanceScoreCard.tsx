"use client";

import React from "react";
import { PerformanceScoreResult } from "@/lib/valorant/performanceScore";

interface PerformanceScoreCardProps {
  result: PerformanceScoreResult;
  onClickDetail?: () => void;
  isPublic?: boolean;
  isOwner?: boolean;
  compact?: boolean;
}

export default function PerformanceScoreCard({
  result,
  onClickDetail,
  isPublic = true,
  isOwner = false,
  compact = false,
}: PerformanceScoreCardProps) {
  const { totalScore, grade, gradeColor, gradeBg, gradeBorder, gradeGlow, gradeTitle, dominantRole } = result;

  // Si le score est masqué par l'utilisateur et que le viewer n'est pas le propriétaire
  if (!isPublic && !isOwner) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0a0e13]/80 border border-white/10 text-center ${
          compact ? "py-1.5 px-2.5" : "p-4"
        }`}
      >
        <span className="text-base mb-1">🔒</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Score SPI Masqué
        </span>
        <span className="text-[9px] text-gray-500">Par le joueur</span>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClickDetail}
        title="Voir le bilan complet de votre Score de Performance (SPI)"
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all hover:scale-105 cursor-pointer backdrop-blur-md shadow-lg"
        style={{
          backgroundColor: gradeBg,
          borderColor: gradeBorder,
          boxShadow: gradeGlow,
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm tracking-tighter"
          style={{ color: gradeColor, backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          {grade}
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-300">
            SPI {!isPublic && isOwner ? "• 🔒" : ""}
          </span>
          <span className="text-xs sm:text-sm font-black text-white">
            {totalScore} <span className="text-[9px] font-normal text-gray-300">pts</span>
          </span>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onClickDetail}
      className="w-full h-full p-4 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
      style={{
        boxShadow: `inset 0 0 20px ${gradeBg}`,
      }}
    >
      {/* BACKGROUND ACCENT */}
      <div
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 pointer-events-none blur-xl"
        style={{ backgroundColor: gradeColor }}
      />

      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: gradeColor }} />
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
            Score SPI • {dominantRole}
          </span>
        </div>

        {!isPublic && isOwner && (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            🔒 Privé
          </span>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex items-center justify-between my-2">
        <div>
          <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
            {totalScore}
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">/ 1000</span>
          </div>
          <span
            className="text-[11px] font-black uppercase tracking-wider"
            style={{ color: gradeColor }}
          >
            Grade {grade} • {gradeTitle}
          </span>
        </div>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl tracking-tighter border shadow-lg group-hover:scale-110 transition-transform"
          style={{
            color: gradeColor,
            backgroundColor: gradeBg,
            borderColor: gradeBorder,
            boxShadow: gradeGlow,
          }}
        >
          {grade}
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
        <span>Cliquer pour le détail</span>
        <span className="group-hover:translate-x-1 transition-transform">➔</span>
      </div>
    </div>
  );
}
