"use client";

import { useEffect, useState } from "react";
import { ACTIVITY_PHASE_COLOR, ACTIVITY_PHASE_LABEL, OPPORTUNITIES_COLOR, type ActivityPhase } from "@/lib/types";
import { bulbMarkerSvgMarkup, pinMarkerSvgMarkup, resolveProjectPhaseIcon } from "@/lib/markerIcons";

const PHASES: ActivityPhase[] = ["planning", "active", "completed"];

const PHASE_DESCRIPTION: Record<ActivityPhase, string> = {
  planning: "Being planned, before a permit is issued",
  active: "Permit issued, under construction",
  completed: "Finished within the last 6 months",
};

const STORAGE_KEY = "roq-map-key-expanded";

// A plain-language key for the map's whole color/icon system, always
// visible above the map itself (not tucked inside a per-segment overlay
// like DevelopmentLegend/OpportunityLegend) -- built for an audience that
// includes people with little software experience, so it defaults open
// rather than requiring them to discover a toggle first. Uses the exact
// same marker-drawing functions as the map itself, so what's shown here is
// never just a description of the pins -- it's the same artwork.
export default function MapKey() {
  const [expanded, setExpanded] = useState(true);

  // Defaults to expanded on first paint (server and client agree, so no
  // hydration mismatch) and only collapses after mount if the user
  // previously chose to hide it.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setExpanded(stored === "1");
  }, []);

  function toggle() {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className="flex-1 text-sm font-medium text-[#1c1c1c]">Understand the map</span>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-[#1c1c1c]/40 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-4">
          {PHASES.map((phase) => (
            <div key={phase} className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-6 shrink-0 items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: pinMarkerSvgMarkup(resolveProjectPhaseIcon(phase), {
                    size: 24,
                    fill: ACTIVITY_PHASE_COLOR[phase],
                  }),
                }}
              />
              <div>
                <div className="text-xs font-medium text-[#1c1c1c]">{ACTIVITY_PHASE_LABEL[phase]}</div>
                <div className="text-[11px] text-[#1c1c1c]/45">{PHASE_DESCRIPTION[phase]}</div>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-6 shrink-0 items-center justify-center"
              dangerouslySetInnerHTML={{ __html: bulbMarkerSvgMarkup({ size: 22, fill: OPPORTUNITIES_COLOR }) }}
            />
            <div>
              <div className="text-xs font-medium text-[#1c1c1c]">Opportunity</div>
              <div className="text-[11px] text-[#1c1c1c]/45">A property worth a closer look</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="h-4 w-4 shrink-0 rounded-sm border-2 border-dashed border-[#1c1c1c]/35" />
            <div>
              <div className="text-xs font-medium text-[#1c1c1c]">Watch Zone</div>
              <div className="text-[11px] text-[#1c1c1c]/45">Where the most planning activity is happening</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className="h-4 w-4 shrink-0 rounded-sm border-2"
              style={{ borderColor: OPPORTUNITIES_COLOR, borderStyle: "dashed" }}
            />
            <div>
              <div className="text-xs font-medium text-[#1c1c1c]">Favorable Zoning</div>
              <div className="text-[11px] text-[#1c1c1c]/45">An area zoned well for new development</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
