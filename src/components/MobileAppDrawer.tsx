"use client";

import React from "react";
import {
  IconAppGrid,
  IconSettings,
  IconTrophy,
  IconShare,
  IconEye,
  IconExpand,
  IconVolume,
} from "./icons/SpyIcons";

export interface MobileAppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  onOpenCardExport: () => void;
  streamerMode: boolean;
  onToggleStreamerMode: () => void;
  onToggleFullscreen: () => void;
}

export default function MobileAppDrawer({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenLeaderboard,
  onOpenCardExport,
  streamerMode,
  onToggleStreamerMode,
  onToggleFullscreen,
}: MobileAppDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#0c141d] border-t border-white/15 rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-200 max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-2 mb-1" />

        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <IconAppGrid size={18} className="text-[var(--color-val-red)]" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Outils & Menu
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 text-gray-300 flex items-center justify-center font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/5 text-sky-400">
              <IconSettings size={18} />
            </div>
            <span className="text-xs font-bold text-white">Paramètres</span>
            <span className="text-[10px] text-gray-400">Profil & Thèmes</span>
          </button>

          {/* Leaderboard */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLeaderboard();
            }}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/5 text-amber-400">
              <IconTrophy size={18} />
            </div>
            <span className="text-xs font-bold text-white">Classement</span>
            <span className="text-[10px] text-gray-400">Top Radiants</span>
          </button>

          {/* Export Player Card */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCardExport();
            }}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/5 text-emerald-400">
              <IconShare size={18} />
            </div>
            <span className="text-xs font-bold text-white">Exporter Carte</span>
            <span className="text-[10px] text-gray-400">Image PNG</span>
          </button>

          {/* Streamer Mode */}
          <button
            type="button"
            onClick={() => {
              onToggleStreamerMode();
            }}
            className={`p-3 rounded-2xl border flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer ${
              streamerMode
                ? "bg-[var(--color-val-red)]/15 border-[var(--color-val-red)] text-white"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
            }`}
          >
            <div className={`p-2 rounded-xl ${streamerMode ? "bg-[var(--color-val-red)] text-white" : "bg-white/5 text-purple-400"}`}>
              <IconEye size={18} />
            </div>
            <span className="text-xs font-bold text-white">Mode Streamer</span>
            <span className="text-[10px] text-gray-400">
              {streamerMode ? "Actif (Pseudo masqué)" : "Inactif"}
            </span>
          </button>
        </div>

        {/* Fullscreen Option */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onToggleFullscreen();
          }}
          className="w-full py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <IconExpand size={16} />
          <span>Mode Plein Écran Kiosque</span>
        </button>
      </div>
    </div>
  );
}
