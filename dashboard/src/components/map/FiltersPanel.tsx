"use client";

import type { Market } from "@/lib/types";
import { CATALYST_COLOR_GROUP_LABEL, CATALYST_STAGE_GROUP_LABEL, type CatalystColorGroup, type CatalystStageGroup } from "@/lib/catalystTypeColors";
import { DC_STAGE_LABEL, type DcStage } from "@/lib/catalysts/dcStage";
import { HOUSING_STAGE_LABEL, type HousingStage } from "@/lib/catalysts/housingStage";
import { HOUSING_TYPE_LABEL, type HousingType } from "@/lib/catalysts/housingPotentialCriteria";

export type TimeFilter = "all" | "new_week" | "new_month" | "active";

const DC_STAGES: DcStage[] = ["potential", "possible", "planned"];
const HOUSING_STAGES: HousingStage[] = ["potential", "planned"];
const HOUSING_TYPES: HousingType[] = ["large_single_family", "multifamily", "build_to_rent", "townhome_attached", "infill_redevelopment", "mixed_residential"];

// "all" sits outside CatalystColorGroup (that type stays a strict
// CatalystType->color mapping used for marker styling) -- it's a filter-only
// concept meaning "every category at once," not a color group of its own.
export type CategoryFilterValue = CatalystColorGroup | "all";

// Category tab order -- Data Centers first/default, per Jared's "Data
// Centers should be the clear primary product." "All" sits last, an
// explicit opt-in to see every category together rather than the default.
const CATEGORY_ORDER: CategoryFilterValue[] = ["data_center", "infrastructure", "schools_civic", "housing", "other", "all"];

const CATEGORY_LABEL: Record<CategoryFilterValue, string> = {
  ...CATALYST_COLOR_GROUP_LABEL,
  all: "All",
};

export type MapFilters = {
  // Primary: exactly one category renders at a time -- Data Centers is the
  // product's default lens; Infrastructure/Schools/Housing/Other are
  // alternate views you switch to, not layers added on top; "All" shows
  // every category together.
  category: CategoryFilterValue;
  // Sub-filter of the Data Centers category only -- meaningless for any
  // other category.
  dcStages: Set<DcStage>;
  // Construction-pipeline stage -- only meaningful for Planned (confirmed
  // data_center) catalysts within the Data Centers category.
  stages: Set<CatalystStageGroup>;
  // Sub-filter of the Housing category only -- meaningless for any other
  // category. Mirrors dcStages above.
  housingStages: Set<HousingStage>;
  // Housing-type sub-filter, meaningful only for Potential housing sites
  // within the Housing category (Planned rows don't carry housing_type).
  // Empty set = no filter applied, same convention as `states`/`marketIds`
  // below.
  housingTypes: Set<HousingType>;
  time: TimeFilter;
  states: Set<string>;
  marketIds: Set<string>;
};

export function defaultMapFilters(): MapFilters {
  return {
    category: "data_center",
    dcStages: new Set(DC_STAGES),
    stages: new Set(Object.keys(CATALYST_STAGE_GROUP_LABEL) as CatalystStageGroup[]),
    housingStages: new Set(HOUSING_STAGES),
    housingTypes: new Set(),
    time: "all",
    states: new Set(),
    marketIds: new Set(),
  };
}

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new_week", label: "New this week" },
  { value: "new_month", label: "New this month" },
  { value: "active", label: "Active (not completed/cancelled)" },
];

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

// Data Center Refocus (Jared, 2026-10-02): the top-level lens is now a
// single-select Category (Data Centers default, switchable to
// Infrastructure/Schools/Housing/Other -- see CategoryFilterBar.tsx for the
// matching top-nav control), with Possible/Planned demoted to a
// sub-filter that only applies -- and only shows -- while the Data Centers
// category is active.
export default function FiltersPanel({
  open,
  onClose,
  filters,
  onChange,
  markets,
}: {
  open: boolean;
  onClose: () => void;
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  markets: Market[];
}) {
  if (!open) return null;

  const states = Array.from(new Set(markets.map((m) => m.state))).sort();

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-[340px] overflow-y-auto border-l border-white/10 bg-black/90 p-5 shadow-2xl backdrop-blur-xl max-sm:right-3 max-sm:w-[calc(100%-1.5rem)]"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Filters</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white">
            ✕
          </button>
        </div>

        <section className="mb-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Category</p>
          <div className="space-y-1.5">
            {CATEGORY_ORDER.map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === value}
                  onChange={() => onChange({ ...filters, category: value })}
                  className="accent-white"
                />
                {CATEGORY_LABEL[value]}
              </label>
            ))}
          </div>
        </section>

        {filters.category === "data_center" && (
          <>
            <section className="mb-6 border-t border-white/10 pt-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Data Center Stage</p>
              <div className="space-y-1.5">
                {DC_STAGES.map((stage) => (
                  <label key={stage} className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={filters.dcStages.has(stage)}
                      onChange={() => onChange({ ...filters, dcStages: toggle(filters.dcStages, stage) })}
                      className="accent-white"
                    />
                    {DC_STAGE_LABEL[stage]}
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-6 border-t border-white/10 pt-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Planned Stage</p>
              <p className="mb-2 text-[11px] text-white/30">Construction progress, applies only to confirmed Planned data centers.</p>
              <div className="space-y-1.5">
                {(Object.entries(CATALYST_STAGE_GROUP_LABEL) as [CatalystStageGroup, string][]).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={filters.stages.has(value)}
                      onChange={() => onChange({ ...filters, stages: toggle(filters.stages, value) })}
                      className="accent-white"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </section>
          </>
        )}

        {filters.category === "housing" && (
          <>
            <section className="mb-6 border-t border-white/10 pt-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Housing Stage</p>
              <div className="space-y-1.5">
                {HOUSING_STAGES.map((stage) => (
                  <label key={stage} className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={filters.housingStages.has(stage)}
                      onChange={() => onChange({ ...filters, housingStages: toggle(filters.housingStages, stage) })}
                      className="accent-white"
                    />
                    {HOUSING_STAGE_LABEL[stage]}
                  </label>
                ))}
              </div>
            </section>

            {filters.housingStages.has("potential") && (
              <section className="mb-6 border-t border-white/10 pt-4">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Housing Type</p>
                <p className="mb-2 text-[11px] text-white/30">Applies only to Potential housing sites; leave all unchecked to show every type.</p>
                <div className="space-y-1.5">
                  {HOUSING_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={filters.housingTypes.has(type)}
                        onChange={() => onChange({ ...filters, housingTypes: toggle(filters.housingTypes, type) })}
                        className="accent-white"
                      />
                      {HOUSING_TYPE_LABEL[type]}
                    </label>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="mb-6 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Time</p>
          <div className="space-y-1.5">
            {TIME_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="radio"
                  name="time"
                  checked={filters.time === opt.value}
                  onChange={() => onChange({ ...filters, time: opt.value })}
                  className="accent-white"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">State</p>
          <div className="flex flex-wrap gap-1.5">
            {states.map((state) => {
              const active = filters.states.size === 0 || filters.states.has(state);
              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => onChange({ ...filters, states: toggle(filters.states, state) })}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    active ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-white/40"
                  }`}
                >
                  {state}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Market</p>
          <div className="flex flex-wrap gap-1.5">
            {markets.map((m) => {
              const active = filters.marketIds.size === 0 || filters.marketIds.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange({ ...filters, marketIds: toggle(filters.marketIds, m.id) })}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    active ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-white/40"
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={() => onChange(defaultMapFilters())}
          className="w-full rounded border border-white/10 px-3 py-2 text-xs text-white/50 hover:border-white/30 hover:text-white"
        >
          Reset Filters
        </button>
      </div>
    </>
  );
}
