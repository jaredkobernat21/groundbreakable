import type { GrowthArea, ProjectWithSource, ShiftWithSource, ZoningLandUseWithSource } from "@/lib/types";
import { GROWTH_AREA_MOMENTUM_LABEL } from "@/lib/types";
import { ICON_PATHS } from "@/lib/icons";
import Icon from "./Icon";

// Rough, honest heuristic for a one-word Buildability read: "Favorable"
// only when at least one mapped zoning district actually allows
// multiunit/duplex housing by right (checked against the real
// generally_allowed text, not asserted) -- otherwise "Mixed", or "Not
// yet mapped" when nothing's been researched for this market yet. Not a
// precise score, just a plain-language gloss on real zoning text, same
// spirit as the momentum_state a human already assigned to growth areas.
function buildabilityRead(zones: ZoningLandUseWithSource[]): string {
  if (zones.length === 0) return "Not yet mapped";
  const hasMultiunit = zones.some((z) => /multiunit|apartment|duplex/i.test(z.generally_allowed ?? ""));
  return hasMultiunit ? "Favorable" : "Mixed";
}

// The first sentence of a growth area's human-authored narrative -- a
// short, already-reviewed line rather than a fresh generated summary.
function firstSentence(text: string): string {
  const match = text.match(/^[^.]+\./);
  return match ? match[0] : text;
}

// A compact "state of the market" card shown above the hero map --
// Momentum (the market's top growth_areas entry, if any) and
// Buildability (a plain-language read of the real Buildability layer)
// as two small badges, plus a one-line insight pulled from real,
// already-reviewed data (the top momentum area's own narrative, or a
// plain activity count when no momentum area exists yet). Every number
// and word here traces back to props ShiftDashboardView already has --
// no new research, no invented insight copy.
export default function BriefingSummary({
  shifts,
  projects,
  buildabilityZones,
  topMomentumArea,
}: {
  shifts: ShiftWithSource[];
  projects: ProjectWithSource[];
  buildabilityZones: ZoningLandUseWithSource[];
  topMomentumArea: GrowthArea | null;
}) {
  const momentumLabel = topMomentumArea ? GROWTH_AREA_MOMENTUM_LABEL[topMomentumArea.momentum_state] : "Not yet assessed";
  const buildability = buildabilityRead(buildabilityZones);

  const insight = topMomentumArea
    ? `${topMomentumArea.name}: ${firstSentence(topMomentumArea.narrative ?? "")}`
    : `${shifts.length} shift${shifts.length === 1 ? "" : "s"} and ${projects.length} project${
        projects.length === 1 ? "" : "s"
      } tracked -- this market hasn't had a momentum area identified yet.`;

  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#1c1c1c]/40">
          <Icon paths={ICON_PATHS.pulse} className="h-4 w-4" />
          Market Pulse
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#818cf8]/15 text-[#818cf8]">
            <Icon paths={ICON_PATHS.pulse} className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-[#1c1c1c]/45">Momentum</p>
            <p className="text-sm font-semibold text-[#1c1c1c]">{momentumLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e]">
            <Icon paths={ICON_PATHS.building} className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-[#1c1c1c]/45">Buildability Snapshot</p>
            <p className="text-sm font-semibold text-[#1c1c1c]">{buildability}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-start gap-2">
          <Icon paths={ICON_PATHS.lightbulb} className="mt-0.5 h-4 w-4 shrink-0 text-[#eab308]" />
          <p className="text-sm leading-relaxed text-[#1c1c1c]/70">{insight}</p>
        </div>
      </div>
    </div>
  );
}
