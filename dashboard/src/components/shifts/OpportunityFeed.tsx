"use client";

import type { DevelopmentOpportunityWithSources } from "@/lib/types";
import { OPPORTUNITY_STRENGTH_LABEL } from "@/lib/types";
import { OPPORTUNITY_STRENGTH_COLOR, opportunitySignalLabel } from "@/lib/opportunityConstants";
import { formatDate } from "@/lib/format";

export default function OpportunityFeed({
  opportunities,
  selectedOpportunityId,
  onSelectOpportunity,
}: {
  opportunities: DevelopmentOpportunityWithSources[];
  selectedOpportunityId: string | null;
  onSelectOpportunity: (id: string) => void;
}) {
  if (opportunities.length === 0) {
    return (
      <p className="p-4 text-sm text-[#1c1c1c]/40">
        No opportunities identified yet -- none of this market's properties clear the bar of multiple overlapping signals.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#1c1c1c]/8">
      {opportunities.map((opp) => {
        const color = OPPORTUNITY_STRENGTH_COLOR[opp.strength];
        return (
          <li key={opp.id}>
            <button
              type="button"
              onClick={() => onSelectOpportunity(opp.id)}
              className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[#1c1c1c]/[0.03] ${
                opp.id === selectedOpportunityId ? "bg-[#1c1c1c]/[0.05]" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span style={{ color }}>{OPPORTUNITY_STRENGTH_LABEL[opp.strength]}</span>
                {opp.date_identified && (
                  <>
                    <span className="text-[#1c1c1c]/30">·</span>
                    <span className="text-[#1c1c1c]/40">{formatDate(opp.date_identified)}</span>
                  </>
                )}
              </div>

              <span className="text-sm font-medium text-[#1c1c1c]">{opp.address}</span>
              <span className="text-xs text-[#1c1c1c]/50">{opp.opportunity_type}</span>

              <div className="mt-1 flex flex-wrap gap-1">
                {opp.signals.map((signal) => (
                  <span key={signal} className="rounded-full bg-[#1c1c1c]/5 px-2 py-0.5 text-[10px] text-[#1c1c1c]/60">
                    {opportunitySignalLabel(signal)}
                  </span>
                ))}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
