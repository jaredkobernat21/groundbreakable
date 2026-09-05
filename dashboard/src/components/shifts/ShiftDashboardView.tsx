"use client";

import { useMemo, useState } from "react";
import type {
  Market,
  ProjectWithSource,
  ShiftAudience,
  ShiftCategory,
  ShiftWithSource,
  ZoningLandUseWithSource,
} from "@/lib/types";
import { ACTIVE_SHIFT_CATEGORIES, shiftDateRangeToDate, type ShiftDateRange } from "@/lib/shiftConstants";
import ShiftFilters from "./ShiftFilters";
import ShiftMap from "./ShiftMap";
import ShiftFeed from "./ShiftFeed";
import ShiftDetailPanel from "./ShiftDetailPanel";
import ProjectsList from "./ProjectsList";
import BuildabilityMap from "./BuildabilityMap";
import BuildabilityList from "./BuildabilityList";
import BuildabilityDetailPanel from "./BuildabilityDetailPanel";

type View = "momentum" | "projects" | "permits" | "buildability";

const TABS: { value: View; label: string }[] = [
  { value: "momentum", label: "Momentum" },
  { value: "projects", label: "Projects" },
  { value: "permits", label: "Permits" },
  { value: "buildability", label: "Buildability" },
];

// Orchestrates all four dashboard surfaces as one reusable unit, same role
// DevelopmentIntelligenceView played for the old pillar model:
// - Momentum: the shift change-log (map + feed + filters) -- what's
//   labeled `shifts`/`ShiftCategory` internally throughout the codebase
//   (renaming every type/table for a UI label wasn't worth the churn),
//   just relabeled "Momentum" in this tab per Jared's naming.
// - Projects: persistent "what's currently active" state (getActiveProjects),
//   not date- or category-scoped at all.
// - Permits: the same shift data as Momentum, hard-filtered to
//   category='building' -- no separate schema, just a fixed view over
//   shifts (Jared's choice: a filter, not a new permit-tracking table).
// - Buildability: zoning-district polygons + what-can-be-built info
//   (getBuildabilityZones), map + list + detail panel, unrelated to dates.
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
  const [audience, setAudience] = useState<ShiftAudience | "all">("all");
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
    return shifts.filter(
      (s) =>
        categories.has(s.category) &&
        s.event_date >= since &&
        (audience === "all" || s.audience.includes(audience))
    );
  }, [shifts, categories, range, audience]);

  const permits = useMemo(() => shifts.filter((s) => s.category === "building"), [shifts]);

  const selectedShift = filteredShifts.find((s) => s.id === selectedShiftId) ?? null;
  const selectedPermit = permits.find((s) => s.id === selectedPermitId) ?? null;
  const selectedZone = buildabilityZones.find((z) => z.id === selectedZoneId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setView(tab.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              view === tab.value ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
            }`}
          >
            {tab.label}
            {tab.value === "projects" && ` (${projects.length})`}
            {tab.value === "permits" && ` (${permits.length})`}
          </button>
        ))}
      </div>

      {view === "momentum" && (
        <>
          <ShiftFilters
            categories={categories}
            onToggleCategory={toggleCategory}
            range={range}
            onSelectRange={setRange}
            audience={audience}
            onSelectAudience={setAudience}
          />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px]">
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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px]">
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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px]">
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
  );
}
