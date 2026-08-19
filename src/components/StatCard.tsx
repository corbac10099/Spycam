"use client";

import React from "react";
import Tooltip from "./Tooltip";

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
  warning?: string;
  suffix?: string;
  colSpan?: number;
  smartRating?: boolean;
  className?: string;
}

function StatCardComponent({
  label,
  value,
  sub,
  highlight,
  warning,
  suffix,
  colSpan,
  smartRating,
  className = "",
}: StatCardProps) {
  const hasWarning = !!(warning && smartRating);
  const ratingClass = hasWarning ? "border-[var(--color-val-red)]/40 bg-[var(--color-val-red)]/5" : "";

  return (
    <div
      className={`glass-panel p-2.5 xs:p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col justify-between border border-[var(--color-border)] hover:border-[var(--color-text-secondary)]/30 transition-all duration-300 min-w-0 shadow-sm ${
        colSpan ? `col-span-${colSpan}` : ""
      } ${ratingClass} ${className}`}
    >
      <div className="flex items-center justify-between text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1 sm:mb-1.5 min-w-0">
        <div className="flex items-center gap-1 truncate">
          <span className="truncate">{label}</span>
          {hasWarning && <Tooltip message={warning} />}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-lg xs:text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${
            highlight
              ? "text-[var(--color-val-red)] drop-shadow-[0_0_12px_rgba(255,70,85,0.3)]"
              : "text-[var(--color-text-primary)]"
          }`}
        >
          {value}
        </span>
        {suffix && <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-[var(--color-text-secondary)]">{suffix}</span>}
      </div>
      {sub && <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-[var(--color-text-secondary)] font-medium mt-0.5 truncate">{sub}</span>}
    </div>
  );
}

export default React.memo(StatCardComponent);
