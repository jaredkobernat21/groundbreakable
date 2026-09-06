"use client";

import type { ShiftWithSource } from "@/lib/types";
import {
  INFRASTRUCTURE_TYPE_COLOR,
  INFRASTRUCTURE_TYPE_LABEL,
  extractInfrastructureCost,
  inferInfrastructureType,
} from "@/lib/infrastructureConstants";
import { formatCurrency, formatDate } from "@/lib/format";

// Same list-card idiom as ShiftFeed, but Infrastructure gets its own
// component rather than overloading the generic one: a sub-type badge
// (Roads/Water/Sewer/...) in place of the redundant category badge (every
// row here is already category="infrastructure"), plus estimated cost
// when the source actually reported one.
export default function InfrastructureFeed({
  shifts,
  selectedShiftId,
  onSelectShift,
}: {
  shifts: ShiftWithSource[];
  selectedShiftId: string | null;
  onSelectShift: (id: string) => void;
}) {
  if (shifts.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">No infrastructure activity matches the current filters.</p>;
  }

  return (
    <ul className="divide-y divide-[#1c1c1c]/8">
      {shifts.map((shift) => {
        const type = inferInfrastructureType(shift.shift_type);
        const color = INFRASTRUCTURE_TYPE_COLOR[type];
        const cost = extractInfrastructureCost(shift.raw_data);

        return (
          <li key={shift.id}>
            <button
              type="button"
              onClick={() => onSelectShift(shift.id)}
              className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[#1c1c1c]/[0.03] ${
                shift.id === selectedShiftId ? "bg-[#1c1c1c]/[0.05]" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                <span className="rounded-full px-2 py-0.5" style={{ color, backgroundColor: `${color}1a` }}>
                  {INFRASTRUCTURE_TYPE_LABEL[type]}
                </span>
                <span className="text-[#1c1c1c]/30">·</span>
                <span className="text-[#1c1c1c]/40">{formatDate(shift.event_date)}</span>
                {cost != null && <span className="ml-auto text-xs font-medium text-[#1c1c1c]/50">{formatCurrency(cost)}</span>}
              </div>

              <span className="text-sm font-medium text-[#1c1c1c]">{shift.event}</span>

              {(shift.stage || shift.address) && (
                <span className="text-xs text-[#1c1c1c]/45">{[shift.stage, shift.address].filter(Boolean).join(" · ")}</span>
              )}

              {shift.source?.agency && <span className="text-[10px] text-[#1c1c1c]/35">{shift.source.agency}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
