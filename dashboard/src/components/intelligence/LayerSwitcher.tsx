import { useState } from "react";
import { ACTIVITY_COLOR, OPPORTUNITIES_COLOR, POTENTIAL_COLOR } from "@/lib/types";

export type MapSegment = "all" | "plans" | "opportunities" | "potential";

// The "potential" segment key is unchanged (matches the URL param and the
// Plans/Opportunities/Potential data model elsewhere) -- only its
// display label reads "Momentum" now, per product direction.
const SEGMENTS: { key: MapSegment; label: string }[] = [
  { key: "all", label: "All" },
  { key: "plans", label: "Plans" },
  { key: "opportunities", label: "Opportunities" },
  { key: "potential", label: "Momentum" },
];

function dotColorFor(key: MapSegment): string | null {
  return key === "plans"
    ? ACTIVITY_COLOR
    : key === "opportunities"
      ? OPPORTUNITIES_COLOR
      : key === "potential"
        ? POTENTIAL_COLOR
        : null;
}

// The only filter control on the map -- deliberately just one small,
// minimal toggle. "All" shows everything at once (including every Plans
// phase); "Plans" and "Opportunities" narrow to just that layer.
// Favorable Zoning lives under Potential (not Opportunities) -- it's about
// a parcel's future development capacity via zoning, not a distress/
// acquisition signal, so it belongs with Growth Areas/Potential Sites, not
// with the property-level signal pins. Lives inside the map itself
// (top-center overlay), not as a separate bar above it.
//
// Collapsed by default (momentum-first product direction: this shouldn't
// compete with the Growth Area highlights for attention) -- shows just the
// active segment as a small pill, tap to expand into the full row. Picking
// a segment re-collapses it.
export default function LayerSwitcher({
  segment,
  onSelectSegment,
}: {
  segment: MapSegment;
  onSelectSegment: (segment: MapSegment) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const active = SEGMENTS.find((s) => s.key === segment) ?? SEGMENTS[0];

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-medium text-white/70 shadow-lg backdrop-blur-xl transition hover:text-white"
      >
        {dotColorFor(active.key) && (
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColorFor(active.key)! }} />
        )}
        {active.label}
        <span className="text-white/35">⌄</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/70 p-1 shadow-lg backdrop-blur-xl">
      {SEGMENTS.map((s) => {
        const isActive = segment === s.key;
        const dotColor = dotColorFor(s.key);
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => {
              onSelectSegment(s.key);
              setExpanded(false);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isActive ? "bg-white text-black" : "text-white/55 hover:text-white/85"
            }`}
          >
            {dotColor && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
