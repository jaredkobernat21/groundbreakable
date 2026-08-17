import { ACTIVITY_COLOR, OPPORTUNITIES_COLOR, POTENTIAL_COLOR } from "@/lib/types";

export type MapSegment = "all" | "activity" | "opportunities" | "potential";

const SEGMENTS: { key: MapSegment; label: string }[] = [
  { key: "all", label: "All" },
  { key: "activity", label: "Planning" },
  { key: "opportunities", label: "Opportunities" },
  { key: "potential", label: "Potential" },
];

// The only filter control on the map -- deliberately just one small,
// minimal toggle. "All" shows everything at once (including catalysts, and
// every Activity phase); "Planning" and "Opportunities" narrow to just
// that layer. Lives inside the map itself (top-center overlay), not as a
// separate bar above it.
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
          s.key === "activity"
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
