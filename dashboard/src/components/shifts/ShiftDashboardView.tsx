"use client";

import { useMemo, useState } from "react";
import type { Market, ProjectWithSource, ShiftAudience, ShiftCategory, ShiftWithSource } from "@/lib/types";
import { ACTIVE_SHIFT_CATEGORIES, shiftDateRangeToDate, type ShiftDateRange } from "@/lib/shiftConstants";
import ShiftFilters from "./ShiftFilters";
import ShiftMap from "./ShiftMap";
import ShiftFeed from "./ShiftFeed";
import ShiftDetailPanel from "./ShiftDetailPanel";
import ProjectsList from "./ProjectsList";

// Orchestrates filters + map + feed + detail panel as one reusable unit,
// same role DevelopmentIntelligenceView played for the old pillar model.
// `shifts` is the server-fetched "all time" superset (the widest window
// the filter bar offers) -- every filter (range/category/audience) narrows
// it client-side, so switching between 7d/30d/90d/all or toggling a
// category is instant with no round-trip. `projects` is a second, simpler
// feed -- persistent "what's currently active" state (see
// getActiveProjects) rather than a point-in-time change-log -- toggled
// via the Shifts/Projects tab rather than mixed into the shift filters,
// since it isn't date- or shift-category-scoped at all.
export default function ShiftDashboardView({
  market,
  shifts,
  projects,
}: {
  market: Market;
  shifts: ShiftWithSource[];
  projects: ProjectWithSource[];
}) {
  const [view, setView] = useState<"shifts" | "projects">("shifts");
  const [categories, setCategories] = useState<Set<ShiftCategory>>(new Set(ACTIVE_SHIFT_CATEGORIES));
  const [range, setRange] = useState<ShiftDateRange>("7d");
  const [audience, setAudience] = useState<ShiftAudience | "all">("all");
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

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

  const selectedShift = filteredShifts.find((s) => s.id === selectedShiftId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1 w-fit">
        <button
          type="button"
          onClick={() => setView("shifts")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            view === "shifts" ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
          }`}
        >
          Shifts
        </button>
        <button
          type="button"
          onClick={() => setView("projects")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            view === "projects" ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
          }`}
        >
          Projects ({projects.length})
        </button>
      </div>

      {view === "shifts" ? (
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
      ) : (
        <div className="max-h-[640px] overflow-y-auto rounded-xl border border-[#1c1c1c]/10 bg-white">
          <ProjectsList projects={projects} />
        </div>
      )}
    </div>
  );
}
