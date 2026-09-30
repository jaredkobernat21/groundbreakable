"use client";

import type { Market } from "@/lib/types";
import {
  CATALYST_COLOR_GROUP_LABEL,
  CATALYST_STAGE_GROUP_LABEL,
  IMPACT_RADIUS_TIER_LABEL,
  type CatalystColorGroup,
  type CatalystStageGroup,
  type ImpactRadiusTier,
} from "@/lib/catalystTypeColors";

export type TimeFilter = "all" | "new_week" | "new_month" | "active";

export type MapFilters = {
  types: Set<CatalystColorGroup>;
  stages: Set<CatalystStageGroup>;
  time: TimeFilter;
  states: Set<string>;
  marketIds: Set<string>;
  impactRadiusTiers: Set<ImpactRadiusTier>;
  showImpactAreas: boolean;
  showInViewRail: boolean;
};

export function defaultMapFilters(): MapFilters {
  return {
    types: new Set(Object.keys(CATALYST_COLOR_GROUP_LABEL) as CatalystColorGroup[]),
    stages: new Set(Object.keys(CATALYST_STAGE_GROUP_LABEL) as CatalystStageGroup[]),
    time: "all",
    states: new Set(),
    marketIds: new Set(),
    impactRadiusTiers: new Set(Object.keys(IMPACT_RADIUS_TIER_LABEL) as ImpactRadiusTier[]),
    showImpactAreas: true,
    showInViewRail: true,
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

// Institutional redesign (Jared, 2026-09-30): Type moved to the persistent
// TopFilterBar.tsx pills; this is now a compact popover (not a full-height
// slide-out) for everything else -- Stage, Time, Impact Radius, Market, and
// a Layers toggle group. Same MapFilters object both surfaces read/write,
// so filtering logic stays centralized in NationalMapExperience.tsx.
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
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-3 top-16 z-50 max-h-[calc(100vh-5.5rem)] w-[320px] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0E0F12]/95 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[15px] font-medium text-[#EDECE8]">Filters</h2>
          <button type="button" onClick={onClose} className="text-[#7A7E87] hover:text-[#EDECE8]">
            ✕
          </button>
        </div>

        <section className="mb-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Stage</p>
          <div className="space-y-1.5">
            {(Object.entries(CATALYST_STAGE_GROUP_LABEL) as [CatalystStageGroup, string][]).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-[13px] text-[#C7C9CE]">
                <input
                  type="checkbox"
                  checked={filters.stages.has(value)}
                  onChange={() => onChange({ ...filters, stages: toggle(filters.stages, value) })}
                  className="accent-[#EDECE8]"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Impact Radius</p>
          <div className="space-y-1.5">
            {(Object.entries(IMPACT_RADIUS_TIER_LABEL) as [ImpactRadiusTier, string][]).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-[13px] text-[#C7C9CE]">
                <input
                  type="checkbox"
                  checked={filters.impactRadiusTiers.has(value)}
                  onChange={() => onChange({ ...filters, impactRadiusTiers: toggle(filters.impactRadiusTiers, value) })}
                  className="accent-[#EDECE8]"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Time</p>
          <div className="space-y-1.5">
            {TIME_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-[13px] text-[#C7C9CE]">
                <input
                  type="radio"
                  name="time"
                  checked={filters.time === opt.value}
                  onChange={() => onChange({ ...filters, time: opt.value })}
                  className="accent-[#EDECE8]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">State</p>
          <div className="flex flex-wrap gap-1.5">
            {states.map((state) => {
              const active = filters.states.size === 0 || filters.states.has(state);
              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => onChange({ ...filters, states: toggle(filters.states, state) })}
                  className={`rounded-full border px-2.5 py-1 text-[11px] ${
                    active ? "border-white/20 bg-white/[0.06] text-[#EDECE8]" : "border-white/[0.06] text-[#6B6F78]"
                  }`}
                >
                  {state}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Market</p>
          <div className="flex flex-wrap gap-1.5">
            {markets.map((m) => {
              const active = filters.marketIds.size === 0 || filters.marketIds.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange({ ...filters, marketIds: toggle(filters.marketIds, m.id) })}
                  className={`rounded-full border px-2.5 py-1 text-[11px] ${
                    active ? "border-white/20 bg-white/[0.06] text-[#EDECE8]" : "border-white/[0.06] text-[#6B6F78]"
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Layers</p>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[13px] text-[#C7C9CE]">
              <input
                type="checkbox"
                checked={filters.showImpactAreas}
                onChange={() => onChange({ ...filters, showImpactAreas: !filters.showImpactAreas })}
                className="accent-[#EDECE8]"
              />
              Impact area rings
            </label>
            <label className="flex items-center gap-2 text-[13px] text-[#C7C9CE]">
              <input
                type="checkbox"
                checked={filters.showInViewRail}
                onChange={() => onChange({ ...filters, showInViewRail: !filters.showInViewRail })}
                className="accent-[#EDECE8]"
              />
              Catalysts in View rail
            </label>
          </div>
        </section>

        <button
          type="button"
          onClick={() => onChange(defaultMapFilters())}
          className="w-full rounded-md border border-white/[0.08] px-3 py-2 text-[12px] text-[#7A7E87] hover:border-white/20 hover:text-[#EDECE8]"
        >
          Reset Filters
        </button>
      </div>
    </>
  );
}
