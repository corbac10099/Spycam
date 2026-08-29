"use client";

import React from "react";
import { sounds } from "@/lib/soundEffects";
import { LobbyItem } from "@/app/api/lobbies/route";

interface FloatingVoiceBarProps {
  activeLobby: LobbyItem | null;
  isInVoice: boolean;
  isMicMuted: boolean;
  isSpeaking: boolean;
  voiceVolumeLevel: number;
  onToggleMute: () => void;
  onOpenSalon: () => void;
  onLeaveVoice: () => void;
}

export default function FloatingVoiceBar({
  activeLobby,
  isInVoice,
  isMicMuted,
  isSpeaking,
  voiceVolumeLevel,
  onToggleMute,
  onOpenSalon,
  onLeaveVoice,
}: FloatingVoiceBarProps) {
  if (!activeLobby || !isInVoice) return null;

  const count = activeLobby.voiceMembers?.length || 1;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`glass-panel rounded-2xl p-3 sm:p-3.5 border transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex items-center gap-3 sm:gap-4 ${
          isSpeaking
            ? "border-emerald-400 ring-2 ring-emerald-400/60 shadow-[0_0_25px_rgba(52,211,153,0.5)] bg-[#0d1a18]/90"
            : "border-[var(--color-val-red)]/40 bg-[#0f1923]/95"
        }`}
      >
        {/* Left icon with pulse */}
        <div className="relative cursor-pointer" onClick={onOpenSalon} title="Ouvrir le salon">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
              isSpeaking
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50 animate-pulse"
                : "bg-[var(--color-val-red)]/20 border-[var(--color-val-red)]/40 text-[var(--color-val-red)]"
            }`}
          >
            🎙️
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black animate-ping"></span>
        </div>

        {/* Salon details info */}
        <div className="cursor-pointer min-w-[120px] max-w-[170px] sm:max-w-[200px]" onClick={onOpenSalon}>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white truncate">{activeLobby.leaderName}</span>
            <span className="text-[9px] font-black uppercase text-[var(--color-val-red)] bg-[var(--color-val-red)]/15 px-1 rounded">
              {activeLobby.mode}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-bold ${isSpeaking ? "text-emerald-300" : "text-emerald-400"}`}>
              {isSpeaking ? "🔊 Vous parlez..." : isMicMuted ? "🔇 Micro coupé" : "🟢 Micro actif"}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">
              • 👥 {count}
            </span>
          </div>
        </div>

        {/* Mini audio visualizer */}
        <div className="hidden sm:flex items-center gap-1 h-5 px-2 bg-black/40 rounded-lg">
          {[25, 75, 40, 90, 60, 100, 45].map((h, i) => (
            <div
              key={i}
              style={{
                height: isMicMuted ? "3px" : `${Math.max(4, Math.min(100, h * (isSpeaking ? Math.max(0.6, voiceVolumeLevel * 2.5) : 0.2)))}%`,
              }}
              className={`w-1 rounded-full transition-all duration-100 ${
                isSpeaking ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-gray-600"
              }`}
            ></div>
          ))}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            title={isMicMuted ? "Activer le micro" : "Couper le micro"}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isMicMuted
                ? "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
                : "bg-white/5 border-white/10 text-white hover:bg-white/15"
            }`}
          >
            {isMicMuted ? "🔇" : "🎙️"}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenSalon();
            }}
            title="Agrandir et ouvrir le salon"
            className="px-2.5 py-1.5 rounded-xl bg-[var(--color-val-red)]/15 hover:bg-[var(--color-val-red)] border border-[var(--color-val-red)]/30 hover:border-[var(--color-val-red)] text-white text-xs font-bold transition-all cursor-pointer hidden sm:flex items-center gap-1"
          >
            <span>Salon</span>
            <span>↗</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onLeaveVoice();
            }}
            title="Raccrocher et quitter le vocal"
            className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            🔴
          </button>
        </div>
      </div>
    </div>
  );
}
