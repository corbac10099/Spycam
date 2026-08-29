"use client";

import { useState, useEffect } from "react";

export default function LiveClock() {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !time) {
    return (
      <span className="text-xs font-mono text-white/50 px-2 py-1 opacity-0 select-none">
        00:00:00
      </span>
    );
  }

  return (
    <span
      title="Heure locale"
      className="flex items-center gap-1.5 px-2.5 py-1 select-none cursor-default"
    >
      {/* Blinking Live Indicator */}
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-val-red)] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-val-red)]"></span>
      </span>

      {/* Digital Time */}
      <span className="font-mono text-[11px] font-bold text-white/80 tracking-wider">
        {time}
      </span>
    </span>
  );
}
