import {
  NEUTRAL_ICON_COLOR,
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  type ProjectCategory,
  type ProjectStatus,
} from "@/lib/types";
import { projectIconSvgMarkup, resolveProjectIcon } from "@/lib/markerIcons";

const REPRESENTATIVE_STATUS: ProjectStatus = "proposed";

const CATEGORY_ORDER: ProjectCategory[] = [
  "active_development",
  "planning_entitlement",
  "zoning",
  "infrastructure",
  "land_transaction",
  "business_announcement",
];

// Filtering is client-side over the market's already-fetched project set
// (small per-market datasets by design). Category/status are wired now;
// date range and geography (submarket) filters can slot in here later
// without touching DevelopmentMap, since it only ever sees the filtered
// project list.
export default function DevelopmentFilterBar({
  availableCategories,
  availableStatuses,
  activeCategories,
  activeStatuses,
  onToggleCategory,
  onToggleStatus,
  onReset,
}: {
  availableCategories: ProjectCategory[];
  availableStatuses: ProjectStatus[];
  activeCategories: Set<ProjectCategory>;
  activeStatuses: Set<ProjectStatus>;
  onToggleCategory: (category: ProjectCategory) => void;
  onToggleStatus: (status: ProjectStatus) => void;
  onReset: () => void;
}) {
  const filtersActive = activeCategories.size > 0 || activeStatuses.size > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
      {CATEGORY_ORDER.filter((c) => availableCategories.includes(c)).map((category) => {
        const active = activeCategories.has(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggleCategory(category)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
              active
                ? "border-white/30 bg-white/10 text-white"
                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
            }`}
          >
            <span
              className="flex h-3 w-3 items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: projectIconSvgMarkup(resolveProjectIcon(category, REPRESENTATIVE_STATUS), {
                  size: 12,
                  stroke: active ? NEUTRAL_ICON_COLOR : "currentColor",
                  strokeWidth: 2,
                }),
              }}
            />
            {PROJECT_CATEGORY_LABEL[category]}
          </button>
        );
      })}

      {availableStatuses.length > 0 && (
        <span className="mx-1 h-4 w-px bg-white/10" />
      )}

      {availableStatuses.map((status) => {
        const active = activeStatuses.has(status);
        return (
          <button
            key={status}
            type="button"
            onClick={() => onToggleStatus(status)}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              active
                ? "border-white/30 bg-white/10 text-white"
                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
            }`}
          >
            {PROJECT_STATUS_LABEL[status]}
          </button>
        );
      })}

      {filtersActive && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto text-xs text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
