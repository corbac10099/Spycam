"use client";

import React, { useRef, useState } from "react";
import { IconCrosshair, IconShield, IconTrophy } from "./icons/SpyIcons";

export interface PlayerCardModalProps {
  playerData: any;
  onClose: () => void;
}

export default function PlayerCardModal({ playerData, onClose }: PlayerCardModalProps) {
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const player = playerData?.player || {};
  const stats = playerData?.stats || {};
  const rank = playerData?.rank || "Non classé";
  const mainAgent = playerData?.mainAgent || {};

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Use standard HTML5 canvas drawing for 100% reliable export
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark Valorant Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
      bgGrad.addColorStop(0, "#0f1923");
      bgGrad.addColorStop(1, "#070b10");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 800);

      // Red Accent Bar
      ctx.fillStyle = "#ff4655";
      ctx.fillRect(0, 0, 600, 8);

      // Spycam Watermark
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("SPYCAM // TRACKER", 40, 50);

      // Player Name & Tag
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px sans-serif";
      ctx.fillText(player.gameName || "Player", 40, 110);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`#${player.tagLine || "EU1"}`, 40, 140);

      // Rank Text
      ctx.fillStyle = "#ff4655";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(rank, 40, 200);

      // Key Metrics Box
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(40, 240, 520, 220);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeRect(40, 240, 520, 220);

      // Stats inside Box
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px monospace";
      ctx.fillText(`${stats.kdRatio || 0}`, 70, 310);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("RATIO K/D", 70, 335);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px monospace";
      ctx.fillText(`${stats.headshotPct || 0}%`, 250, 310);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("HEADSHOT %", 250, 335);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px monospace";
      ctx.fillText(`${stats.winRate || 0}%`, 430, 310);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("WIN RATE", 430, 335);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px monospace";
      ctx.fillText(`${stats.acs || 0}`, 70, 400);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("ACS MOYEN", 70, 425);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px monospace";
      ctx.fillText(`${stats.kills || 0}`, 250, 400);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("KILLS", 250, 425);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px monospace";
      ctx.fillText(`${mainAgent.name || "Clove"}`, 430, 400);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("AGENT PRINCIPAL", 430, 425);

      // Bottom Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "14px monospace";
      ctx.fillText("Généré sur Spycam // Performance Analytics", 40, 750);

      // Export Download
      const link = document.createElement("a");
      link.download = `spycam-${player.gameName || "player"}-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.warn("Erreur export carte:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-md bg-[#0c141d] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col gap-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <IconTrophy size={18} className="text-[var(--color-val-red)]" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Carte Joueur Exportable</h3>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        {/* Live Preview Card */}
        <div ref={cardRef} className="p-5 rounded-2xl bg-gradient-to-b from-[#141e2b] to-[#0a1017] border border-white/10 relative overflow-hidden flex flex-col gap-4 shadow-xl select-none">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-val-red)]">SPYCAM // CARD</span>
              <h2 className="text-xl font-black text-white">{player.gameName || "Player"} <span className="text-gray-400 text-sm font-bold font-mono">#{player.tagLine || "EU1"}</span></h2>
              <span className="text-xs font-bold text-emerald-400">{rank}</span>
            </div>
            {playerData?.rankUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={playerData.rankUrl} alt={rank} className="w-12 h-12 object-contain drop-shadow-md" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/40 border border-white/5 text-center">
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">K/D</span>
              <span className="text-base font-black text-white font-mono">{stats.kdRatio || "0.00"}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">HS %</span>
              <span className="text-base font-black text-[var(--color-val-red)] font-mono">{stats.headshotPct || 0}%</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Win Rate</span>
              <span className="text-base font-black text-emerald-400 font-mono">{stats.winRate || 0}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
            <span>Agent : <strong className="text-white">{mainAgent.name || "Clove"}</strong></span>
            <span>ACS : <strong className="text-white">{stats.acs || 0}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">
            Fermer
          </button>
          <button type="button" onClick={handleDownload} disabled={downloading} className="flex-1 py-2.5 rounded-xl bg-[var(--color-val-red)] hover:bg-[#ff5865] text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,70,85,0.4)] flex items-center justify-center gap-1.5 cursor-pointer">
            <IconCrosshair size={14} />
            <span>{downloading ? "Export..." : "Télécharger PNG"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
