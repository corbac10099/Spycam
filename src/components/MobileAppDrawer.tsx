"use client";

import React from "react";
import {
  IconAppGrid,
  IconSettings,
  IconTrophy,
  IconExpand,
} from "./icons/SpyIcons";
import { sounds } from "@/lib/soundEffects";

export interface MobileAppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  onToggleFullscreen: () => void;
}

export default function MobileAppDrawer({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenLeaderboard,
  onToggleFullscreen,
}: MobileAppDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full bg-[var(--color-surface)]/95 backdrop-blur-2xl border-t border-[var(--color-border)] rounded-t-3xl p-5 shadow-[0_-15px_50px_rgba(0,0,0,0.8)] flex flex-col gap-4 animate-in slide-in-from-bottom duration-200 max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-10 h-1 rounded-full bg-[var(--color-border)] mx-auto -mt-2 mb-1" />

        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <IconAppGrid size={18} className="text-[var(--color-val-red)]" />
            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">
              Outils & Menu
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer border border-[var(--color-border)]"
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
              sounds.playTabSwitch();
              onClose();
              onOpenSettings();
            }}
            className="p-3.5 rounded-2xl bg-[var(--color-surface-hover)] hover:border-[var(--color-val-red)]/40 border border-[var(--color-border)] flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <IconSettings size={18} />
            </div>
            <span className="text-xs font-bold text-[var(--color-text-primary)]">Paramètres</span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">Profil, Thèmes & Sons</span>
          </button>

          {/* Leaderboard */}
          <button
            type="button"
            onClick={() => {
              sounds.playTabSwitch();
              onClose();
              onOpenLeaderboard();
            }}
            className="p-3.5 rounded-2xl bg-[var(--color-surface-hover)] hover:border-[var(--color-val-red)]/40 border border-[var(--color-border)] flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <IconTrophy size={18} />
            </div>
            <span className="text-xs font-bold text-[var(--color-text-primary)]">Classement</span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">Top Radiants Région</span>
          </button>
        </div>

        {/* Fullscreen Option */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
            onToggleFullscreen();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-[var(--color-surface-hover)] hover:border-[var(--color-val-red)]/40 border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <IconExpand size={16} />
          <span>Plein Écran</span>
        </button>
      </div>
    </div>
  );
}
