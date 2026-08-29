"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import StatCard from "./StatCard";
import PerformanceCharts from "./PerformanceCharts";
import WeaponHitmap from "./WeaponHitmap";
import {
  IconCrosshair,
  IconSkull,
  IconChart,
  IconHandshake,
  IconScale,
  IconFlame,
  IconCrown,
  IconShield,
  IconSword,
  IconTrophy,
  IconGamepad,
  IconAppGrid,
  IconSettings,
} from "./icons/SpyIcons";
import { sounds } from "@/lib/soundEffects";

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
  initialGridData?: string | null;
}

const DEFAULT_COLS = 12;
const GRID_GAP = 10;

const DEFAULT_LAYOUT: GridItemConfig[] = [
  { id: "chart", x: 0, y: 0, colSpan: 12, rowSpan: 2, visible: true },
  { id: "weapons", x: 0, y: 2, colSpan: 4, rowSpan: 3, visible: true },
  { id: "kills", x: 4, y: 2, colSpan: 4, rowSpan: 1, visible: true },
  { id: "deaths", x: 8, y: 2, colSpan: 4, rowSpan: 1, visible: true },
  { id: "assists", x: 4, y: 3, colSpan: 4, rowSpan: 1, visible: true },
  { id: "kd", x: 8, y: 3, colSpan: 4, rowSpan: 1, visible: true },
  { id: "adr", x: 4, y: 4, colSpan: 4, rowSpan: 1, visible: true },
  { id: "hs", x: 8, y: 4, colSpan: 4, rowSpan: 1, visible: true },
  { id: "wr", x: 0, y: 5, colSpan: 3, rowSpan: 1, visible: true },
  { id: "acs", x: 3, y: 5, colSpan: 3, rowSpan: 1, visible: true },
  { id: "fb", x: 6, y: 5, colSpan: 3, rowSpan: 1, visible: true },
  { id: "ace", x: 9, y: 5, colSpan: 3, rowSpan: 1, visible: true },
  { id: "kast", x: 0, y: 6, colSpan: 3, rowSpan: 1, visible: true },
  { id: "dd", x: 3, y: 6, colSpan: 3, rowSpan: 1, visible: true },
  { id: "wins", x: 6, y: 6, colSpan: 3, rowSpan: 1, visible: true },
  { id: "matches", x: 9, y: 6, colSpan: 3, rowSpan: 1, visible: true },
];

export const ITEM_ICONS: Record<string, React.ReactNode> = {
  chart: <IconChart size={14} />,
  weapons: <IconCrosshair size={14} />,
  kills: <IconCrosshair size={14} />,
  deaths: <IconSkull size={14} />,
  assists: <IconHandshake size={14} />,
  kd: <IconScale size={14} />,
  adr: <IconFlame size={14} />,
  hs: <IconCrosshair size={14} />,
  wr: <IconTrophy size={14} />,
  acs: <IconFlame size={14} />,
  fb: <IconSword size={14} />,
  ace: <IconCrown size={14} />,
  kast: <IconShield size={14} />,
  dd: <IconSword size={14} />,
  wins: <IconTrophy size={14} />,
  matches: <IconGamepad size={14} />,
};

const ITEM_LABELS: Record<string, { label: string; desc: string }> = {
  chart: { label: "Graphique de Progression", desc: "Courbe d'évolution K/D, ACS et Headshot" },
  weapons: { label: "Top Armes & Précision", desc: "Top 3 armes et zones de tir" },
  kills: { label: "Éliminations", desc: "Total des éliminations" },
  deaths: { label: "Morts", desc: "Total des morts" },
  assists: { label: "Passes décisives", desc: "Total des assists" },
  kd: { label: "Ratio K/D", desc: "Ratio Kills / Deaths" },
  adr: { label: "Dégâts/Tour (ADR)", desc: "Dégâts moyens par manche" },
  hs: { label: "Headshot %", desc: "Pourcentage de tirs à la tête" },
  wr: { label: "Win Rate", desc: "Pourcentage de victoires" },
  acs: { label: "ACS Moyen", desc: "Combat Score moyen" },
  fb: { label: "Premiers sangs", desc: "First bloods réalisés" },
  ace: { label: "ACE", desc: "Nombre de 1v5 / aces" },
  kast: { label: "KAST", desc: "% manches avec K/A/S/T" },
  dd: { label: "DDΔ / Round", desc: "Différence de dégâts par manche" },
  wins: { label: "Victoires", desc: "Nombre total de victoires" },
  matches: { label: "Parties", desc: "Nombre total de parties" },
};

// Check if two items overlap in 2D
function itemsOverlap(a: GridItemConfig, b: GridItemConfig): boolean {
  const aRight = a.x + a.colSpan;
  const aBottom = a.y + a.rowSpan;
  const bRight = b.x + b.colSpan;
  const bBottom = b.y + b.rowSpan;
  return a.x < bRight && aRight > b.x && a.y < bBottom && aBottom > b.y;
}

// Find first available slot scanning from top-left
function findFirstAvailableSlot(
  visibleItems: GridItemConfig[],
  colSpan: number,
  rowSpan: number,
  cols: number
): { x: number; y: number } {
  let maxSearchRow = 0;
  visibleItems.forEach((it) => {
    maxSearchRow = Math.max(maxSearchRow, it.y + it.rowSpan);
  });

  for (let y = 0; y <= maxSearchRow + 1; y++) {
    for (let x = 0; x <= cols - colSpan; x++) {
      const candidate: GridItemConfig = { id: "__candidate__", x, y, colSpan, rowSpan, visible: true };
      const hasOverlap = visibleItems.some((it) => itemsOverlap(candidate, it));
      if (!hasOverlap) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: maxSearchRow };
}

// Clean collision resolution on drop (only pushes conflicting items down)
function resolveCollisions(items: GridItemConfig[], movedId: string, cols: number): GridItemConfig[] {
  const result = items.map((i) => ({ ...i }));
  const moved = result.find((i) => i.id === movedId);
  if (!moved || !moved.visible) return result;

  // 1. Push any item colliding with the moved item
  for (const other of result) {
    if (other.id === movedId || !other.visible) continue;
    if (itemsOverlap(moved, other)) {
      other.y = moved.y + moved.rowSpan;
      if (other.x + other.colSpan > cols) {
        other.x = Math.max(0, cols - other.colSpan);
      }
    }
  }

  // 2. Cascade down any secondary overlaps
  for (let pass = 0; pass < 5; pass++) {
    let hadCascade = false;
    for (let i = 0; i < result.length; i++) {
      if (!result[i].visible) continue;
      for (let j = 0; j < result.length; j++) {
        if (i === j || !result[j].visible || result[j].id === movedId) continue;
        if (itemsOverlap(result[i], result[j])) {
          if (result[j].y >= result[i].y) {
            result[j].y = result[i].y + result[i].rowSpan;
            if (result[j].x + result[j].colSpan > cols) {
              result[j].x = Math.max(0, cols - result[j].colSpan);
            }
            hadCascade = true;
          }
        }
      }
    }
    if (!hadCascade) break;
  }

  return result;
}

export default function DashboardGrid({
  stats,
  warnings,
  smartRating,
  matchHistory,
  canEdit,
  hiddenStatsByPrivacy = [],
  userStorageKey = "default",
  initialGridData,
}: DashboardGridProps) {
  const storageKey = `spycam_grid_layout_v7_${userStorageKey}`;
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const [gridCols, setGridCols] = useState<number>(DEFAULT_COLS);
  const [layout, setLayout] = useState<GridItemConfig[]>(DEFAULT_LAYOUT);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Custom Smooth Mouse Dragging State
  const [draggingItem, setDraggingItem] = useState<{
    id: string;
    deltaX: number;
    deltaY: number;
    targetX: number;
    targetY: number;
  } | null>(null);

  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [resizeHint, setResizeHint] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [usableWidth, setUsableWidth] = useState<number>(900);

  // Measure usable width inside grid container accurately
  useEffect(() => {
    if (!gridContainerRef.current) return;
    const updateWidth = () => {
      if (gridContainerRef.current) {
        // Inner width excluding padding (16px on left and right when editing)
        const totalW = gridContainerRef.current.clientWidth;
        const pad = isEditing ? 32 : 0;
        setUsableWidth(Math.max(200, totalW - pad));
      }
    };
    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(gridContainerRef.current);
    return () => observer.disconnect();
  }, [isEditing]);

  // Square cell size: 1 column unit = 1 row unit
  const cellSize = useMemo(() => {
    const totalGaps = (gridCols - 1) * GRID_GAP;
    return Math.max(15, (usableWidth - totalGaps) / gridCols);
  }, [usableWidth, gridCols]);

  const step = useMemo(() => cellSize + GRID_GAP, [cellSize]);

  // Load layout from Neon DB or localStorage
  useEffect(() => {
    // 1. If visiting a profile or have initialGridData from Neon DB:
    if (initialGridData) {
      try {
        const parsed = typeof initialGridData === "string" ? JSON.parse(initialGridData) : initialGridData;
        if (parsed && typeof parsed === "object") {
          if (parsed.cols) setGridCols(parsed.cols);
          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            const existingIds = new Set(parsed.items.map((item: any) => item.id));
            const normalized = parsed.items.map((item: any) => ({
              id: item.id,
              x: item.x ?? 0,
              y: item.y ?? 0,
              colSpan: item.colSpan || (item.id === "chart" ? (parsed.cols || 12) : 3),
              rowSpan: item.rowSpan || (item.id === "chart" ? 2 : 1),
              visible: item.visible !== false,
            }));
            const missing = DEFAULT_LAYOUT.filter((item) => !existingIds.has(item.id));
            setLayout([...normalized, ...missing]);
            return;
          }
        }
      } catch {}
    }

    // 2. Fallback to localStorage
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          if (parsed.cols) setGridCols(parsed.cols);
          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            const existingIds = new Set(parsed.items.map((item: any) => item.id));
            const normalized = parsed.items.map((item: any) => ({
              id: item.id,
              x: item.x ?? 0,
              y: item.y ?? 0,
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
  }, [storageKey, initialGridData]);

  // Save layout locally and sync to Neon DB
  const saveState = useCallback(
    (newLayout: GridItemConfig[], cols = gridCols, syncToDatabase = false) => {
      setLayout(newLayout);
      const payload = { cols, items: newLayout };
      try {
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {}

      if (syncToDatabase && canEdit) {
        fetch("/api/user/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dashboardGrid: JSON.stringify(payload) }),
        }).catch((err) => console.warn("Erreur sauvegarde Neon:", err));
      }
    },
    [gridCols, storageKey, canEdit]
  );

  const handleResetLayout = () => {
    setGridCols(DEFAULT_COLS);
    saveState(DEFAULT_LAYOUT, DEFAULT_COLS, true);
    setDrawerOpen(false);
  };

  // Proportional scaling when changing gridCols density (clamped to max 29)
  const handleColumnsChange = (newCols: number) => {
    const clampedCols = Math.max(4, Math.min(29, newCols));
    const prevCols = gridCols;
    if (clampedCols === prevCols) return;

    const scale = clampedCols / prevCols;
    setGridCols(clampedCols);

    const totalGaps = (clampedCols - 1) * GRID_GAP;
    const newCellSize = Math.max(15, (usableWidth - totalGaps) / clampedCols);
    const newStep = newCellSize + GRID_GAP;

    const scaledLayout = layout.map((item) => {
      const isChart = item.id === "chart";
      const minRow = isChart ? Math.max(2, Math.ceil(130 / newStep)) : Math.max(1, Math.ceil(75 / newStep));
      const minCol = isChart ? Math.max(4, Math.ceil(240 / newStep)) : Math.max(1, Math.ceil(90 / newStep));

      const scaledCol = Math.max(minCol, Math.min(clampedCols, Math.round(item.colSpan * scale)));
      const scaledRow = Math.max(minRow, Math.round(item.rowSpan * scale));
      const scaledX = Math.min(clampedCols - scaledCol, Math.round(item.x * scale));
      const scaledY = Math.round(item.y * scale);

      return {
        ...item,
        x: Math.max(0, scaledX),
        y: Math.max(0, scaledY),
        colSpan: scaledCol,
        rowSpan: scaledRow,
      };
    });

    saveState(scaledLayout, clampedCols);
  };

  // Toggle item visibility with smart minimal-size restoration in top-most slot
  const toggleVisibility = (id: string, makeVisible?: boolean) => {
    const currentItem = layout.find((i) => i.id === id);
    if (!currentItem) return;

    const willBeVisible = makeVisible !== undefined ? makeVisible : !currentItem.visible;

    if (!willBeVisible) {
      const updated = layout.map((item) => (item.id === id ? { ...item, visible: false } : item));
      saveState(updated);
      return;
    }

    // When restoring to grid: set minimal readable size
    const isLargeWidget = id === "chart" || id === "weapons";
    const minRow = isLargeWidget ? Math.max(2, Math.ceil(130 / step)) : Math.max(1, Math.ceil(75 / step));
    const minCol = id === "chart"
      ? Math.min(gridCols, Math.max(6, Math.ceil(240 / step)))
      : id === "weapons"
      ? Math.min(gridCols, Math.max(4, Math.ceil(200 / step)))
      : Math.max(2, Math.min(gridCols, Math.ceil(95 / step)));

    const visibleItems = layout.filter((item) => item.visible && item.id !== id);
    const slot = findFirstAvailableSlot(visibleItems, minCol, minRow, gridCols);

    const updated = layout.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          x: slot.x,
          y: slot.y,
          colSpan: minCol,
          rowSpan: minRow,
          visible: true,
        };
      }
      return item;
    });

    saveState(updated);
  };

  // Custom 60fps Mouse Dragging (RAF Throttled, Zero Lag)
  const handleCardMouseDown = (e: React.MouseEvent, item: GridItemConfig) => {
    if (!isEditing || resizingItemId) return;
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest(".resize-handle")) {
      return;
    }

    e.preventDefault();
    sounds.playGrabWidget();

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = item.x;
    const startY = item.y;
    const spanW = Math.min(item.colSpan, gridCols);

    setDraggingItem({
      id: item.id,
      deltaX: 0,
      deltaY: 0,
      targetX: startX,
      targetY: startY,
    });

    let currentTargetX = startX;
    let currentTargetY = startY;
    let rafId: number | null = null;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const deltaX = moveEvent.clientX - startMouseX;
        const deltaY = moveEvent.clientY - startMouseY;

        const newTargetX = Math.max(0, Math.min(gridCols - spanW, Math.round(startX + deltaX / step)));
        const newTargetY = Math.max(0, Math.round(startY + deltaY / step));

        if (newTargetX !== currentTargetX || newTargetY !== currentTargetY) {
          sounds.playDragStep();
          currentTargetX = newTargetX;
          currentTargetY = newTargetY;
        }

        setDraggingItem({
          id: item.id,
          deltaX,
          deltaY,
          targetX: currentTargetX,
          targetY: currentTargetY,
        });
      });
    };

    const onMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      sounds.playDropWidget();
      setDraggingItem(null);

      setLayout((prev) => {
        const updated = prev.map((it) =>
          it.id === item.id ? { ...it, x: currentTargetX, y: currentTargetY, visible: true } : it
        );
        const resolved = resolveCollisions(updated, item.id, gridCols);
        saveState(resolved);
        return resolved;
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Interactive Edge Resizing
  const handleResizeStart = (
    e: React.MouseEvent,
    itemId: string,
    currentColSpan: number,
    currentRowSpan: number,
    direction: "horizontal" | "vertical"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    sounds.playGrabWidget();
    setResizingItemId(itemId);

    const startX = e.clientX;
    const startY = e.clientY;

    const isLarge = itemId === "chart" || itemId === "weapons";
    const minCol = isLarge ? 4 : 1;
    const minRow = isLarge ? 2 : 1;
    const currentItem = layout.find((i) => i.id === itemId);
    const startPosX = currentItem?.x ?? 0;

    let finalColSpan = currentColSpan;
    let finalRowSpan = currentRowSpan;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (direction === "horizontal") {
        const deltaX = moveEvent.clientX - startX;
        const colDelta = Math.round(deltaX / step);
        const maxCols = gridCols - startPosX;
        const newColSpan = Math.max(minCol, Math.min(maxCols, currentColSpan + colDelta));

        if (newColSpan !== finalColSpan) {
          sounds.playResizeStep();
          finalColSpan = newColSpan;
        }

        setResizeHint(`${finalColSpan} cols × ${currentRowSpan} lignes`);
        setLayout((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, colSpan: finalColSpan } : item))
        );
      } else {
        const deltaY = moveEvent.clientY - startY;
        const rowDelta = Math.round(deltaY / step);
        const newRowSpan = Math.max(minRow, Math.min(25, currentRowSpan + rowDelta));

        if (newRowSpan !== finalRowSpan) {
          sounds.playResizeStep();
          finalRowSpan = newRowSpan;
        }

        setResizeHint(`${currentColSpan} cols × ${finalRowSpan} lignes`);
        setLayout((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, rowSpan: finalRowSpan } : item))
        );
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      sounds.playDropWidget();
      setResizingItemId(null);
      setResizeHint(null);

      setLayout((prev) => {
        const resolved = resolveCollisions(prev, itemId, gridCols);
        saveState(resolved);
        return resolved;
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

  // Compute total rows needed
  const totalRows = useMemo(() => {
    let maxRow = 0;
    activeItems.forEach((item) => {
      maxRow = Math.max(maxRow, (item.y || 0) + (item.rowSpan || 1));
    });
    if (draggingItem) {
      const draggedConfig = layout.find((i) => i.id === draggingItem.id);
      if (draggedConfig) {
        maxRow = Math.max(maxRow, draggingItem.targetY + draggedConfig.rowSpan);
      }
    }
    return Math.max(1, maxRow);
  }, [activeItems, draggingItem, layout]);

  // Exact pixel height of the grid content
  const gridPixelHeight = totalRows * cellSize + Math.max(0, totalRows - 1) * GRID_GAP;

  // Render individual widget content
  const renderItemContent = (id: string) => {
    switch (id) {
      case "chart":
        return <PerformanceCharts matchHistory={matchHistory} />;
      case "weapons":
        return <WeaponHitmap matchHistory={matchHistory} stats={stats} />;
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
    <div className="w-full flex flex-col relative select-none">
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

                {/* Density Input */}
                <div className="flex items-center gap-2 bg-[var(--color-surface)]/80 border border-[var(--color-border)] px-2.5 py-1 rounded-xl backdrop-blur-md">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                      Colonnes
                    </label>
                    <input
                      type="number"
                      min={4}
                      max={29}
                      value={gridCols}
                      onChange={(e) => handleColumnsChange(Number(e.target.value) || 12)}
                      className="w-11 bg-black/60 border border-white/15 text-white rounded-lg px-1.5 py-0.5 text-center text-xs font-mono font-black focus:border-[var(--color-val-red)] focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-[var(--color-text-secondary)] opacity-60">
                    {Math.round(cellSize)}px/point
                  </span>
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
                    onClick={() => {
                      sounds.playClick();
                      setDrawerOpen(!drawerOpen);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer ${
                      drawerOpen
                        ? "bg-[var(--color-val-red)] border-[var(--color-val-red)] text-white shadow-md"
                        : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                    }`}
                  >
                    <IconAppGrid size={14} />
                    <span>Tiroir</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-black">
                      {hiddenDrawerItems.length}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    handleResetLayout();
                  }}
                  className="px-3 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  title="Réinitialiser l'agencement d'origine"
                >
                  Réinitialiser
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playLockIn();
                    setIsEditing(false);
                    setDrawerOpen(false);
                    saveState(layout, gridCols, true);
                    setSaveToast(true);
                    setTimeout(() => setSaveToast(false), 2500);
                  }}
                  className="px-4 py-1.5 bg-[var(--color-val-red)] hover:bg-[#ff5865] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,70,85,0.4)] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Terminer</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sounds.playTabSwitch();
                  setIsEditing(true);
                }}
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
          <span>Agencement enregistré !</span>
        </div>
      )}

      {/* Live Resize Tooltip Hint */}
      {resizeHint && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#0f1923] border border-[var(--color-val-red)] text-white px-4 py-2 rounded-full shadow-2xl text-xs font-black uppercase tracking-wider animate-pulse">
          📐 {resizeHint}
        </div>
      )}

      {/* Main Grid Container with exact padding boundary */}
      <div
        ref={gridContainerRef}
        className={`w-full transition-all duration-300 relative ${
          isEditing ? "p-4 rounded-3xl border-2 border-dashed border-[var(--color-val-red)]/40 bg-black/25" : ""
        }`}
      >
        {/* Inner Grid Area */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: isEditing ? `${gridPixelHeight}px` : "auto",
          }}
        >
          {/* SVG dots matrix: GPU-accelerated pattern (zero lag) */}
          {isEditing && (
            <svg
              width={usableWidth}
              height={gridPixelHeight}
              className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
            >
              <defs>
                <pattern
                  id="spycam-grid-dots"
                  width={step}
                  height={step}
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1.6" fill="rgba(255, 70, 85, 0.45)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#spycam-grid-dots)" />
            </svg>
          )}

          {/* Snapped Ghost Placeholder while dragging */}
          {isEditing && draggingItem && (
            <div
              style={{
                position: "absolute",
                left: `${draggingItem.targetX * step}px`,
                top: `${draggingItem.targetY * step}px`,
                width: `${(layout.find((i) => i.id === draggingItem.id)?.colSpan || 1) * cellSize + ((layout.find((i) => i.id === draggingItem.id)?.colSpan || 1) - 1) * GRID_GAP}px`,
                height: `${(layout.find((i) => i.id === draggingItem.id)?.rowSpan || 1) * cellSize + ((layout.find((i) => i.id === draggingItem.id)?.rowSpan || 1) - 1) * GRID_GAP}px`,
              }}
              className="rounded-2xl border-2 border-dashed border-[var(--color-val-red)]/70 bg-[var(--color-val-red)]/10 z-10 pointer-events-none transition-all duration-100 ease-out"
            />
          )}

          {!isEditing ? (
            // Normal Mode: responsive CSS Grid
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gridAutoRows: `${cellSize}px`,
                gap: `${GRID_GAP}px`,
              }}
              className="w-full"
            >
              {activeItems.map((item) => {
                const actualColSpan = Math.min(item.colSpan, gridCols);
                return (
                  <div
                    key={item.id}
                    style={{
                      gridColumn: `${item.x + 1} / span ${actualColSpan}`,
                      gridRow: `${item.y + 1} / span ${item.rowSpan}`,
                    }}
                    className="flex flex-col min-h-0 overflow-hidden"
                  >
                    <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden">
                      {renderItemContent(item.id)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Edit Mode: absolute positioning with 60fps smooth mouse drag
            activeItems.map((item) => {
              const isBeingDragged = draggingItem?.id === item.id;
              const isResizing = resizingItemId === item.id;
              const actualColSpan = Math.min(item.colSpan, gridCols);
              const left = item.x * step;
              const top = item.y * step;
              const w = actualColSpan * cellSize + (actualColSpan - 1) * GRID_GAP;
              const h = item.rowSpan * cellSize + (item.rowSpan - 1) * GRID_GAP;

              const transform = isBeingDragged
                ? `translate3d(${draggingItem.deltaX}px, ${draggingItem.deltaY}px, 0)`
                : "none";

              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleCardMouseDown(e, item)}
                  style={{
                    position: "absolute",
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    transform,
                    zIndex: isBeingDragged ? 50 : isResizing ? 40 : 20,
                    transition: isBeingDragged ? "none" : "left 0.2s ease, top 0.2s ease, width 0.15s ease, height 0.15s ease",
                  }}
                  className={`group/item select-none flex flex-col min-h-0 overflow-hidden ${
                    isBeingDragged
                      ? "opacity-90 scale-105 shadow-[0_15px_35px_rgba(0,0,0,0.8)] ring-2 ring-[var(--color-val-red)] rounded-2xl cursor-grabbing"
                      : isResizing
                      ? "ring-2 ring-[var(--color-val-red)] shadow-[0_0_20px_rgba(255,70,85,0.4)] rounded-2xl"
                      : "cursor-grab hover:shadow-xl"
                  }`}
                >
                  <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden pointer-events-none">
                    {renderItemContent(item.id)}
                  </div>

                  {/* Size & Coordinates Indicator */}
                  <div className="absolute top-2 left-2 z-20 opacity-0 group-hover/item:opacity-100 transition-opacity bg-black/85 backdrop-blur-md rounded-lg px-2 py-0.5 flex items-center gap-1 border border-white/15 select-none pointer-events-none shadow-md">
                    <span className="text-[10px] text-[var(--color-val-red)]">⋮⋮</span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-white">
                      {actualColSpan}×{item.rowSpan}
                    </span>
                  </div>

                  {/* Red "-" Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(item.id, false);
                    }}
                    title="Retirer"
                    className="absolute -top-2.5 -right-2.5 z-30 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-base flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.8)] border-2 border-[#0a0e13] transition-transform hover:scale-115 cursor-pointer opacity-0 group-hover/item:opacity-100"
                  >
                    −
                  </button>

                  {/* Right resize handle */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, item.id, actualColSpan, item.rowSpan, "horizontal")}
                    className="resize-handle absolute -right-2.5 top-1/2 -translate-y-1/2 z-30 w-4 h-12 bg-[#0f1923]/95 hover:bg-[var(--color-val-red)] border border-white/30 hover:border-white rounded-full flex items-center justify-center cursor-ew-resize shadow-lg transition-all hover:scale-110 opacity-0 group-hover/item:opacity-100 group/handle"
                  >
                    <div className="w-1 h-6 bg-white/70 rounded-full group-hover/handle:bg-white"></div>
                  </div>

                  {/* Bottom resize handle */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, item.id, actualColSpan, item.rowSpan, "vertical")}
                    className="resize-handle absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-30 h-4 w-12 bg-[#0f1923]/95 hover:bg-[var(--color-val-red)] border border-white/30 hover:border-white rounded-full flex items-center justify-center cursor-ns-resize shadow-lg transition-all hover:scale-110 opacity-0 group-hover/item:opacity-100 group/handle"
                  >
                    <div className="h-1 w-6 bg-white/70 rounded-full group-hover/handle:bg-white"></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Drawer for Hidden Widgets */}
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
                — Cliquez sur &quot;+&quot; pour remettre dans la grille
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
              const meta = ITEM_LABELS[hiddenItem.id] || { label: hiddenItem.id, desc: "" };
              const iconEl = ITEM_ICONS[hiddenItem.id] || <IconChart size={14} />;
              return (
                <div
                  key={hiddenItem.id}
                  className="glass-panel p-3 rounded-xl border border-[var(--color-border)] hover:border-emerald-500/50 transition-all flex items-center justify-between gap-2 group bg-black/40 hover:bg-emerald-500/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[var(--color-text-secondary)]">{iconEl}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">{meta.label}</span>
                      <span className="text-[9px] text-[var(--color-text-secondary)] opacity-70 truncate">{meta.desc}</span>
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
