"use client";

import React from "react";
import { sounds } from "@/lib/soundEffects";
import { LobbyItem } from "@/app/api/lobbies/route";
import { IconMic, IconMicOff, IconPhoneOff, IconExpand, IconUsers } from "@/components/icons/SpyIcons";

interface FloatingVoiceBarProps {
  activeLobby: LobbyItem | null;
  isInVoice: boolean;
  isMicMuted: boolean;
  isSpeaking: boolean;
  voiceVolumeLevel?: number;
  onToggleMute: () => void;
  onOpenSalon: () => void;
  onLeaveVoice: () => void;
}

export default function FloatingVoiceBar({
  activeLobby,
  isInVoice,
  isMicMuted,
  isSpeaking,
  onToggleMute,
  onOpenSalon,
  onLeaveVoice,
}: FloatingVoiceBarProps) {
  if (!activeLobby || !isInVoice) return null;

  const count = activeLobby.voiceMembers?.length || 1;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom-6 fade-in duration-300">
      <div
        className={`glass-panel rounded-2xl p-2.5 sm:p-3 border transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex items-center gap-3 ${
          isSpeaking
            ? "border-emerald-400 ring-2 ring-emerald-400/60 shadow-[0_0_25px_rgba(52,211,153,0.5)] bg-[#0c141d]/95 animate-voice-speaking"
            : "border-white/15 bg-[#0b0e14]/95 hover:border-white/25"
        }`}
      >
        {/* Left icon with speaking halo */}
        <div
          className="relative cursor-pointer flex-shrink-0"
          onClick={onOpenSalon}
          title="Ouvrir le salon"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-150 ${
              isSpeaking
                ? "border-emerald-400 ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.9)] scale-105 bg-emerald-950/70 text-emerald-300 animate-voice-speaking"
                : "border-white/20 bg-white/5 text-white"
            }`}
          >
            <IconMic size={16} />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-ping"></span>
        </div>

        {/* Info */}
        <div className="cursor-pointer min-w-[110px] max-w-[160px] sm:max-w-[190px]" onClick={onOpenSalon}>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white truncate">{activeLobby.leaderName}</span>
            <span className="text-[8px] font-black uppercase text-[var(--color-val-red)] bg-[var(--color-val-red)]/15 px-1 rounded">
              {activeLobby.mode}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] font-bold ${isSpeaking ? "text-emerald-300" : isMicMuted ? "text-red-400" : "text-emerald-400"}`}>
              {isSpeaking ? "Vous parlez..." : isMicMuted ? "Micro coupé" : "En vocal"}
            </span>
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
              <span>•</span>
              <IconUsers size={10} className="text-sky-400 inline" />
              <span>{count}</span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            title={isMicMuted ? "Activer le micro" : "Couper le micro"}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isMicMuted
                ? "bg-red-500/20 border-red-500/40 text-red-300"
                : "bg-white/5 border-white/10 text-white hover:bg-white/15"
            }`}
          >
            {isMicMuted ? <IconMicOff size={14} className="text-red-400" /> : <IconMic size={14} />}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenSalon();
            }}
            title="Agrandir et ouvrir le salon"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <IconExpand size={13} />
          </button>

          {/* Bouton carré rouge pour raccrocher */}
          <button
            onClick={() => {
              sounds.playClick();
              onLeaveVoice();
            }}
            title="Raccrocher"
            className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <IconPhoneOff size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
