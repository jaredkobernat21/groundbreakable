"use client";

import { DC_STAGE_COLOR_HEX, DC_STAGE_LABEL, type DcStage } from "@/lib/catalysts/dcStage";

const DC_STAGES: DcStage[] = ["possible", "predicted", "planned"];

// Data Center Refocus (Jared, 2026-10-01): "The dashboard should immediately
// feel like: 'Where are data centers likely to go next?'" This replaces the
// old plain Filters/Following pill row as the map's visual anchor -- a live
// headline count per stage, each segment doubling as a stage filter toggle.
export default function DcStageSummaryBar({
  counts,
  activeStages,
  onToggleStage,
}: {
  counts: Record<DcStage, number>;
  activeStages: Set<DcStage>;
  onToggleStage: (stage: DcStage) => void;
}) {
  return (
    <div className="pointer-events-auto flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-black/50 px-1.5 py-1 backdrop-blur-sm">
      {DC_STAGES.map((stage) => {
        const active = activeStages.has(stage);
        const color = DC_STAGE_COLOR_HEX[stage];
        return (
          <button
            key={stage}
            type="button"
            onClick={() => onToggleStage(stage)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium transition sm:px-2.5 sm:py-1.5 sm:text-xs"
            style={{
              color: active ? "#fff" : "rgba(255,255,255,0.4)",
              backgroundColor: active ? `${color}26` : "transparent",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color, opacity: active ? 1 : 0.4 }} />
            <span className="font-semibold">{counts[stage]}</span>
            <span className="hidden sm:inline">{DC_STAGE_LABEL[stage]}</span>
          </button>
        );
      })}
    </div>
  );
}
