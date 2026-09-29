"use client";

import type { CatalystWithSources } from "@/lib/types";
import { CATALYSTS_COLOR, CATALYST_STATUS_LABEL, CATALYST_TYPE_LABEL } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

// Same three-tier row hierarchy as PlansFeed/OpportunityFeed (Jared,
// 2026-09-29's sidebar restructure gave Catalysts a real feed for the
// first time): small metadata line, primary title, secondary detail --
// every field shown is a real column, nothing derived/invented for the
// sake of filling out a row.
export default function CatalystFeed({
  catalysts,
  selectedCatalystId,
  onSelectCatalyst,
}: {
  catalysts: CatalystWithSources[];
  selectedCatalystId: string | null;
  onSelectCatalyst: (id: string) => void;
}) {
  if (catalysts.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">No catalysts identified yet for this market.</p>;
  }

  return (
    <ul className="divide-y divide-[#1c1c1c]/8">
      {catalysts.map((catalyst) => {
        const selected = catalyst.id === selectedCatalystId;
        return (
          <li key={catalyst.id}>
            <button
              type="button"
              onClick={() => onSelectCatalyst(catalyst.id)}
              className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[#1c1c1c]/[0.03] ${
                selected ? "bg-[#1c1c1c]/[0.05]" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                <span className="rounded-full px-2 py-0.5" style={{ color: CATALYSTS_COLOR, backgroundColor: `${CATALYSTS_COLOR}1a` }}>
                  {CATALYST_TYPE_LABEL[catalyst.catalyst_type]}
                </span>
                {catalyst.is_spotlight && (
                  <span className="rounded-full bg-[#1c1c1c]/8 px-2 py-0.5 text-[#1c1c1c]/60">Spotlight</span>
                )}
                <span className="ml-auto text-[#1c1c1c]/40">{CATALYST_STATUS_LABEL[catalyst.status]}</span>
              </div>

              <span className="truncate text-sm font-medium text-[#1c1c1c]">⚡ {catalyst.title}</span>
              <span className="truncate text-xs text-[#1c1c1c]/45">{catalyst.address ?? "Location not identified"}</span>

              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#1c1c1c]/50">
                {catalyst.estimated_value != null && <span>{formatCurrency(catalyst.estimated_value)}</span>}
                {catalyst.estimated_scale_note && <span>{catalyst.estimated_scale_note}</span>}
                {catalyst.expected_timeline && <span>{catalyst.expected_timeline}</span>}
                {catalyst.date_announced && <span>{formatDate(catalyst.date_announced)}</span>}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
