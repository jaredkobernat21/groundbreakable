import { ACTIVITY_PHASE_COLOR, ACTIVITY_PHASE_LABEL, CATALYSTS_COLOR, type ActivityPhase } from "@/lib/types";

const PHASE_ORDER: ActivityPhase[] = ["planning", "active", "completed"];

// Phase chips are multi-select (empty selection = show all phases), same
// pattern as the category/status/property-type chips elsewhere -- so
// "show everything" is a real, reachable default rather than being forced
// into one exclusive phase at a time. The Catalysts toggle is independent
// of phase entirely, since a catalyst is relevant regardless of which
// phase you're viewing.
export default function ActivitySubBar({
  activePhases,
  onTogglePhase,
  phaseCounts,
  showCatalysts,
  onToggleCatalysts,
  catalystCount,
}: {
  activePhases: Set<ActivityPhase>;
  onTogglePhase: (phase: ActivityPhase) => void;
  phaseCounts: Record<ActivityPhase, number>;
  showCatalysts: boolean;
  onToggleCatalysts: () => void;
  catalystCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
      {PHASE_ORDER.map((phase) => {
        const active = activePhases.size === 0 || activePhases.has(phase);
        const color = ACTIVITY_PHASE_COLOR[phase];
        return (
          <button
            key={phase}
            type="button"
            onClick={() => onTogglePhase(phase)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "border-white/30 text-white"
                : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color, opacity: active ? 1 : 0.4 }} />
            {ACTIVITY_PHASE_LABEL[phase]}
            <span className="text-white/30">{phaseCounts[phase] ?? 0}</span>
          </button>
        );
      })}

      <span className="mx-1 h-4 w-px bg-white/10" />

      <button
        type="button"
        onClick={onToggleCatalysts}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          showCatalysts
            ? "border-white/30 text-white"
            : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
        }`}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: CATALYSTS_COLOR, opacity: showCatalysts ? 1 : 0.5 }}
        />
        Catalysts
        <span className="text-white/30">{catalystCount}</span>
      </button>
    </div>
  );
}
