"use client";

import type { DevelopmentOpportunityWithSources } from "@/lib/types";
import { OPPORTUNITY_CATEGORY_LABEL, OPPORTUNITY_STRENGTH_LABEL } from "@/lib/types";
import { OPPORTUNITY_CATEGORY_COLOR, OPPORTUNITY_STRENGTH_COLOR, opportunitySignalLabel } from "@/lib/opportunityConstants";
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
        const categoryColor = OPPORTUNITY_CATEGORY_COLOR[opp.category];
        const strengthColor = OPPORTUNITY_STRENGTH_COLOR[opp.strength];
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
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{ color: categoryColor, backgroundColor: `${categoryColor}1a` }}
                >
                  {OPPORTUNITY_CATEGORY_LABEL[opp.category]}
                </span>
                <span className="ml-auto flex items-center gap-1" style={{ color: strengthColor }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: strengthColor }} />
                  {OPPORTUNITY_STRENGTH_LABEL[opp.strength]}
                </span>
              </div>

              <span className="text-sm font-medium text-[#1c1c1c]">{opp.address}</span>
              <span className="text-xs text-[#1c1c1c]/50">{opp.opportunity_type}</span>
              {opp.status && <span className="text-xs text-[#1c1c1c]/45">{opp.status}</span>}

              {(opp.related_developer || opp.related_contractor) && (
                <span className="text-xs text-[#1c1c1c]/50">
                  {opp.related_developer && <>Developer: {opp.related_developer}</>}
                  {opp.related_developer && opp.related_contractor && " · "}
                  {opp.related_contractor && <>Contractor: {opp.related_contractor}</>}
                </span>
              )}

              <div className="mt-1 flex flex-wrap gap-1">
                {opp.signals.map((signal) => (
                  <span key={signal} className="rounded-full bg-[#1c1c1c]/5 px-2 py-0.5 text-[10px] text-[#1c1c1c]/60">
                    {opportunitySignalLabel(signal)}
                  </span>
                ))}
              </div>

              {opp.date_identified && <span className="text-[10px] text-[#1c1c1c]/35">{formatDate(opp.date_identified)}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
