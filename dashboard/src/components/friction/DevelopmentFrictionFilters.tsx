"use client";

import { useState } from "react";
import type { FrictionType, Market, ProjectType, ShiftImpact } from "@/lib/types";
import { FRICTION_TYPE_LABEL, PROJECT_TYPE_LABEL } from "@/lib/types";
import { SHIFT_IMPACT_LABEL } from "@/lib/shiftConstants";

const FRICTION_TYPE_OPTIONS = Object.keys(FRICTION_TYPE_LABEL) as FrictionType[];
const SEVERITY_OPTIONS: ShiftImpact[] = ["high", "medium", "low"];
const PROJECT_TYPE_OPTIONS = Object.keys(PROJECT_TYPE_LABEL) as ProjectType[];

function PillRow<T extends string>({
  label,
  options,
  labelMap,
  active,
  onToggle,
}: {
  label: string;
  options: T[];
  labelMap: Record<T, string>;
  active: Set<T>;
  onToggle: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = active.has(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                isActive
                  ? "border-transparent bg-[#1c1c1c] text-white"
                  : "border-[#1c1c1c]/15 bg-transparent text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
              }`}
            >
              {labelMap[option]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type DevelopmentFrictionFilterState = {
  markets: Set<string>; // market ids
  frictionTypes: Set<FrictionType>;
  severities: Set<ShiftImpact>;
  projectTypes: Set<ProjectType>;
  developerSearch: string;
};

// Outcome is no longer one of these facets -- it's now which status tab
// (All/Active/Delayed/Modified/Stopped-Failed) is active, see
// lib/frictionStatus.ts. defaultMarketId preselects "this market" (the
// one currently chosen in the header switcher), matching "that market's"
// framing everywhere else on the dashboard -- broadening to other markets
// is still one click away via the Market pill row below.
export function emptyDevelopmentFrictionFilterState(defaultMarketId?: string): DevelopmentFrictionFilterState {
  return {
    markets: defaultMarketId ? new Set([defaultMarketId]) : new Set(),
    frictionTypes: new Set(),
    severities: new Set(),
    projectTypes: new Set(),
    developerSearch: "",
  };
}

// Every facet is empty-means-"all" (no toggle = no restriction) rather
// than all-selected-by-default -- simpler to reason about with 6 facets
// than tracking which pills are "everything currently on" per category.
//
// Only the developer search bar shows by default -- the four pill-row
// facets (Market/Friction Type/Severity/Project Type) sit behind a
// "Filters" disclosure, per Jared's ask, so the panel doesn't dump every
// option on screen before anyone's asked to narrow anything. The
// disclosure's own label carries a count so an already-applied filter
// (e.g. the market pre-selected to whichever one is currently active)
// stays visible even while collapsed.
export default function DevelopmentFrictionFilters({
  markets,
  filters,
  onChange,
}: {
  markets: Market[];
  filters: DevelopmentFrictionFilterState;
  onChange: (next: DevelopmentFrictionFilterState) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function toggle<K extends keyof DevelopmentFrictionFilterState>(key: K, value: string) {
    const current = filters[key] as unknown as Set<string>;
    const next = new Set(current);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange({ ...filters, [key]: next });
  }

  const activeFilterCount = filters.markets.size + filters.frictionTypes.size + filters.severities.size + filters.projectTypes.size;

  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={filters.developerSearch}
          onChange={(e) => onChange({ ...filters, developerSearch: e.target.value })}
          placeholder="Search by developer or company..."
          className="w-full flex-1 rounded-lg border border-[#1c1c1c]/15 px-3 py-1.5 text-sm text-[#1c1c1c] placeholder:text-[#1c1c1c]/30 focus:border-[#1c1c1c]/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            expanded ? "border-[#1c1c1c]/40 bg-[#1c1c1c]/5 text-[#1c1c1c]" : "border-[#1c1c1c]/15 text-[#1c1c1c]/60 hover:text-[#1c1c1c]"
          }`}
        >
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
          <svg viewBox="0 0 20 20" fill="none" className={`h-3 w-3 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}>
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 border-t border-[#1c1c1c]/10 pt-3">
          {markets.length > 1 && (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">Market</p>
              <div className="flex flex-wrap gap-1.5">
                {markets.map((market) => {
                  const isActive = filters.markets.has(market.id);
                  return (
                    <button
                      key={market.id}
                      type="button"
                      onClick={() => toggle("markets", market.id)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                        isActive
                          ? "border-transparent bg-[#1c1c1c] text-white"
                          : "border-[#1c1c1c]/15 bg-transparent text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
                      }`}
                    >
                      {market.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <PillRow
            label="Friction Type"
            options={FRICTION_TYPE_OPTIONS}
            labelMap={FRICTION_TYPE_LABEL}
            active={filters.frictionTypes}
            onToggle={(v) => toggle("frictionTypes", v)}
          />
          <PillRow
            label="Severity"
            options={SEVERITY_OPTIONS}
            labelMap={SHIFT_IMPACT_LABEL}
            active={filters.severities}
            onToggle={(v) => toggle("severities", v)}
          />
          <PillRow
            label="Project Type"
            options={PROJECT_TYPE_OPTIONS}
            labelMap={PROJECT_TYPE_LABEL}
            active={filters.projectTypes}
            onToggle={(v) => toggle("projectTypes", v)}
          />
        </div>
      )}
    </div>
  );
}
