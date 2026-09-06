import { LIFECYCLE_STAGE_LABEL, LIFECYCLE_STAGE_ORDER, type LifecycleStage } from "@/lib/lifecycleStage";

// Compact Signal->Completion progress bar for a project card. Segments
// before the current rung are solid, the current rung is emphasized, and
// everything after is a light track -- no numbers/percentages, since
// "how far along" only ever means "which of the six rungs."
export default function LifecycleStageTimeline({ stage }: { stage: LifecycleStage | null }) {
  if (stage === null) {
    return <p className="text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/35">Stage unclear</p>;
  }

  const currentIndex = LIFECYCLE_STAGE_ORDER.indexOf(stage);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {LIFECYCLE_STAGE_ORDER.map((s, i) => (
          <div
            key={s}
            title={LIFECYCLE_STAGE_LABEL[s]}
            className={`h-1.5 flex-1 rounded-full ${
              i < currentIndex ? "bg-[#1c1c1c]/40" : i === currentIndex ? "bg-[#1c1c1c]" : "bg-[#1c1c1c]/10"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/50">{LIFECYCLE_STAGE_LABEL[stage]}</p>
    </div>
  );
}
