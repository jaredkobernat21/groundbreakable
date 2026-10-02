"use client";

import { useEffect, useRef, useState } from "react";
import type { CatalystWithSources } from "@/lib/types";
import { CATALYST_STAGE_GROUP, CATALYST_STAGE_GROUP_LABEL, catalystColorHex, type CatalystStageGroup } from "@/lib/catalystTypeColors";
import { computeDcStage, DC_STAGE_COLOR_HEX } from "@/lib/catalysts/dcStage";
import { CatalystDetails } from "./CatalystIntelligencePanel";

type SnapPoint = "peek" | "half" | "full";

// Fraction of viewport height for each snap point. "peek" leaves the map
// almost entirely visible (just the handle + a one-line summary), "half" is
// the default -- enough room for the idle summary or a selected project's
// headline without hiding most of the map -- and "full" is what "View
// Project" (below) expands to for the complete CatalystDetails content.
const SNAP_VH: Record<SnapPoint, number> = { peek: 16, half: 46, full: 86 };
const STAGE_ORDER: CatalystStageGroup[] = ["proposed", "approved", "funded", "under_construction", "completed"];

function markerColor(catalyst: CatalystWithSources): string {
  const dcStage = computeDcStage(catalyst);
  return dcStage ? DC_STAGE_COLOR_HEX[dcStage] : catalystColorHex(catalyst);
}

// Mobile-only (rendered with `sm:hidden` by the caller) draggable sheet that
// replaces two separate desktop affordances -- the map's idle state (no
// equivalent desktop panel; desktop just shows the bare map) and
// CatalystIntelligencePanel's floating card -- with one bottom sheet, per
// Jared's "map should be full-screen on mobile, results/selection live in a
// sheet over it" spec (2026-10-02). Reuses CatalystDetails rather than
// rebuilding the project-detail rendering.
export default function MobileBottomSheet({
  visibleCatalysts,
  allCatalysts,
  selectedCatalyst,
  isFollowing,
  onToggleFollow,
  onSelectCatalyst,
  onFlyTo,
  onOpenFilters,
  onOpenFollowing,
}: {
  visibleCatalysts: CatalystWithSources[];
  allCatalysts: CatalystWithSources[];
  selectedCatalyst: CatalystWithSources | null;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onSelectCatalyst: (id: string | null) => void;
  onFlyTo: (center: [number, number], zoom?: number) => void;
  onOpenFilters: () => void;
  onOpenFollowing: () => void;
}) {
  const [snap, setSnap] = useState<SnapPoint>("half");
  const [dragHeightPx, setDragHeightPx] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  // A new selection (or a deselect, back to the idle view) always resets to
  // the default "half" snap -- otherwise a sheet left at "full" from a
  // previous project, or dragged to "peek", would hide the next project's
  // key details right when the marker tap should surface them.
  useEffect(() => {
    setSnap("half");
    setDragHeightPx(null);
  }, [selectedCatalyst?.id]);

  function snapPx(point: SnapPoint): number {
    return (window.innerHeight * SNAP_VH[point]) / 100;
  }

  function handlePointerDown(e: React.PointerEvent) {
    const el = sheetRef.current;
    if (!el) return;
    dragRef.current = { startY: e.clientY, startHeight: el.getBoundingClientRect().height };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const delta = dragRef.current.startY - e.clientY;
    const next = Math.min(window.innerHeight * 0.92, Math.max(window.innerHeight * 0.12, dragRef.current.startHeight + delta));
    setDragHeightPx(next);
  }

  function handlePointerUp() {
    if (!dragRef.current) return;
    const current = dragHeightPx ?? snapPx(snap);
    let nearest: SnapPoint = "half";
    let best = Infinity;
    for (const point of ["peek", "half", "full"] as SnapPoint[]) {
      const d = Math.abs(snapPx(point) - current);
      if (d < best) {
        best = d;
        nearest = point;
      }
    }
    dragRef.current = null;
    setDragHeightPx(null);
    setSnap(nearest);
  }

  const stageCounts = visibleCatalysts.reduce(
    (acc, c) => {
      const group = CATALYST_STAGE_GROUP[c.status];
      if (group) acc[group] = (acc[group] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<CatalystStageGroup, number>>
  );

  const dragging = dragHeightPx != null;

  return (
    <div
      ref={sheetRef}
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 sm:hidden"
      style={{
        height: dragging ? `${dragHeightPx}px` : `${SNAP_VH[snap]}vh`,
        transition: dragging ? "none" : "height 220ms ease",
      }}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex shrink-0 touch-none flex-col items-center gap-2 py-3"
        >
          <span className="h-1.5 w-10 rounded-full bg-white/25" />
        </div>

        <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
          {selectedCatalyst ? (
            <>
              <div className="flex items-center justify-between gap-3 pb-1">
                <button
                  type="button"
                  onClick={() => setSnap(snap === "full" ? "half" : "full")}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white"
                >
                  {snap === "full" ? "Collapse" : "View Project"}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCatalyst(null)}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/50"
                >
                  ✕
                </button>
              </div>
              <CatalystDetails catalyst={selectedCatalyst} allCatalysts={allCatalysts} isFollowing={isFollowing} onToggleFollow={onToggleFollow} />
            </>
          ) : (
            <>
              <div className="flex items-baseline justify-between pb-1">
                <div>
                  <p className="text-2xl font-semibold text-white">{visibleCatalysts.length}</p>
                  <p className="text-xs text-white/40">Projects visible on map</p>
                </div>
              </div>

              {Object.keys(stageCounts).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {STAGE_ORDER.filter((stage) => stageCounts[stage]).map((stage) => (
                    <span key={stage} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">
                      <span className="font-semibold text-white">{stageCounts[stage]}</span> {CATALYST_STAGE_GROUP_LABEL[stage]}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={onOpenFilters}
                  className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-white active:bg-white/10"
                >
                  Filters
                </button>
                <button
                  type="button"
                  onClick={onOpenFollowing}
                  className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-white active:bg-white/10"
                >
                  Following
                </button>
              </div>

              {visibleCatalysts.length > 0 && (
                <div className="mt-5 space-y-1.5">
                  {visibleCatalysts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelectCatalyst(c.id);
                        onFlyTo([c.longitude, c.latitude], 11);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 px-3 py-2.5 text-left"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: markerColor(c) }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white/85">{c.title}</span>
                        {c.address && <span className="block truncate text-xs text-white/40">{c.address}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
