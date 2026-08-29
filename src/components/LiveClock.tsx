"use client";

import { useState, useEffect } from "react";

export default function LiveClock() {
  const [time, setTime] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
      };
      setDateStr(now.toLocaleDateString("fr-FR", options).toUpperCase());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !time) {
    return (
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] opacity-0">
        <span className="text-xs font-mono">00:00:00</span>
      </div>
    );
  }

  return (
    <div
      title={`Date : ${dateStr}`}
      className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--color-surface)]/80 hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-val-red)]/40 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.3)] backdrop-blur-md group select-none cursor-default"
    >
      {/* Blinking Live Indicator */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-val-red)] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-val-red)]"></span>
      </span>

      {/* Digital Time Display */}
      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--color-text-primary)] tracking-wider">
        <span className="text-[var(--color-text-primary)] group-hover:text-white transition-colors">
          {time}
        </span>
      </div>

      {/* Date Pill Tag */}
      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
        {dateStr}
      </span>
    </div>
  );
}
