"use client";

import { useState } from "react";
import { NEUTRAL_ICON_COLOR, PROJECT_CATEGORY_LABEL, type ProjectCategory, type ProjectStatus } from "@/lib/types";
import { projectIconSvgMarkup, resolveProjectIcon } from "@/lib/markerIcons";

const ORDER: ProjectCategory[] = [
  "active_development",
  "planning_entitlement",
  "zoning",
  "infrastructure",
  "land_transaction",
  "business_announcement",
];

// A representative status per category for the legend's icon-resolution
// call -- the legend shows one glyph per category regardless of which
// statuses are actually present, so any non-permitted/under_construction
// status works here (those two override by status, see markerIcons.ts).
const REPRESENTATIVE_STATUS: ProjectStatus = "proposed";

// Collapsed by default so a signal-dense market doesn't open with two tall
// stacks of rows covering the map -- the header alone (label + total) is
// enough context until the user taps to break it down by category.
export default function DevelopmentLegend({
  counts,
  total,
}: {
  counts: Partial<Record<ProjectCategory, number>>;
  total: number;
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
        <span className="flex-1 text-sm font-medium text-white/85">Planning</span>
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
          {ORDER.map((category) => (
            <li key={category} className="flex items-center gap-2 text-xs text-white/70">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: projectIconSvgMarkup(resolveProjectIcon(category, REPRESENTATIVE_STATUS), {
                    size: 13,
                    stroke: NEUTRAL_ICON_COLOR,
                    strokeWidth: 2,
                  }),
                }}
              />
              <span className="flex-1">{PROJECT_CATEGORY_LABEL[category]}</span>
              <span className="text-white/30">{counts[category] ?? 0}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
