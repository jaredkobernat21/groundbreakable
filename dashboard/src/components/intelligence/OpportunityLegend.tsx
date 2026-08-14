"use client";

import { useState } from "react";
import {
  NEUTRAL_ICON_COLOR,
  OPPORTUNITIES_COLOR,
  OPPORTUNITY_SIGNAL_PRIORITY,
  OPPORTUNITY_TYPE_LABEL,
  type OpportunityType,
} from "@/lib/types";
import { OPPORTUNITY_SIGNAL_ICON, opportunityIconSvgMarkup } from "@/lib/markerIcons";

// Same breakdown pattern as DevelopmentLegend for Activity, but counts by
// signal rather than by a single category -- a property can carry more
// than one signal at once, so counts here can sum to more than the total
// number of opportunities. Collapsed by default, same reasoning as
// DevelopmentLegend: don't cover the map with two tall stacks on load.
export default function OpportunityLegend({
  counts,
  total,
  zoneCount,
}: {
  counts: Partial<Record<OpportunityType, number>>;
  total: number;
  zoneCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/60 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="flex-1 text-sm font-medium text-white/85">Opportunities</span>
        <span className="text-sm text-white/40">{total}</span>
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-white/40 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <ul className="space-y-1.5 px-3 pb-3">
          {OPPORTUNITY_SIGNAL_PRIORITY.map((type) => (
            <li key={type} className="flex items-center gap-2 text-xs text-white/70">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: opportunityIconSvgMarkup(OPPORTUNITY_SIGNAL_ICON[type], {
                    size: 13,
                    stroke: NEUTRAL_ICON_COLOR,
                    strokeWidth: 2,
                  }),
                }}
              />
              <span className="flex-1">{OPPORTUNITY_TYPE_LABEL[type]}</span>
              <span className="text-white/30">{counts[type] ?? 0}</span>
            </li>
          ))}
          <li className="flex items-center gap-2 border-t border-white/10 pt-1.5 text-xs text-white/70">
            <span
              className="h-3 w-3 shrink-0 rounded-sm border-2"
              style={{ borderColor: OPPORTUNITIES_COLOR, borderStyle: "dashed" }}
            />
            <span className="flex-1">Favorable Zoning Areas</span>
            <span className="text-white/30">{zoneCount}</span>
          </li>
        </ul>
      )}
    </div>
  );
}
