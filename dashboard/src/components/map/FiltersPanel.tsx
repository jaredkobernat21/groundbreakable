"use client";

import type { Market } from "@/lib/types";
import { CATALYST_COLOR_GROUP_LABEL, CATALYST_STAGE_GROUP_LABEL, type CatalystColorGroup, type CatalystStageGroup } from "@/lib/catalystTypeColors";
import { DC_STAGE_LABEL, type DcStage } from "@/lib/catalysts/dcStage";

export type TimeFilter = "all" | "new_week" | "new_month" | "active";

const DC_STAGES: DcStage[] = ["possible", "predicted", "planned"];

export type MapFilters = {
  // Primary: which data-center stages render at all.
  dcStages: Set<DcStage>;
  // Secondary: non-DC ("supporting") catalysts are hidden entirely unless
  // this is on, per Jared's "don't let secondary data dominate by default."
  showSupporting: boolean;
  // Sub-filter of the supporting layer only -- meaningless while
  // showSupporting is false.
  types: Set<CatalystColorGroup>;
  // Construction-pipeline stage -- only meaningful for Planned (confirmed
  // data_center) catalysts; everything else ignores it.
  stages: Set<CatalystStageGroup>;
  time: TimeFilter;
  states: Set<string>;
  marketIds: Set<string>;
};

export function defaultMapFilters(): MapFilters {
  return {
    dcStages: new Set(DC_STAGES),
    showSupporting: false,
    types: new Set(Object.keys(CATALYST_COLOR_GROUP_LABEL) as CatalystColorGroup[]),
    stages: new Set(Object.keys(CATALYST_STAGE_GROUP_LABEL) as CatalystStageGroup[]),
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

// Data Center Refocus (Jared, 2026-10-01): "Make these 3 data-center stages
// the main focus... Primary map filters: Possible, Predicted, Planned.
// Secondary filters/layers: Power, Land, Fiber, Water, Government, Other
// major development." This panel is restructured around that split -- DC
// Stage first and large, everything else collapsed under a single
// "Show supporting layers" gate so it can't dominate by default.
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
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[340px] overflow-y-auto border-l border-white/10 bg-black/90 p-5 shadow-2xl backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Filters</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white">
            ✕
          </button>
        </div>

        <section className="mb-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Data Center Stage</p>
          <div className="space-y-1.5">
            {DC_STAGES.map((stage) => (
              <label key={stage} className="flex items-center gap-2 text-sm text-white/80">
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

        <section className="mb-6 border-t border-white/10 pt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            <input
              type="checkbox"
              checked={filters.showSupporting}
              onChange={() => onChange({ ...filters, showSupporting: !filters.showSupporting })}
              className="accent-white"
            />
            Show supporting infrastructure &amp; other development
          </label>
          <p className="mt-1 text-[11px] text-white/30">
            Power, land, fiber, water, schools, housing, and other context data that helps explain why a location
            is Possible, Predicted, or Planned.
          </p>
        </section>

        {filters.showSupporting && (
          <section className="mb-6">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Supporting Layers</p>
            <div className="space-y-1.5">
              {(Object.entries(CATALYST_COLOR_GROUP_LABEL) as [CatalystColorGroup, string][])
                .filter(([value]) => value !== "data_center")
                .map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={filters.types.has(value)}
                      onChange={() => onChange({ ...filters, types: toggle(filters.types, value) })}
                      className="accent-white"
                    />
                    {label}
                  </label>
                ))}
            </div>
          </section>
        )}

        <section className="mb-6">
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
