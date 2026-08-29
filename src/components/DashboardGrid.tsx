"use client";

import React, { useState, useEffect, useMemo } from "react";
import StatCard from "./StatCard";
import PerformanceCharts from "./PerformanceCharts";

export interface GridItemConfig {
  id: string;
  span: 1 | 2 | 3 | 4;
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
  { id: "chart", span: 4, visible: true },
  { id: "kills", span: 1, visible: true },
  { id: "deaths", span: 1, visible: true },
  { id: "assists", span: 1, visible: true },
  { id: "kd", span: 1, visible: true },
  { id: "adr", span: 1, visible: true },
  { id: "hs", span: 1, visible: true },
  { id: "wr", span: 1, visible: true },
  { id: "acs", span: 1, visible: true },
  { id: "fb", span: 1, visible: true },
  { id: "ace", span: 1, visible: true },
  { id: "kast", span: 1, visible: true },
  { id: "dd", span: 1, visible: true },
  { id: "wins", span: 1, visible: true },
  { id: "matches", span: 1, visible: true },
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
  const storageKey = `spycam_grid_layout_${userStorageKey}`;

  const [layout, setLayout] = useState<GridItemConfig[]>(DEFAULT_LAYOUT);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Load layout from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with DEFAULT_LAYOUT in case new items were added
          const existingIds = new Set(parsed.map((item: GridItemConfig) => item.id));
          const missing = DEFAULT_LAYOUT.filter((item) => !existingIds.has(item.id));
          setLayout([...parsed, ...missing]);
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

  // Cycle item width span (1 -> 2 -> 4 -> 1)
  const cycleSpan = (id: string) => {
    const updated = layout.map((item) => {
      if (item.id === id) {
        if (id === "chart") {
          // Chart toggles between full (4) and half (2)
          return { ...item, span: item.span === 4 ? (2 as const) : (4 as const) };
        }
        let nextSpan: 1 | 2 | 3 | 4 = 1;
        if (item.span === 1) nextSpan = 2;
        else if (item.span === 2) nextSpan = 4;
        else nextSpan = 1;
        return { ...item, span: nextSpan };
      }
      return item;
    });
    saveLayout(updated);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    if (!id) return;

    const visibleItems = layout.filter((i) => i.visible);
    const hiddenItems = layout.filter((i) => !i.visible);

    // If dragged from drawer, make it visible and place at targetIndex
    const fromDrawer = hiddenItems.some((i) => i.id === id);

    let newVisible: GridItemConfig[] = [];
    if (fromDrawer) {
      const itemToRestore = hiddenItems.find((i) => i.id === id)!;
      const restored = { ...itemToRestore, visible: true };
      newVisible = [...visibleItems];
      newVisible.splice(targetIndex, 0, restored);
    } else {
      const sourceIndex = visibleItems.findIndex((i) => i.id === id);
      if (sourceIndex === -1 || sourceIndex === targetIndex) {
        setDraggedId(null);
        setDragOverIndex(null);
        return;
      }
      newVisible = [...visibleItems];
      const [moved] = newVisible.splice(sourceIndex, 1);
      newVisible.splice(targetIndex, 0, moved);
    }

    const remainingHidden = hiddenItems.filter((i) => i.id !== id);
    saveLayout([...newVisible, ...remainingHidden]);
    setDraggedId(null);
    setDragOverIndex(null);
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
      // Must be visible in user layout
      if (!item.visible) return false;
      // If not in edit mode and privacy hides it for visitors, don't show
      if (!canEdit && hiddenStatsByPrivacy.includes(item.id)) return false;
      return true;
    });
  }, [layout, canEdit, hiddenStatsByPrivacy]);

  const hiddenDrawerItems = useMemo(() => {
    return layout.filter((item) => !item.visible);
  }, [layout]);

  // Render individual widget content
  const renderItemContent = (id: string, span: number) => {
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

  // Convert span (1 to 4) to tailwind grid column classes
  const getColSpanClass = (span: number, id: string) => {
    if (id === "chart") {
      if (span === 2) return "col-span-1 sm:col-span-2 md:col-span-2";
      return "col-span-1 sm:col-span-2 md:col-span-4";
    }
    switch (span) {
      case 2:
        return "col-span-1 sm:col-span-2 md:col-span-2";
      case 3:
        return "col-span-1 sm:col-span-2 md:col-span-3";
      case 4:
        return "col-span-1 sm:col-span-2 md:col-span-4";
      case 1:
      default:
        return "col-span-1";
    }
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
                  Mode Édition de Grille
                </span>
                <span className="hidden md:inline text-[11px] text-[var(--color-text-secondary)]">
                  — Glissez les cases, redimensionnez ou masquez-les
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

      {/* Main Grid Container with Customizable Background Grid Overlay */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isEditing
            ? "p-3 sm:p-5 rounded-3xl border-2 border-dashed border-[var(--color-val-red)]/35 bg-[radial-gradient(rgba(255,70,85,0.1)_1.5px,transparent_1.5px)] [background-size:24px_24px]"
            : ""
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3.5 w-full">
          {activeItems.map((item, index) => {
            const isDragged = draggedId === item.id;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={item.id}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative transition-all duration-200 group/item ${getColSpanClass(
                  item.span,
                  item.id
                )} ${isDragged ? "opacity-30 scale-95" : "opacity-100"} ${
                  isDragOver ? "ring-2 ring-[var(--color-val-red)] rounded-2xl scale-[1.02]" : ""
                } ${isEditing ? "cursor-grab active:cursor-grabbing hover:scale-[1.01]" : ""}`}
              >
                {/* Visual Content */}
                <div className="w-full h-full">{renderItemContent(item.id, item.span)}</div>

                {/* Edit Mode Overlays & Action Buttons */}
                {isEditing && (
                  <>
                    {/* Drag Handle Indicator at Top Left */}
                    <div className="absolute top-2 left-2 z-20 opacity-70 group-hover/item:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1 border border-white/10 select-none pointer-events-none">
                      <span className="text-[10px] text-white/70">⋮⋮</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-white/90">
                        {item.span === 4 ? "Plein" : item.span === 2 ? "2 col" : "1 col"}
                      </span>
                    </div>

                    {/* Resize Button at Bottom Right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cycleSpan(item.id);
                      }}
                      title="Changer la largeur de cette case"
                      className="absolute bottom-2 right-2 z-20 opacity-0 group-hover/item:opacity-100 transition-all bg-[var(--color-surface)] hover:bg-[var(--color-val-red)] border border-[var(--color-border)] text-white hover:text-white rounded-lg p-1.5 shadow-lg cursor-pointer flex items-center justify-center text-[10px]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </button>

                    {/* Red Circle "-" Remove Button at Top Right on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(item.id, false);
                      }}
                      title="Masquer / Retirer cette case (glisser vers le tiroir)"
                      className="absolute -top-2.5 -right-2.5 z-30 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.7)] border-2 border-[#0a0e13] transition-transform hover:scale-115 cursor-pointer opacity-0 group-hover/item:opacity-100"
                    >
                      −
                    </button>
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
                — Cliquez sur &quot;+&quot; ou glissez-déposez une case dans la grille
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
