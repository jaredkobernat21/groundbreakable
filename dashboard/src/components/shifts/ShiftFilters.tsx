"use client";

import type { ShiftAudience, ShiftCategory } from "@/lib/types";
import {
  ACTIVE_SHIFT_CATEGORIES,
  SHIFT_AUDIENCE_LABEL,
  SHIFT_CATEGORY_COLOR,
  SHIFT_CATEGORY_LABEL,
  SHIFT_DATE_RANGES,
  type ShiftDateRange,
} from "@/lib/shiftConstants";

const ALL_AUDIENCES = Object.keys(SHIFT_AUDIENCE_LABEL) as ShiftAudience[];

// The whole filter surface: category toggle chips (multi-select, all on
// by default), the 7d/30d/90d/all date-range control, and an
// audience/persona dropdown. Purely client-side state -- the server fetch
// already covers the widest window ("all"); narrowing to any shorter range
// or a category/persona subset is instant, no round-trip. See
// ShiftDashboardView.
export default function ShiftFilters({
  categories,
  onToggleCategory,
  range,
  onSelectRange,
  audience,
  onSelectAudience,
}: {
  categories: Set<ShiftCategory>;
  onToggleCategory: (category: ShiftCategory) => void;
  range: ShiftDateRange;
  onSelectRange: (range: ShiftDateRange) => void;
  audience: ShiftAudience | "all";
  onSelectAudience: (audience: ShiftAudience | "all") => void;
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

      <div className="ml-auto flex items-center gap-2">
        <select
          value={audience}
          onChange={(e) => onSelectAudience(e.target.value as ShiftAudience | "all")}
          className="rounded-full border border-[#1c1c1c]/15 bg-transparent px-3 py-1.5 text-xs font-medium text-[#1c1c1c]/70"
        >
          <option value="all">Everyone</option>
          {ALL_AUDIENCES.map((a) => (
            <option key={a} value={a}>
              {SHIFT_AUDIENCE_LABEL[a]}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1">
          {SHIFT_DATE_RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onSelectRange(r.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                range === r.value ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
