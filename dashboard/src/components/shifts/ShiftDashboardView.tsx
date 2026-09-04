"use client";

import { useMemo, useState } from "react";
import type { Market, ShiftAudience, ShiftCategory, ShiftWithSource } from "@/lib/types";
import { shiftDateRangeToDate, type ShiftDateRange } from "@/lib/shiftConstants";
import ShiftFilters from "./ShiftFilters";
import ShiftMap from "./ShiftMap";
import ShiftFeed from "./ShiftFeed";
import ShiftDetailPanel from "./ShiftDetailPanel";

const ALL_CATEGORIES: ShiftCategory[] = [
  "ownership",
  "distress",
  "compliance",
  "development",
  "construction",
  "infrastructure",
];

// Orchestrates filters + map + feed + detail panel as one reusable unit,
// same role DevelopmentIntelligenceView played for the old pillar model.
// `shifts` is the server-fetched 30-day superset (the widest window the
// filter bar offers) -- every filter (range/category/audience) narrows it
// client-side, so switching between 7d/30d or toggling a category is
// instant with no round-trip.
export default function ShiftDashboardView({ market, shifts }: { market: Market; shifts: ShiftWithSource[] }) {
  const [categories, setCategories] = useState<Set<ShiftCategory>>(new Set(ALL_CATEGORIES));
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
    </div>
  );
}
