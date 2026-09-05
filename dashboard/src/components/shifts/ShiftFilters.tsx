"use client";

import type { ShiftCategory } from "@/lib/types";
import { ACTIVE_SHIFT_CATEGORIES, SHIFT_CATEGORY_COLOR, SHIFT_CATEGORY_LABEL, SHIFT_DATE_RANGES, type ShiftDateRange } from "@/lib/shiftConstants";

// The Momentum filter surface: category toggle chips (multi-select, all on
// by default) plus the date-range control. The range control is a native
// select -- collapsed to the current choice by default (Last 7 days),
// with 30d/90d/All only shown once opened -- rather than a row of
// always-visible buttons, matching the same "highlight the active one,
// keep the rest out of the way" convention as MarketSwitcher. The
// audience/persona dropdown was removed (2026-09-04, per Jared) rather
// than kept with its "Everyone" default -- nobody was using persona
// filtering yet, and a dropdown that can only ever be usefully narrowed,
// never meaningfully cleared, wasn't earning its place in the bar.
export default function ShiftFilters({
  categories,
  onToggleCategory,
  range,
  onSelectRange,
}: {
  categories: Set<ShiftCategory>;
  onToggleCategory: (category: ShiftCategory) => void;
  range: ShiftDateRange;
  onSelectRange: (range: ShiftDateRange) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        {ACTIVE_SHIFT_CATEGORIES.map((category) => {
          const active = categories.has(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggleCategory(category)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-transparent bg-[#1c1c1c] text-white"
                  : "border-[#1c1c1c]/15 bg-transparent text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: SHIFT_CATEGORY_COLOR[category], opacity: active ? 1 : 0.5 }}
              />
              {SHIFT_CATEGORY_LABEL[category]}
            </button>
          );
        })}
      </div>

      <select
        value={range}
        onChange={(e) => onSelectRange(e.target.value as ShiftDateRange)}
        className="ml-auto rounded-full border border-[#1c1c1c]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40"
      >
        {SHIFT_DATE_RANGES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
