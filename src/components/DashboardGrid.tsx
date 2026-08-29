"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import StatCard from "./StatCard";
import PerformanceCharts from "./PerformanceCharts";

export interface GridItemConfig {
  id: string;
  x: number;
  y: number;
  colSpan: number;
  rowSpan: number;
  visible: boolean;
}

export interface DashboardGridProps {
  stats: any;
  warnings: Record<string, string>;
  smartRating: boolean;
  matchHistory: any[];
  canEdit: boolean;
  hiddenStatsByPrivacy?: string[];
  userStorageKey?: string;
}

const DEFAULT_COLS = 12;
const DEFAULT_ROWS = 7;
const DEFAULT_ROW_HEIGHT = 100;
const GRID_GAP = 12;

const DEFAULT_LAYOUT: GridItemConfig[] = [
  { id: "chart", x: 1, y: 1, colSpan: 12, rowSpan: 2, visible: true },
  { id: "kills", x: 1, y: 3, colSpan: 3, rowSpan: 1, visible: true },
  { id: "deaths", x: 4, y: 3, colSpan: 3, rowSpan: 1, visible: true },
  { id: "assists", x: 7, y: 3, colSpan: 3, rowSpan: 1, visible: true },
  { id: "kd", x: 10, y: 3, colSpan: 3, rowSpan: 1, visible: true },
  { id: "adr", x: 1, y: 4, colSpan: 3, rowSpan: 1, visible: true },
  { id: "hs", x: 4, y: 4, colSpan: 3, rowSpan: 1, visible: true },
  { id: "wr", x: 7, y: 4, colSpan: 3, rowSpan: 1, visible: true },
  { id: "acs", x: 10, y: 4, colSpan: 3, rowSpan: 1, visible: true },
  { id: "fb", x: 1, y: 5, colSpan: 3, rowSpan: 1, visible: true },
  { id: "ace", x: 4, y: 5, colSpan: 3, rowSpan: 1, visible: true },
  { id: "kast", x: 7, y: 5, colSpan: 3, rowSpan: 1, visible: true },
  { id: "dd", x: 10, y: 5, colSpan: 3, rowSpan: 1, visible: true },
  { id: "wins", x: 1, y: 6, colSpan: 3, rowSpan: 1, visible: true },
  { id: "matches", x: 4, y: 6, colSpan: 3, rowSpan: 1, visible: true },
];

const ITEM_LABELS: Record<string, { label: string; icon?: string; desc: string }> = {
  chart: { label: "Graphique de Progression", icon: "📈", desc: "Courbe d'évolution K/D, ACS et Headshot" },
  kills: { label: "Éliminations", icon: "🎯", desc: "Total des éliminations" },
  deaths: { label: "Morts", icon: "💀", desc: "Total des morts" },
  assists: { label: "Passes décisives", icon: "🤝", desc: "Total des assists" },
  kd: { label: "Ratio K/D", icon: "⚖️", desc: "Ratio Kills / Deaths" },
  adr: { label: "Dégâts/Tour (ADR)", icon: "💥", desc: "Dégâts moyens par manche" },
  hs: { label: "Headshot %", icon: "🎯", desc: "Pourcentage de tirs à la tête" },
  wr: { label: "Win Rate", icon: "🏆", desc: "Pourcentage de victoires" },
  acs: { label: "ACS Moyen", icon: "⚡", desc: "Combat Score moyen" },
  fb: { label: "Premiers sangs", icon: "🩸", desc: "First bloods réalisés" },
  ace: { label: "ACE", icon: "👑", desc: "Nombre de 1v5 / aces" },
  kast: { label: "KAST", icon: "🛡️", desc: "% manches avec K/A/S/T" },
  dd: { label: "DDΔ / Round", icon: "⚔️", desc: "Différence de dégâts par manche" },
  wins: { label: "Victoires", icon: "✅", desc: "Nombre total de victoires" },
  matches: { label: "Parties", icon: "🎮", desc: "Nombre total de parties" },
};

export default function DashboardGrid({
  stats,
  warnings,
  smartRating,
  matchHistory,
  canEdit,
  hiddenStatsByPrivacy = [],
  userStorageKey = "default",
}: DashboardGridProps) {
  const storageKey = `spycam_grid_layout_v4_${userStorageKey}`;
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const [gridCols, setGridCols] = useState<number>(DEFAULT_COLS);
  const [gridRows, setGridRows] = useState<number>(DEFAULT_ROWS);
  const [layout, setLayout] = useState<GridItemConfig[]>(DEFAULT_LAYOUT);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [resizeHint, setResizeHint] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 700,
  });

  // Track container dimensions for SVG grid dots
  useEffect(() => {
    if (!gridContainerRef.current) return;
    const updateSize = () => {
      if (gridContainerRef.current) {
        setContainerDimensions({
          width: gridContainerRef.current.clientWidth,
          height: gridContainerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(gridContainerRef.current);
    return () => observer.disconnect();
  }, [gridCols, gridRows, layout, isEditing]);

  // Load layout and grid density settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          if (parsed.cols) setGridCols(parsed.cols);
          if (parsed.rows) setGridRows(parsed.rows);
          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            const existingIds = new Set(parsed.items.map((item: any) => item.id));
            const normalized = parsed.items.map((item: any, idx: number) => ({
              id: item.id,
              x: item.x || (item.id === "chart" ? 1 : ((idx % 4) * 3 + 1)),
              y: item.y || (item.id === "chart" ? 1 : (Math.floor(idx / 4) + 3)),
              colSpan: item.colSpan || (item.id === "chart" ? (parsed.cols || 12) : 3),
              rowSpan: item.rowSpan || (item.id === "chart" ? 2 : 1),
              visible: item.visible !== false,
            }));
            const missing = DEFAULT_LAYOUT.filter((item) => !existingIds.has(item.id));
            setLayout([...normalized, ...missing]);
          }
        }
      }
    } catch {}
  }, [storageKey]);

  // Save layout and grid config
  const saveState = (newLayout: GridItemConfig[], cols = gridCols, rows = gridRows) => {
    setLayout(newLayout);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          cols,
          rows,
          items: newLayout,
        })
      );
    } catch {}
  };

  const handleResetLayout = () => {
    setGridCols(DEFAULT_COLS);
    setGridRows(DEFAULT_ROWS);
    saveState(DEFAULT_LAYOUT, DEFAULT_COLS, DEFAULT_ROWS);
    setDrawerOpen(false);
  };

  // Toggle item visibility (hide to drawer or show)
  const toggleVisibility = (id: string, makeVisible?: boolean) => {
    const updated = layout.map((item) => {
      if (item.id === id) {
        return { ...item, visible: makeVisible !== undefined ? makeVisible : !item.visible };
      }
      return item;
    });
    saveState(updated);
  };

  // Free Drag & Drop anywhere on the 2D grid
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(id);
  };

  const handleGridDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!draggedId || !gridContainerRef.current) return;

    const rect = gridContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cellWidth = rect.width / gridCols;
    const cellHeight = DEFAULT_ROW_HEIGHT + GRID_GAP;

    const draggedItem = layout.find((i) => i.id === draggedId);
    if (!draggedItem) return;

    const spanW = Math.min(draggedItem.colSpan, gridCols);
    const spanH = draggedItem.rowSpan;

    const targetX = Math.max(1, Math.min(gridCols - spanW + 1, Math.floor(mouseX / cellWidth) + 1));
    const targetY = Math.max(1, Math.min(gridRows - spanH + 1, Math.floor(mouseY / cellHeight) + 1));

    if (draggedItem.x !== targetX || draggedItem.y !== targetY || !draggedItem.visible) {
      setLayout((prev) =>
        prev.map((item) =>
          item.id === draggedId ? { ...item, x: targetX, y: targetY, visible: true } : item
        )
      );
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    saveState(layout);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedId(null);
    saveState(layout);
  };

  // Interactive Live Edge Resizing (With strict minimum sizes to prevent text clipping)
  const handleResizeStart = (
    e: React.MouseEvent,
    itemId: string,
    currentColSpan: number,
    currentRowSpan: number,
    direction: "horizontal" | "vertical"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingItemId(itemId);

    const startX = e.clientX;
    const startY = e.clientY;
    const container = gridContainerRef.current;
    const containerWidth = container ? container.clientWidth : 800;
    const colWidth = Math.max(20, containerWidth / gridCols);
    const rowHeight = DEFAULT_ROW_HEIGHT;

    // Minimum constraints
    const minCol = itemId === "chart" ? Math.max(3, Math.round(gridCols / 4)) : 2;
    const minRow = 1;

    const currentItem = layout.find((i) => i.id === itemId);
    const startPosX = currentItem?.x || 1;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (direction === "horizontal") {
        const deltaX = moveEvent.clientX - startX;
        const colDelta = Math.round(deltaX / colWidth);
        const maxAvailableCols = gridCols - startPosX + 1;
        const targetColSpan = Math.max(minCol, Math.min(maxAvailableCols, currentColSpan + colDelta));

        setResizeHint(`${targetColSpan} / ${gridCols} cols × ${currentRowSpan} ligne(s)`);
        setLayout((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, colSpan: targetColSpan } : item))
        );
      } else {
        const deltaY = moveEvent.clientY - startY;
        const rowDelta = Math.round(deltaY / rowHeight);
        const targetRowSpan = Math.max(minRow, Math.min(gridRows, currentRowSpan + rowDelta));

        setResizeHint(`${currentColSpan} cols × ${targetRowSpan} ligne(s)`);
        setLayout((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, rowSpan: targetRowSpan } : item))
        );
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setResizingItemId(null);
      setResizeHint(null);
      setLayout((current) => {
        saveState(current);
        return current;
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Restore all hidden items
  const handleRestoreAll = () => {
    const updated = layout.map((item) => ({ ...item, visible: true }));
    saveState(updated);
    setDrawerOpen(false);
  };

  // Active items and hidden drawer items
  const activeItems = useMemo(() => {
    return layout.filter((item) => {
      if (!item.visible) return false;
      if (!canEdit && hiddenStatsByPrivacy.includes(item.id)) return false;
      return true;
    });
  }, [layout, canEdit, hiddenStatsByPrivacy]);

  const hiddenDrawerItems = useMemo(() => {
    return layout.filter((item) => !item.visible);
  }, [layout]);

  // Calculate highest row used to ensure grid height is spacious
  const maxRowUsed = useMemo(() => {
    let max = gridRows;
    activeItems.forEach((i) => {
      max = Math.max(max, (i.y || 1) + (i.rowSpan || 1) - 1);
    });
    return max;
  }, [activeItems, gridRows]);

  // Render individual widget content
  const renderItemContent = (id: string) => {
    switch (id) {
      case "chart":
        return <PerformanceCharts matchHistory={matchHistory} />;
      case "kills":
        return <StatCard label="Éliminations" value={stats?.kills ?? 0} smartRating={smartRating} />;
      case "deaths":
        return <StatCard label="Morts" value={stats?.deaths ?? 0} smartRating={smartRating} />;
      case "assists":
        return <StatCard label="Passes décisives" value={stats?.assists ?? 0} smartRating={smartRating} />;
      case "kd":
        return (
          <StatCard
            label="Ratio K/D"
            value={(stats?.kdRatio ?? 0).toFixed(2)}
            highlight
            warning={warnings?.kd}
            smartRating={smartRating}
          />
        );
      case "adr":
        return <StatCard label="Dégâts/Tour (ADR)" value={stats?.adr ?? 0} highlight smartRating={smartRating} />;
      case "hs":
        return (
          <StatCard
            label="Headshot %"
            value={stats?.headshotPct ?? 0}
            suffix="%"
            warning={warnings?.hs}
            smartRating={smartRating}
          />
        );
      case "wr":
        return (
          <StatCard
            label="Win Rate"
            value={stats?.winRate ?? 0}
            suffix="%"
            warning={warnings?.wr}
            smartRating={smartRating}
          />
        );
      case "acs":
        return (
          <StatCard
            label="ACS Moyen"
            value={stats?.acs ?? 0}
            highlight
            warning={warnings?.acs}
            smartRating={smartRating}
          />
        );
      case "fb":
        return <StatCard label="Premiers sangs" value={stats?.firstBloods ?? 0} smartRating={smartRating} />;
      case "ace":
        return <StatCard label="ACE" value={stats?.aceCount ?? 0} smartRating={smartRating} />;
      case "kast":
        return (
          <StatCard
            label="KAST"
            value={stats?.kast ?? 0}
            suffix="%"
            sub={stats?.kastPercentile}
            warning={warnings?.kast}
            smartRating={smartRating}
          />
        );
      case "dd":
        return (
          <StatCard
            label="DDΔ / Round"
            value={stats?.ddDelta > 0 ? `+${stats?.ddDelta}` : stats?.ddDelta ?? 0}
            warning={warnings?.dd}
            smartRating={smartRating}
          />
        );
      case "wins":
        return (
          <StatCard
            label="Victoires"
            value={Math.round(((stats?.winRate ?? 0) / 100) * (stats?.matchesPlayed ?? 0))}
            smartRating={smartRating}
          />
        );
      case "matches":
        return <StatCard label="Parties" value={stats?.matchesPlayed ?? 0} smartRating={smartRating} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col relative">
      {/* Top Header / Mode Edition Bar */}
      {canEdit && (
        <div className="w-full flex items-center justify-between gap-3 mb-4 pb-2 border-b border-[var(--color-border)]/60 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {isEditing ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-val-red)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-val-red)]"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--color-val-red)]">
                    Mode Grille
                  </span>
                </div>

                {/* Density Inputs */}
                <div className="flex items-center gap-2 bg-[var(--color-surface)]/80 border border-[var(--color-border)] px-2.5 py-1 rounded-xl backdrop-blur-md">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Colonnes
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={48}
                      value={gridCols}
                      onChange={(e) => {
                        const val = Math.max(2, Math.min(48, Number(e.target.value) || 12));
                        setGridCols(val);
                        saveState(layout, val, gridRows);
                      }}
                      className="w-11 bg-black/60 border border-white/15 text-white rounded-lg px-1.5 py-0.5 text-center text-xs font-mono font-black focus:border-[var(--color-val-red)] focus:outline-none"
                    />
                  </div>

                  <span className="text-[var(--color-border)]">|</span>

                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Lignes
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={gridRows}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(30, Number(e.target.value) || 8));
                        setGridRows(val);
                        saveState(layout, gridCols, val);
                      }}
                      className="w-11 bg-black/60 border border-white/15 text-white rounded-lg px-1.5 py-0.5 text-center text-xs font-mono font-black focus:border-[var(--color-val-red)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Tableau de Bord
              </span>
            )}
          </div>

          {/* Edit / Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isEditing ? (
              <>
                {hiddenDrawerItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer ${
                      drawerOpen
                        ? "bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-md"
                        : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span>🗄️ Tiroir</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-black">
                      {hiddenDrawerItems.length}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetLayout}
                  className="px-3 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  title="Réinitialiser l'agencement d'origine"
                >
                  ↺ Réinitialiser
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDrawerOpen(false);
                    setSaveToast(true);
                    setTimeout(() => setSaveToast(false), 2500);
                  }}
                  className="px-4 py-1.5 bg-[var(--color-val-red)] hover:bg-[#ff5865] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,70,85,0.4)] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>✓ Terminer</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-val-red)]/50 text-[var(--color-text-primary)] hover:text-[var(--color-val-red)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:rotate-45 transition-transform"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                <span>Personnaliser la grille</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#121824] border border-emerald-500/50 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Agencement de la grille enregistré avec succès !</span>
        </div>
      )}

      {/* Live Resize Tooltip Hint */}
      {resizeHint && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#0f1923] border border-[var(--color-val-red)] text-white px-4 py-2 rounded-full shadow-2xl text-xs font-black uppercase tracking-wider animate-pulse">
          📐 {resizeHint}
        </div>
      )}

      {/* Main Free 2D Coordinate Grid Container with Crisp SVG Dots Backdrop */}
      <div
        ref={gridContainerRef}
        onDragOver={handleGridDragOver}
        onDrop={handleDrop}
        style={{
          minHeight: `${Math.max(gridRows, maxRowUsed) * (DEFAULT_ROW_HEIGHT + GRID_GAP)}px`,
        }}
        className={`w-full transition-all duration-300 relative ${
          isEditing ? "p-3 sm:p-5 rounded-3xl border-2 border-dashed border-[var(--color-val-red)]/40 bg-black/30" : ""
        }`}
      >
        {/* Exact Non-Stretched SVG Grid Dots Matrix */}
        {isEditing && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl z-0"
            style={{ overflow: "hidden" }}
          >
            {Array.from({ length: Math.max(gridRows, maxRowUsed) + 1 }).map((_, r) =>
              Array.from({ length: gridCols + 1 }).map((_, c) => {
                const stepX = containerDimensions.width / gridCols;
                const stepY = DEFAULT_ROW_HEIGHT + GRID_GAP;
                const cx = Math.min(containerDimensions.width - 4, Math.max(4, c * stepX));
                const cy = Math.min(containerDimensions.height - 4, Math.max(4, r * stepY + 12));

                return (
                  <circle
                    key={`${r}-${c}`}
                    cx={cx}
                    cy={cy}
                    r="1.8"
                    fill="rgba(255, 70, 85, 0.45)"
                  />
                );
              })
            )}
          </svg>
        )}

        {/* Dynamic 2D CSS Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gridAutoRows: `${DEFAULT_ROW_HEIGHT}px`,
            gap: `${GRID_GAP}px`,
          }}
          className="w-full relative z-10"
        >
          {activeItems.map((item) => {
            const isDragged = draggedId === item.id;
            const isResizing = resizingItemId === item.id;

            const posX = Math.max(1, Math.min(gridCols, item.x || 1));
            const posY = Math.max(1, item.y || 1);
            const actualColSpan = Math.min(item.colSpan, gridCols - posX + 1);
            const actualRowSpan = Math.max(1, item.rowSpan);

            return (
              <div
                key={item.id}
                draggable={isEditing && !resizingItemId}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragEnd={handleDragEnd}
                style={{
                  gridColumn: `${posX} / span ${actualColSpan}`,
                  gridRow: `${posY} / span ${actualRowSpan}`,
                }}
                className={`relative group/item transition-all duration-200 ease-out select-none flex flex-col min-h-0 overflow-hidden ${
                  isDragged ? "opacity-30 scale-95 ring-2 ring-[var(--color-val-red)]/50 rounded-2xl" : "opacity-100"
                } ${
                  isResizing ? "ring-2 ring-[var(--color-val-red)] shadow-[0_0_20px_rgba(255,70,85,0.4)] rounded-2xl" : ""
                } ${isEditing ? "cursor-grab active:cursor-grabbing hover:shadow-xl" : ""}`}
              >
                {/* Visual Content (fills 100% height and width without overflow) */}
                <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden">
                  {renderItemContent(item.id)}
                </div>

                {/* Edit Mode Overlays & Edge Resize Bars */}
                {isEditing && (
                  <>
                    {/* Size & Position Indicator at top left */}
                    <div className="absolute top-2 left-2 z-20 opacity-0 group-hover/item:opacity-100 transition-opacity bg-black/85 backdrop-blur-md rounded-lg px-2 py-0.5 flex items-center gap-1 border border-white/15 select-none pointer-events-none shadow-md">
                      <span className="text-[10px] text-[var(--color-val-red)]">⋮⋮</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-white">
                        {actualColSpan}c × {actualRowSpan}l (col {posX}, l {posY})
                      </span>
                    </div>

                    {/* RED CIRCLE "-" REMOVE BUTTON AT TOP RIGHT */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(item.id, false);
                      }}
                      title="Masquer / Retirer cette case (envoyer au tiroir)"
                      className="absolute -top-2.5 -right-2.5 z-30 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-base flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.8)] border-2 border-[#0a0e13] transition-transform hover:scale-115 cursor-pointer opacity-0 group-hover/item:opacity-100"
                    >
                      −
                    </button>

                    {/* RESIZE HANDLE: VERTICAL BAR ON RIGHT FACE (Largeur en colonnes) */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, item.id, actualColSpan, actualRowSpan, "horizontal")}
                      className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-30 w-4 h-12 bg-[#0f1923]/95 hover:bg-[var(--color-val-red)] border border-white/30 hover:border-white rounded-full flex items-center justify-center cursor-ew-resize shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all hover:scale-110 opacity-0 group-hover/item:opacity-100 group/handle"
                      title="Maintenir et glisser horizontalement pour ajuster les colonnes"
                    >
                      <div className="w-1 h-6 bg-white/70 rounded-full group-hover/handle:bg-white"></div>
                    </div>

                    {/* RESIZE HANDLE: HORIZONTAL BAR ON BOTTOM FACE (Hauteur en rangées) */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, item.id, actualColSpan, actualRowSpan, "vertical")}
                      className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-30 h-4 w-12 bg-[#0f1923]/95 hover:bg-[var(--color-val-red)] border border-white/30 hover:border-white rounded-full flex items-center justify-center cursor-ns-resize shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all hover:scale-110 opacity-0 group-hover/item:opacity-100 group/handle"
                      title="Maintenir et glisser verticalement pour ajuster les rangées"
                    >
                      <div className="h-1 w-6 bg-white/70 rounded-full group-hover/handle:bg-white"></div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-out / Bottom Drawer for Hidden Widgets */}
      {isEditing && hiddenDrawerItems.length > 0 && (
        <div
          className={`w-full mt-4 p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
            drawerOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)]">
                Widgets Retirés ({hiddenDrawerItems.length})
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                — Glissez une case directement dans la grille ou cliquez sur &quot;+&quot;
              </span>
            </div>
            <button
              type="button"
              onClick={handleRestoreAll}
              className="text-xs font-bold text-[var(--color-val-red)] hover:underline cursor-pointer"
            >
              Tout réafficher
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {hiddenDrawerItems.map((hiddenItem) => {
              const meta = ITEM_LABELS[hiddenItem.id] || { label: hiddenItem.id, icon: "📊", desc: "" };

              return (
                <div
                  key={hiddenItem.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, hiddenItem.id)}
                  onDragEnd={handleDragEnd}
                  className="glass-panel p-3 rounded-xl border border-[var(--color-border)] hover:border-emerald-500/50 transition-all flex items-center justify-between gap-2 group cursor-grab active:cursor-grabbing bg-black/40 hover:bg-emerald-500/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{meta.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                        {meta.label}
                      </span>
                      <span className="text-[9px] text-[var(--color-text-secondary)] opacity-70 truncate">
                        {meta.desc}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleVisibility(hiddenItem.id, true)}
                    title="Remettre dans la grille"
                    className="w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md transition-transform hover:scale-110 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
