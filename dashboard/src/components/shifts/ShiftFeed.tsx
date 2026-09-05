"use client";

import type { ShiftWithSource } from "@/lib/types";
import {
  SHIFT_CATEGORY_COLOR,
  SHIFT_CATEGORY_ICON_PATHS,
  SHIFT_CATEGORY_LABEL,
  SHIFT_IMPACT_COLOR,
  SHIFT_IMPACT_LABEL,
} from "@/lib/shiftConstants";
import { formatDate } from "@/lib/format";
import Icon from "./Icon";

// Shifts are a change-log, not just map pins -- this feed (sorted event_date
// desc, same order as the getShifts query) is the dashboard's primary
// surface alongside the map. Clicking a card opens the same ShiftDetailPanel
// a map marker click would.
export default function ShiftFeed({
  shifts,
  selectedShiftId,
  onSelectShift,
}: {
  shifts: ShiftWithSource[];
  selectedShiftId: string | null;
  onSelectShift: (id: string) => void;
}) {
  if (shifts.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">No shifts match the current filters.</p>;
  }

  return (
    <ul className="divide-y divide-[#1c1c1c]/8">
      {shifts.map((shift) => (
        <li key={shift.id}>
          <button
            type="button"
            onClick={() => onSelectShift(shift.id)}
            className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-[#1c1c1c]/[0.03] ${
              shift.id === selectedShiftId ? "bg-[#1c1c1c]/[0.05]" : ""
            }`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${SHIFT_CATEGORY_COLOR[shift.category]}1a`, color: SHIFT_CATEGORY_COLOR[shift.category] }}
            >
              <Icon paths={SHIFT_CATEGORY_ICON_PATHS[shift.category]} className="h-4 w-4" strokeWidth={2} />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                <span style={{ color: SHIFT_CATEGORY_COLOR[shift.category] }}>{SHIFT_CATEGORY_LABEL[shift.category]}</span>
                <span className="text-[#1c1c1c]/30">·</span>
                <span className="text-[#1c1c1c]/40">{formatDate(shift.event_date)}</span>
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[10px] normal-case tracking-normal"
                  style={{ color: SHIFT_IMPACT_COLOR[shift.impact], backgroundColor: `${SHIFT_IMPACT_COLOR[shift.impact]}1a` }}
                >
                  {SHIFT_IMPACT_LABEL[shift.impact]} impact
                </span>
              </div>
              <span className="text-sm font-medium text-[#1c1c1c]">{shift.event}</span>
              {(shift.stage || shift.address) && (
                <span className="text-xs text-[#1c1c1c]/45">{[shift.stage, shift.address].filter(Boolean).join(" · ")}</span>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
