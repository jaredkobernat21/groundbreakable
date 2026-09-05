import type { ProjectWithSource, ShiftWithSource, ZoningLandUseWithSource } from "@/lib/types";

// A one-line, entirely-computed-from-real-data digest shown at the very
// top of the dashboard, above the hero map -- "what's the state of this
// market right now" before the user even touches a filter. No new data
// or research involved: every number here is a plain count/filter over
// the same props ShiftDashboardView already has.
export default function BriefingSummary({
  shifts,
  projects,
  buildabilityZones,
}: {
  shifts: ShiftWithSource[];
  projects: ProjectWithSource[];
  buildabilityZones: ZoningLandUseWithSource[];
}) {
  const since7d = new Date();
  since7d.setDate(since7d.getDate() - 7);
  const since7dStr = since7d.toISOString().slice(0, 10);

  const shiftsThisWeek = shifts.filter((s) => s.event_date >= since7dStr).length;
  const permitsTotal = shifts.filter((s) => s.category === "building").length;
  const underConstruction = projects.filter((p) => p.stage === "construction").length;

  const parts = [
    `${shiftsThisWeek} shift${shiftsThisWeek === 1 ? "" : "s"} this week`,
    `${projects.length} project${projects.length === 1 ? "" : "s"} tracked${
      underConstruction > 0 ? ` (${underConstruction} under construction)` : ""
    }`,
    `${permitsTotal} permit${permitsTotal === 1 ? "" : "s"}`,
    `${buildabilityZones.length} zoning district${buildabilityZones.length === 1 ? "" : "s"} mapped`,
  ];

  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white px-4 py-3 text-sm text-[#1c1c1c]/70">
      {parts.join("  ·  ")}
    </div>
  );
}
