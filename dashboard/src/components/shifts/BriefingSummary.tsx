import type { DevelopmentOpportunityWithSources, GrowthArea, ProjectWithSource, ShiftCategory, ShiftWithSource } from "@/lib/types";
import { GROWTH_AREA_MOMENTUM_LABEL } from "@/lib/types";
import { pointInPolygon } from "@/lib/geo";
import { formatRelativeVerified } from "@/lib/format";
import { ICON_PATHS } from "@/lib/icons";
import Icon from "./Icon";

type MomentumAreaBreakdown = {
  area: GrowthArea;
  shiftsByCategory: Partial<Record<ShiftCategory, ShiftWithSource[]>>;
  projects: ProjectWithSource[];
  count: number;
};

const HEADLINE_BY_MOMENTUM: Record<GrowthArea["momentum_state"], (name: string) => string> = {
  accelerating: (name) => `${name} is gaining momentum.`,
  established: (name) => `${name} is an established development corridor.`,
  emerging: (name) => `${name} is starting to see new activity.`,
};

// The first sentence of a growth area's human-authored narrative -- a
// short, already-reviewed line rather than a fresh generated summary.
function firstSentence(text: string): string {
  const match = text.match(/^[^.]+\./);
  return match ? match[0] : text;
}

type Trend = "rising" | "steady" | "cooling";

// A real week-over-week comparison of shift activity inside the area --
// "rising" only when the trailing 7 days genuinely out-counts the 7 days
// before that, never a decorative default. Null when there's nothing to
// compare (no shifts in the area at all).
function computeTrend(areaShifts: ShiftWithSource[]): Trend | null {
  if (areaShifts.length === 0) return null;
  const day = 86_400_000;
  const since7d = new Date(Date.now() - 7 * day).toISOString().slice(0, 10);
  const since14d = new Date(Date.now() - 14 * day).toISOString().slice(0, 10);
  const recent = areaShifts.filter((s) => s.event_date >= since7d).length;
  const prior = areaShifts.filter((s) => s.event_date >= since14d && s.event_date < since7d).length;
  if (recent > prior) return "rising";
  if (recent < prior) return "cooling";
  return "steady";
}

const TREND_LABEL: Record<Trend, string> = {
  rising: "Activity rising",
  steady: "Activity steady",
  cooling: "Activity cooling",
};

const TREND_COLOR: Record<Trend, string> = {
  rising: "#22c55e",
  steady: "#94a3b8",
  cooling: "#f97316",
};

// The single most important thing happening in this market right now --
// replaces the old 4-badge Market Pulse/Momentum/Buildability/Insight
// row with one real, computed headline: which growth area is most
// active, why (its own already-reviewed narrative), whether activity
// there is genuinely trending up week-over-week, and how many open
// opportunities sit inside it. Every figure traces back to props
// ShiftDashboardView already computes (momentumAreaBreakdowns,
// allOpportunities) -- nothing here is decorative or hardcoded.
export default function BriefingSummary({
  topMomentumAreaBreakdown,
  allOpportunities,
  shifts,
  projects,
}: {
  topMomentumAreaBreakdown: MomentumAreaBreakdown | null;
  allOpportunities: DevelopmentOpportunityWithSources[];
  shifts: ShiftWithSource[];
  projects: ProjectWithSource[];
}) {
  if (!topMomentumAreaBreakdown) {
    return (
      <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#1c1c1c]/40">What Matters Now</p>
        <p className="text-sm text-[#1c1c1c]/70">
          {shifts.length} shift{shifts.length === 1 ? "" : "s"} and {projects.length} project
          {projects.length === 1 ? "" : "s"} tracked -- no momentum area has been identified for this market yet.
        </p>
      </div>
    );
  }

  const { area, projects: areaProjects } = topMomentumAreaBreakdown;
  const areaShifts = Object.values(topMomentumAreaBreakdown.shiftsByCategory).flat();
  const trend = computeTrend(areaShifts);

  const opportunityCount = allOpportunities.filter(
    (o) => o.latitude != null && o.longitude != null && pointInPolygon({ lat: o.latitude, lng: o.longitude }, area.geom)
  ).length;

  const headline = HEADLINE_BY_MOMENTUM[area.momentum_state](area.name);
  const subtext = area.narrative
    ? firstSentence(area.narrative)
    : `${areaShifts.length + areaProjects.length} tracked signal${areaShifts.length + areaProjects.length === 1 ? "" : "s"} in this area.`;

  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#1c1c1c]/40">
        <Icon paths={ICON_PATHS.pulse} className="h-3.5 w-3.5" />
        What Matters Now
        <span className="text-[#1c1c1c]/25">&middot;</span>
        <span className="normal-case tracking-normal text-[#1c1c1c]/35">Updated {formatRelativeVerified(area.updated_at)}</span>
      </div>

      <h2 className="mb-1.5 text-xl font-semibold leading-snug text-[#1c1c1c]">{headline}</h2>
      <p className="mb-3 text-sm leading-relaxed text-[#1c1c1c]/60">{subtext}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        {trend && (
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ color: TREND_COLOR[trend], backgroundColor: `${TREND_COLOR[trend]}1a` }}
          >
            <Icon paths={ICON_PATHS.trendingUp} className="h-3 w-3" strokeWidth={2.2} />
            {TREND_LABEL[trend]}
          </span>
        )}
        <span className="flex items-center gap-1 rounded-full bg-[#818cf8]/15 px-2.5 py-1 text-xs font-medium text-[#818cf8]">
          <Icon paths={ICON_PATHS.mapPin} className="h-3 w-3" strokeWidth={2.2} />
          {area.name} &middot; {GROWTH_AREA_MOMENTUM_LABEL[area.momentum_state]}
        </span>
        {opportunityCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-[#eab308]/15 px-2.5 py-1 text-xs font-medium text-[#eab308]">
            <Icon paths={ICON_PATHS.barChart} className="h-3 w-3" strokeWidth={2.2} />
            {opportunityCount} opportunit{opportunityCount === 1 ? "y" : "ies"}
          </span>
        )}
      </div>
    </div>
  );
}
