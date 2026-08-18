"use client";

import { useState } from "react";
import { OPPORTUNITIES_COLOR, POTENTIAL_COLOR } from "@/lib/types";
import { pinMarkerSvgMarkup } from "@/lib/markerIcons";

// Same collapsible-chip pattern as DevelopmentLegend/OpportunityLegend.
// Favorable Zoning lives here (not in OpportunityLegend) since it moved
// to the Potential segment -- it's about a parcel's future development
// capacity via zoning, not a property-level distress/acquisition signal,
// so it groups with Growth Areas/Potential Sites instead.
export default function PotentialLegend({
  growthAreaCount,
  potentialSiteCount,
  zoneCount,
}: {
  growthAreaCount: number;
  potentialSiteCount: number;
  zoneCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = growthAreaCount + potentialSiteCount + zoneCount;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/60 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="flex-1 text-sm font-medium text-white/85">Potential</span>
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
          <li className="flex items-center gap-2 text-xs text-white/70">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: `${POTENTIAL_COLOR}33`, border: `1px solid ${POTENTIAL_COLOR}` }}
            />
            <span className="flex-1">Growth Areas</span>
            <span className="text-white/30">{growthAreaCount}</span>
          </li>
          <li className="flex items-center gap-2 text-xs text-white/70">
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center"
              dangerouslySetInnerHTML={{ __html: pinMarkerSvgMarkup("star", { size: 13, fill: POTENTIAL_COLOR }) }}
            />
            <span className="flex-1">Potential Sites</span>
            <span className="text-white/30">{potentialSiteCount}</span>
          </li>
          <li className="flex items-center gap-2 text-xs text-white/70">
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
