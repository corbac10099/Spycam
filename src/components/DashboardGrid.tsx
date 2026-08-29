"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import StatCard from "./StatCard";
import PerformanceCharts from "./PerformanceCharts";

export interface GridItemConfig {
  id: string;
  colSpan: 1 | 2 | 3 | 4;
  rowSpan: 1 | 2 | 3;
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

const DEFAULT_LAYOUT: GridItemConfig[] = [
  { id: "chart", colSpan: 4, rowSpan: 2, visible: true },
  { id: "kills", colSpan: 1, rowSpan: 1, visible: true },
  { id: "deaths", colSpan: 1, rowSpan: 1, visible: true },
  { id: "assists", colSpan: 1, rowSpan: 1, visible: true },
  { id: "kd", colSpan: 1, rowSpan: 1, visible: true },
  { id: "adr", colSpan: 1, rowSpan: 1, visible: true },
  { id: "hs", colSpan: 1, rowSpan: 1, visible: true },
  { id: "wr", colSpan: 1, rowSpan: 1, visible: true },
  { id: "acs", colSpan: 1, rowSpan: 1, visible: true },
  { id: "fb", colSpan: 1, rowSpan: 1, visible: true },
  { id: "ace", colSpan: 1, rowSpan: 1, visible: true },
  { id: "kast", colSpan: 1, rowSpan: 1, visible: true },
  { id: "dd", colSpan: 1, rowSpan: 1, visible: true },
  { id: "wins", colSpan: 1, rowSpan: 1, visible: true },
  { id: "matches", colSpan: 1, rowSpan: 1, visible: true },
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
  const storageKey = `spycam_grid_layout_v2_${userStorageKey}`;
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<GridItemConfig[]>(DEFAULT_LAYOUT);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [resizeHint, setResizeHint] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Load layout from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((item: any) => item.id));
          // Migrate old span to colSpan/rowSpan if needed
          const normalized = parsed.map((item: any) => ({
            id: item.id,
            colSpan: (item.colSpan || item.span || (item.id === "chart" ? 4 : 1)) as 1 | 2 | 3 | 4,
            rowSpan: (item.rowSpan || (item.id === "chart" ? 2 : 1)) as 1 | 2 | 3,
            visible: item.visible !== false,
          }));
          const missing = DEFAULT_LAYOUT.filter((item) => !existingIds.has(item.id));
          setLayout([...normalized, ...missing]);
        }
      }
    } catch {}
  }, [storageKey]);

  // Save layout
  const saveLayout = (newLayout: GridItemConfig[]) => {
    setLayout(newLayout);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newLayout));
    } catch {}
  };

  const handleResetLayout = () => {
    saveLayout(DEFAULT_LAYOUT);
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
    saveLayout(updated);
  };

  // Drag & Drop handlers with Live Shifting (Samsung App Grid Style)
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(id);
  };

  const handleDragEnter = (targetIndex: number) => {
    if (!draggedId) return;
    const visibleItems = layout.filter((i) => i.visible);
    const fromDrawer = layout.find((i) => i.id === draggedId && !i.visible);

    if (fromDrawer) {
      // Item from drawer: live insert into grid
      const newVisible = [...visibleItems.filter((i) => i.id !== draggedId)];
      const restored = { ...fromDrawer, visible: true };
      newVisible.splice(targetIndex, 0, restored);
      const remainingHidden = layout.filter((i) => !i.visible && i.id !== draggedId);
      setLayout([...newVisible, ...remainingHidden]);
      return;
    }

    const currentIndex = visibleItems.findIndex((i) => i.id === draggedId);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    // Shift other cards in real time smoothly!
    const newVisible = [...visibleItems];
    const [moved] = newVisible.splice(currentIndex, 1);
    newVisible.splice(targetIndex, 0, moved);
    const hiddenItems = layout.filter((i) => !i.visible);
    setLayout([...newVisible, ...hiddenItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    try {
      localStorage.setItem(storageKey, JSON.stringify(layout));
    } catch {}
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedId(null);
    try {
      localStorage.setItem(storageKey, JSON.stringify(layout));
    } catch {}
  };

  // Interactive Modular Edge Resizing (Holding and dragging handles)
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
    const colWidth = Math.max(70, containerWidth / 4);
    const rowHeight = 105; // Standard row step height

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (direction === "horizontal") {
        const deltaX = moveEvent.clientX - startX;
        const colDelta = Math.round(deltaX / colWidth);
        const targetColSpan = Math.max(1, Math.min(4, currentColSpan + colDelta)) as 1 | 2 | 3 | 4;

        setResizeHint(`${targetColSpan} col × ${currentRowSpan} rangée(s)`);
        setLayout((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, colSpan: targetColSpan } : item))
        );
      } else {
        const deltaY = moveEvent.clientY - startY;
        const rowDelta = Math.round(deltaY / rowHeight);
        const targetRowSpan = Math.max(1, Math.min(3, currentRowSpan + rowDelta)) as 1 | 2 | 3;

        setResizeHint(`${currentColSpan} col × ${targetRowSpan} rangée(s)`);
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
        try {
          localStorage.setItem(storageKey, JSON.stringify(current));
        } catch {}
        return current;
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Restore all hidden items
  const handleRestoreAll = () => {
    const updated = layout.map((item) => ({ ...item, visible: true }));
    saveLayout(updated);
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

  // Convert colSpan and rowSpan to Tailwind classes with dense packing
  const getGridItemClasses = (colSpan: number, rowSpan: number) => {
    let colClass = "col-span-1";
    if (colSpan === 2) colClass = "col-span-1 sm:col-span-2";
    else if (colSpan === 3) colClass = "col-span-1 sm:col-span-2 md:col-span-3";
    else if (colSpan === 4) colClass = "col-span-1 sm:col-span-2 md:col-span-4";

    let rowClass = "row-span-1";
    if (rowSpan === 2) rowClass = "row-span-1 sm:row-span-2";
    else if (rowSpan === 3) rowClass = "row-span-1 sm:row-span-3";

    return `${colClass} ${rowClass}`;
  };

  return (
    <div className="w-full flex flex-col relative">
      {/* Top Header / Mode Edition Bar */}
      {canEdit && (
        <div className="w-full flex items-center justify-between gap-3 mb-4 pb-2 border-b border-[var(--color-border)]/60 flex-wrap">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-val-red)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-val-red)]"></span>
                </span>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--color-val-red)]">
                  Mode Grille Modulaire
                </span>
                <span className="hidden md:inline text-[11px] text-[var(--color-text-secondary)]">
                  — Remplissage intelligent & décalage auto (les cases s&apos;emboîtent sans espace vide)
                </span>
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

      {/* Main Grid Container with Dense Auto-Packing & Modular Dots */}
      <div
        ref={gridContainerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full transition-all duration-300 relative ${
          isEditing
            ? "p-3 sm:p-5 rounded-3xl border-2 border-dashed border-[var(--color-val-red)]/40 bg-[radial-gradient(rgba(255,70,85,0.18)_2px,transparent_2px)] [background-size:28px_28px]"
            : ""
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 [grid-auto-flow:dense] gap-3 sm:gap-4 auto-rows-[minmax(95px,auto)] w-full">
          {activeItems.map((item, index) => {
            const isDragged = draggedId === item.id;
            const isResizing = resizingItemId === item.id;

            return (
              <div
                key={item.id}
                draggable={isEditing && !resizingItemId}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                className={`relative group/item transition-all duration-300 ease-out select-none flex flex-col ${getGridItemClasses(
                  item.colSpan,
                  item.rowSpan
                )} ${isDragged ? "opacity-30 scale-95 ring-2 ring-[var(--color-val-red)]/50 rounded-2xl" : "opacity-100"} ${
                  isResizing ? "ring-2 ring-[var(--color-val-red)] shadow-[0_0_20px_rgba(255,70,85,0.4)] rounded-2xl" : ""
                } ${isEditing ? "cursor-grab active:cursor-grabbing hover:shadow-lg" : ""}`}
              >
                {/* Visual Content (flex child filling 100% height and width) */}
                <div className="w-full h-full flex-1 flex flex-col">{renderItemContent(item.id)}</div>

                {/* Edit Mode Overlays & Edge Resize Bars */}
                {isEditing && (
                  <>
                    {/* Size Badge Indicator at top left */}
                    <div className="absolute top-2 left-2 z-20 opacity-0 group-hover/item:opacity-100 transition-opacity bg-black/80 backdrop-blur-md rounded-lg px-2 py-0.5 flex items-center gap-1 border border-white/15 select-none pointer-events-none shadow-md">
                      <span className="text-[10px] text-[var(--color-val-red)]">⋮⋮</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-white">
                        {item.colSpan}x{item.rowSpan}
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
                      onMouseDown={(e) => handleResizeStart(e, item.id, item.colSpan, item.rowSpan, "horizontal")}
                      className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-30 w-4 h-12 bg-[#0f1923]/95 hover:bg-[var(--color-val-red)] border border-white/30 hover:border-white rounded-full flex items-center justify-center cursor-ew-resize shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all hover:scale-110 opacity-0 group-hover/item:opacity-100 group/handle"
                      title="Maintenir et glisser horizontalement pour ajuster les colonnes"
                    >
                      <div className="w-1 h-6 bg-white/70 rounded-full group-hover/handle:bg-white"></div>
                    </div>

                    {/* RESIZE HANDLE: HORIZONTAL BAR ON BOTTOM FACE (Hauteur en rangées) */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, item.id, item.colSpan, item.rowSpan, "vertical")}
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
