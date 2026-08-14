"use client";

import { useState } from "react";
import { ACTIVITY_PHASE_COLOR, ACTIVITY_PHASE_LABEL, type ActivityPhase } from "@/lib/types";
import { projectIconSvgMarkup, resolveProjectPhaseIcon } from "@/lib/markerIcons";

const ORDER: ActivityPhase[] = ["planning", "active", "completed"];

// Mirrors exactly what's drawn on the map now: phase (color + icon) is the
// primary grouping, not category -- see resolveProjectPhaseIcon and
// ACTIVITY_PHASE_COLOR. Collapsed by default so a signal-dense market
// doesn't open with a tall stack covering the map -- the header alone
// (label + total) is enough context until the user taps to break it down.
export default function DevelopmentLegend({
  counts,
  total,
}: {
  counts: Partial<Record<ActivityPhase, number>>;
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
          {ORDER.map((phase) => {
            const color = ACTIVITY_PHASE_COLOR[phase];
            return (
              <li key={phase} className="flex items-center gap-2 text-xs text-white/70">
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: projectIconSvgMarkup(resolveProjectPhaseIcon(phase), {
                      size: 13,
                      stroke: color,
                      strokeWidth: 2,
                    }),
                  }}
                />
                <span className="flex-1">{ACTIVITY_PHASE_LABEL[phase]}</span>
                <span className="text-white/30">{counts[phase] ?? 0}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
