"use client";

import React, { useState, useMemo, useRef } from "react";

export interface PerformanceChartsProps {
  matchHistory: any[];
}

function getCubicBezierPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Cubic Bezier conversion
    const tension = 0.22;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function PerformanceChartsComponent({ matchHistory }: PerformanceChartsProps) {
  const [activeMetric, setActiveMetric] = useState<"kd" | "acs" | "hs">("kd");
  const [matchLimit, setMatchLimit] = useState<number | "all">(20);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const totalAvailable = matchHistory?.length || 0;

  // Format matches in chronological order (oldest to newest)
  const chartData = useMemo(() => {
    if (!matchHistory || matchHistory.length === 0) return [];
    const sliceCount = matchLimit === "all" ? matchHistory.length : matchLimit;
    const reversed = [...matchHistory].slice(0, sliceCount).reverse();

    return reversed.map((m, idx) => {
      const kd = m.deaths > 0 ? Number((m.kills / m.deaths).toFixed(2)) : m.kills;
      const hs =
        m.headshots && m.kills
          ? Math.round((m.headshots / (m.kills + m.assists || 1)) * 100)
          : m.headshotPct || 20;
      return {
        index: idx + 1,
        matchId: m.matchId,
        date: m.date ? new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : `M${idx + 1}`,
        map: m.map || "Map",
        agent: m.agent || "Agent",
        agentIcon: m.agentIcon,
        won: m.won,
        score: m.score || "",
        kd,
        acs: m.acs || 0,
        hs,
      };
    });
  }, [matchHistory, matchLimit]);

  if (chartData.length < 2) {
    return null;
  }

  // Dynamic responsive viewBox dimensions (2.7:1 ratio for prominent curves on both mobile and PC)
  const width = 500;
  const height = 180;
  const padding = { top: 25, right: 15, bottom: 25, left: 15 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  let values: number[] = [];
  let formatVal = (v: number) => String(v);
  let threshold: number | null = null;

  if (activeMetric === "kd") {
    values = chartData.map((d) => d.kd);
    formatVal = (v: number) => v.toFixed(2);
    threshold = 1.0;
  } else if (activeMetric === "acs") {
    values = chartData.map((d) => d.acs);
    formatVal = (v: number) => `${Math.round(v)}`;
    threshold = 200;
  } else {
    values = chartData.map((d) => d.hs);
    formatVal = (v: number) => `${Math.round(v)}%`;
    threshold = 20;
  }

  const minVal = Math.max(0, Math.min(...values) * 0.85);
  const maxVal = Math.max(...values, threshold || 0) * 1.15 || 10;
  const valRange = maxVal - minVal || 1;

  const points = chartData.map((d, i) => {
    const x = padding.left + (i / (chartData.length - 1)) * graphWidth;
    const val = activeMetric === "kd" ? d.kd : activeMetric === "acs" ? d.acs : d.hs;
    const y = padding.top + graphHeight - ((val - minVal) / valRange) * graphHeight;
    return { ...d, x, y, currentVal: val };
  });

  const pathD = getCubicBezierPath(points);

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + graphHeight).toFixed(
    1
  )} L ${points[0].x.toFixed(1)} ${(padding.top + graphHeight).toFixed(1)} Z`;

  const thresholdY =
    threshold !== null
      ? padding.top + graphHeight - ((threshold - minVal) / valRange) * graphHeight
      : null;

  const average = values.reduce((a, b) => a + b, 0) / (values.length || 1);

  // Smooth mouse move handler to avoid any jitter/flicker
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    let closest = 0;
    let minDistance = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closest = i;
      }
    });
    setHoveredIdx(closest);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-5 md:p-6 mb-4 sm:mb-6 animate-in fade-in duration-500 w-full">
      {/* Header controls: Title & Range Selector on Left, Metric Selector on Right */}
      <div className="flex flex-row items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-[var(--color-text-primary)]">
            Progression
          </span>

          {/* Range Selector: 10, 20, Tous */}
          <div className="flex items-center gap-0.5 bg-[var(--color-background)]/80 p-0.5 rounded-lg border border-[var(--color-border)]">
            {[
              { id: 10, label: "10" },
              { id: 20, label: "20" },
              { id: "all", label: `Tous (${totalAvailable})` },
            ].map((r) => (
              <button
                key={String(r.id)}
                onClick={() => setMatchLimit(r.id as any)}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  matchLimit === r.id
                    ? "bg-[var(--color-val-red)] text-white shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector (K/D, ACS, Headshot %) */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--color-surface)] p-0.5 sm:p-1 rounded-xl border border-[var(--color-border)]">
          {[
            { id: "kd", label: "K/D" },
            { id: "acs", label: "ACS" },
            { id: "hs", label: "HS %" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id as any)}
              className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeMetric === m.id
                  ? "bg-[var(--color-val-red)] text-white shadow-md shadow-[var(--color-val-red)]/30"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] mb-2">
        Moyenne ({chartData.length} matchs) :{" "}
        <strong className="text-[var(--color-text-primary)]">{formatVal(average)}</strong>
      </div>

      {/* Full-width SVG Chart with smooth mouse tracking */}
      <div className="w-full relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 sm:h-48 select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="chartGradientFull" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-val-red, #ff4655)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-val-red, #ff4655)" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowFull" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
            opacity="0.4"
          />
          <line
            x1={padding.left}
            y1={padding.top + graphHeight / 2}
            x2={width - padding.right}
            y2={padding.top + graphHeight / 2}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
            opacity="0.4"
          />
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={width - padding.right}
            y2={padding.top + graphHeight}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
            opacity="0.4"
          />

          {/* Target Threshold Line */}
          {thresholdY !== null && thresholdY >= padding.top && thresholdY <= padding.top + graphHeight && (
            <g>
              <line
                x1={padding.left}
                y1={thresholdY}
                x2={width - padding.right}
                y2={thresholdY}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.7"
              />
              <text
                x={width - padding.right - 5}
                y={thresholdY - 4}
                textAnchor="end"
                fill="#38bdf8"
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                Seuil ({threshold})
              </text>
            </g>
          )}

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradientFull)" />

          {/* Main Smooth Curved Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-val-red, #ff4655)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowFull)"
          />

          {/* Points */}
          {points.map((p, i) => {
            const isSelected = hoveredIdx === i;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isSelected ? 6 : 4}
                fill={p.won ? "#10b981" : "#ef4444"}
                stroke="#0a0e13"
                strokeWidth="2"
                className="transition-all duration-150"
              />
            );
          })}

          {/* Vertical Guide Line on Hover */}
          {activePoint && (
            <g pointerEvents="none">
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + graphHeight}
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Smooth Floating Tooltip Box */}
              <g transform={`translate(${Math.max(10, Math.min(width - 130, activePoint.x - 60))}, ${Math.max(5, activePoint.y - 45)})`}>
                <rect
                  width="120"
                  height="34"
                  rx="8"
                  fill="#121824"
                  stroke="var(--color-val-red)"
                  strokeWidth="1.5"
                  className="shadow-2xl"
                />
                <text
                  x="60"
                  y="14"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="900"
                  fontFamily="sans-serif"
                >
                  {formatVal(activePoint.currentVal)} • {activePoint.won ? "Victoire" : "Défaite"}
                </text>
                <text
                  x="60"
                  y="27"
                  textAnchor="middle"
                  fill="var(--color-text-secondary)"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {activePoint.map} ({activePoint.agent})
                </text>
              </g>
            </g>
          )}

          {/* Bottom Date Labels */}
          {points.map((p, i) => {
            const step = Math.max(1, Math.floor(points.length / 5));
            const showLabel = i === 0 || i === points.length - 1 || i % step === 0;
            if (!showLabel) return null;

            return (
              <text
                key={i}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
                pointerEvents="none"
              >
                {p.date}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend & Summary */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between pt-2.5 mt-1 border-t border-[var(--color-border)] text-[9px] sm:text-[10px] text-[var(--color-text-secondary)] gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Victoire
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Défaite
          </span>
          {threshold !== null && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-[#38bdf8]"></span> Seuil ({threshold})
            </span>
          )}
        </div>
        <span className="font-mono opacity-60 hidden sm:inline-block">Survolez le graphique pour inspecter chaque match</span>
      </div>
    </div>
  );
}

export default React.memo(PerformanceChartsComponent);
