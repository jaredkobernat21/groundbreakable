import { ACTIVITY_COLOR, CATALYSTS_COLOR, OPPORTUNITIES_COLOR } from "@/lib/types";

export type MapSegment = "all" | "activity" | "opportunities" | "none";

const SEGMENTS: { key: "all" | "activity" | "opportunities"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "activity", label: "Planned Activity" },
  { key: "opportunities", label: "Opportunities" },
];

// Lives inside the map itself (top-center overlay), not as a separate bar
// above it -- kept small and quiet so it reads as a control on the map,
// not another content block competing with it.
export default function LayerSwitcher({
  segment,
  onSelectSegment,
  showCatalysts,
  onToggleCatalysts,
  catalystCount,
}: {
  segment: MapSegment;
  onSelectSegment: (segment: "all" | "activity" | "opportunities") => void;
  showCatalysts: boolean;
  onToggleCatalysts: () => void;
  catalystCount: number;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/70 p-1 shadow-lg backdrop-blur-xl">
      {SEGMENTS.map((s) => {
        const active = segment === s.key;
        const dotColor = s.key === "activity" ? ACTIVITY_COLOR : s.key === "opportunities" ? OPPORTUNITIES_COLOR : null;
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

      <span className="mx-0.5 h-4 w-px bg-white/10" />

      <button
        type="button"
        onClick={onToggleCatalysts}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
          showCatalysts ? "bg-white/15 text-white" : "text-white/45 hover:text-white/80"
        }`}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: CATALYSTS_COLOR, opacity: showCatalysts ? 1 : 0.5 }}
        />
        Catalysts
        {catalystCount > 0 && <span className="text-white/30">{catalystCount}</span>}
      </button>
    </div>
  );
}
