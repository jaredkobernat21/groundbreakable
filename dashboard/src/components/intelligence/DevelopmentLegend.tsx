import { NEUTRAL_ICON_COLOR, PROJECT_CATEGORY_LABEL, type ProjectCategory, type ProjectStatus } from "@/lib/types";
import { projectIconSvgMarkup, resolveProjectIcon } from "@/lib/markerIcons";

const ORDER: ProjectCategory[] = [
  "active_development",
  "planning_entitlement",
  "zoning",
  "infrastructure",
  "land_transaction",
  "business_announcement",
];

// A representative status per category for the legend's icon-resolution
// call -- the legend shows one glyph per category regardless of which
// statuses are actually present, so any non-permitted/under_construction
// status works here (those two override by status, see markerIcons.ts).
const REPRESENTATIVE_STATUS: ProjectStatus = "proposed";

export default function DevelopmentLegend({
  counts,
}: {
  counts: Partial<Record<ProjectCategory, number>>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
      <ul className="space-y-1.5">
        {ORDER.map((category) => (
          <li key={category} className="flex items-center gap-2 text-xs text-white/70">
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: projectIconSvgMarkup(resolveProjectIcon(category, REPRESENTATIVE_STATUS), {
                  size: 13,
                  stroke: NEUTRAL_ICON_COLOR,
                  strokeWidth: 2,
                }),
              }}
            />
            <span className="flex-1">{PROJECT_CATEGORY_LABEL[category]}</span>
            <span className="text-white/30">{counts[category] ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
