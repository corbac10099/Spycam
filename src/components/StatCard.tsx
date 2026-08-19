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
}: StatCardProps) {
  const hasWarning = !!(warning && smartRating);
  const ratingClass = hasWarning ? "border-[var(--color-val-red)]/40 bg-[var(--color-val-red)]/5" : "";

  return (
    <div
      className={`glass-panel p-4 sm:p-5 rounded-2xl flex flex-col justify-between border border-[var(--color-border)] hover:border-[var(--color-text-secondary)]/30 transition-all duration-300 ${
        colSpan ? `col-span-${colSpan}` : ""
      } ${ratingClass}`}
    >
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">
        <div className="flex items-center">
          <span>{label}</span>
          {hasWarning && <Tooltip message={warning} />}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-2xl sm:text-3xl font-black tracking-tight ${
            highlight
              ? "text-[var(--color-val-red)] drop-shadow-[0_0_15px_rgba(255,70,85,0.3)]"
              : "text-[var(--color-text-primary)]"
          }`}
        >
          {value}
        </span>
        {suffix && <span className="text-sm font-bold text-[var(--color-text-secondary)]">{suffix}</span>}
      </div>
      {sub && <span className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-1">{sub}</span>}
    </div>
  );
}

export default React.memo(StatCardComponent);
