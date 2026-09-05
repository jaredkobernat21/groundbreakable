"use client";

import type { ZoningLandUseWithSource } from "@/lib/types";

// The Buildability tab's list side, same "click a card, see the detail
// panel" pattern as ShiftFeed -- one row per researched zoning district
// rather than a chronological feed, since buildability isn't dated.
export default function BuildabilityList({
  zones,
  selectedZoneId,
  onSelectZone,
}: {
  zones: ZoningLandUseWithSource[];
  selectedZoneId: string | null;
  onSelectZone: (id: string) => void;
}) {
  if (zones.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">No buildability data recorded yet for this market.</p>;
  }

  return (
    <ul className="divide-y divide-[#1c1c1c]/8">
      {zones.map((zone) => (
        <li key={zone.id}>
          <button
            type="button"
            onClick={() => onSelectZone(zone.id)}
            className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-[#1c1c1c]/[0.03] ${
              zone.id === selectedZoneId ? "bg-[#1c1c1c]/[0.05]" : ""
            }`}
          >
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">{zone.district_code}</span>
            <span className="text-sm font-medium text-[#1c1c1c]">{zone.title}</span>
            {zone.buildability_summary && (
              <span className="line-clamp-2 text-xs text-[#1c1c1c]/50">{zone.buildability_summary}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
