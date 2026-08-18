import { ACTIVITY_COLOR, OPPORTUNITIES_COLOR, POTENTIAL_COLOR } from "@/lib/types";

export type MapSegment = "all" | "plans" | "opportunities" | "potential";

const SEGMENTS: { key: MapSegment; label: string }[] = [
  { key: "all", label: "All" },
  { key: "plans", label: "Plans" },
  { key: "opportunities", label: "Opportunities" },
  { key: "potential", label: "Potential" },
];

// The only filter control on the map -- deliberately just one small,
// minimal toggle. "All" shows everything at once (including catalysts, and
// every Plans phase); "Plans" and "Opportunities" narrow to just that
// layer. Favorable Zoning lives under Potential (not Opportunities) --
// it's about a parcel's future development capacity via zoning, not a
// distress/acquisition signal, so it belongs with Growth Areas/Potential
// Sites, not with the property-level signal pins. Lives inside the map
// itself (top-center overlay), not as a separate bar above it.
export default function LayerSwitcher({
  segment,
  onSelectSegment,
}: {
  segment: MapSegment;
  onSelectSegment: (segment: MapSegment) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/70 p-1 shadow-lg backdrop-blur-xl">
      {SEGMENTS.map((s) => {
        const active = segment === s.key;
        const dotColor =
          s.key === "plans"
            ? ACTIVITY_COLOR
            : s.key === "opportunities"
              ? OPPORTUNITIES_COLOR
              : s.key === "potential"
                ? POTENTIAL_COLOR
                : null;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelectSegment(s.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              active ? "bg-white text-black" : "text-white/55 hover:text-white/85"
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
