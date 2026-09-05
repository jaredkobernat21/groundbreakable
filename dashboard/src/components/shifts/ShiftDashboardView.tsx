"use client";

import { useMemo, useState } from "react";
import type { Market, ProjectWithSource, ShiftCategory, ShiftWithSource, ZoningLandUseWithSource } from "@/lib/types";
import { ACTIVE_SHIFT_CATEGORIES, shiftDateRangeToDate, type ShiftDateRange } from "@/lib/shiftConstants";
import BriefingSummary from "./BriefingSummary";
import ShiftFilters from "./ShiftFilters";
import ShiftMap from "./ShiftMap";
import ShiftFeed from "./ShiftFeed";
import ShiftDetailPanel from "./ShiftDetailPanel";
import ProjectsList from "./ProjectsList";
import BuildabilityMap from "./BuildabilityMap";
import BuildabilityList from "./BuildabilityList";
import BuildabilityDetailPanel from "./BuildabilityDetailPanel";

type View = "momentum" | "projects" | "permits" | "buildability";

// Per Jared (2026-09-04): Projects/Permits are real sidebar destinations
// (persistent nav, far-left, full height) since they're list-first
// surfaces; Momentum/Buildability are map-first, so they're a small
// layer toggle sitting directly above the map instead -- both control
// groups just set the same `view` state, they're only visually grouped
// differently. All four buttons stay visible at all times (in their
// respective spot) so there's always a way back to any of the four,
// regardless of which is currently active.
const SIDEBAR_TABS: { value: View; label: string }[] = [
  { value: "projects", label: "Projects" },
  { value: "permits", label: "Permits" },
];
const MAP_LAYER_TABS: { value: View; label: string }[] = [
  { value: "momentum", label: "Momentum" },
  { value: "buildability", label: "Buildability" },
];

export default function ShiftDashboardView({
  market,
  shifts,
  projects,
  buildabilityZones,
}: {
  market: Market;
  shifts: ShiftWithSource[];
  projects: ProjectWithSource[];
  buildabilityZones: ZoningLandUseWithSource[];
}) {
  const [view, setView] = useState<View>("momentum");
  const [categories, setCategories] = useState<Set<ShiftCategory>>(new Set(ACTIVE_SHIFT_CATEGORIES));
  const [range, setRange] = useState<ShiftDateRange>("7d");
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  function toggleCategory(category: ShiftCategory) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const filteredShifts = useMemo(() => {
    const since = shiftDateRangeToDate(range);
    return shifts.filter((s) => categories.has(s.category) && s.event_date >= since);
  }, [shifts, categories, range]);

  const permits = useMemo(() => shifts.filter((s) => s.category === "building"), [shifts]);

  const selectedShift = filteredShifts.find((s) => s.id === selectedShiftId) ?? null;
  const selectedPermit = permits.find((s) => s.id === selectedPermitId) ?? null;
  const selectedZone = buildabilityZones.find((z) => z.id === selectedZoneId) ?? null;

  function tabButtonClass(active: boolean, block: boolean) {
    return `rounded-lg px-3 py-2 text-left text-sm font-medium transition ${block ? "lg:w-full" : ""} ${
      active ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
    }`;
  }

  return (
    <div className="space-y-3">
      <BriefingSummary shifts={shifts} projects={projects} buildabilityZones={buildabilityZones} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <nav className="flex shrink-0 gap-1 lg:w-44 lg:flex-col lg:gap-0.5">
          {SIDEBAR_TABS.map((tab) => (
            <button key={tab.value} type="button" onClick={() => setView(tab.value)} className={tabButtonClass(view === tab.value, true)}>
              {tab.label}
              {tab.value === "projects" && ` (${projects.length})`}
              {tab.value === "permits" && ` (${permits.length})`}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-3">
          {(view === "momentum" || view === "buildability") && (
            <div className="flex items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1 w-fit">
              {MAP_LAYER_TABS.map((tab) => (
                <button key={tab.value} type="button" onClick={() => setView(tab.value)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  view === tab.value ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
                }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {view === "momentum" && (
            <>
              <ShiftFilters categories={categories} onToggleCategory={toggleCategory} range={range} onSelectRange={setRange} />

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
                <div className="relative h-[640px]">
                  <ShiftMap
                    market={market}
                    shifts={filteredShifts}
                    selectedShiftId={selectedShiftId}
                    onSelectShift={setSelectedShiftId}
                  />
                  {selectedShift && <ShiftDetailPanel shift={selectedShift} onClose={() => setSelectedShiftId(null)} />}
                </div>

                <div className="h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                  <ShiftFeed shifts={filteredShifts} selectedShiftId={selectedShiftId} onSelectShift={setSelectedShiftId} />
                </div>
              </div>

              {shifts.length === 0 && (
                <p className="text-sm text-[#1c1c1c]/40">
                  No shifts recorded yet for {market.name} — this market hasn't been researched yet.
                </p>
              )}
            </>
          )}

          {view === "projects" && (
            <div className="max-h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
              <ProjectsList projects={projects} />
            </div>
          )}

          {view === "permits" && (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
              <div className="relative h-[640px]">
                <ShiftMap market={market} shifts={permits} selectedShiftId={selectedPermitId} onSelectShift={setSelectedPermitId} />
                {selectedPermit && <ShiftDetailPanel shift={selectedPermit} onClose={() => setSelectedPermitId(null)} />}
              </div>
              <div className="h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                <ShiftFeed shifts={permits} selectedShiftId={selectedPermitId} onSelectShift={setSelectedPermitId} />
              </div>
            </div>
          )}

          {view === "buildability" && (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
              <div className="relative h-[640px]">
                <BuildabilityMap
                  market={market}
                  zones={buildabilityZones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                />
                {selectedZone && (
                  <div className="absolute bottom-3 left-3 right-3 max-h-[300px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white shadow-lg">
                    <BuildabilityDetailPanel zone={selectedZone} onClose={() => setSelectedZoneId(null)} />
                  </div>
                )}
              </div>
              <div className="h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
                <BuildabilityList zones={buildabilityZones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
