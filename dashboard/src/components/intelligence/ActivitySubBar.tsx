import { ACTIVITY_PHASE_COLOR, ACTIVITY_PHASE_LABEL, type ActivityPhase } from "@/lib/types";

const PHASE_ORDER: ActivityPhase[] = ["planning", "active", "completed"];

// Phase chips are multi-select (empty selection = show all phases), same
// pattern as the category/status/property-type chips elsewhere -- so
// "show everything" is a real, reachable default rather than being forced
// into one exclusive phase at a time.
export default function ActivitySubBar({
  activePhases,
  onTogglePhase,
  phaseCounts,
}: {
  activePhases: Set<ActivityPhase>;
  onTogglePhase: (phase: ActivityPhase) => void;
  phaseCounts: Record<ActivityPhase, number>;
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
    </div>
  );
}
