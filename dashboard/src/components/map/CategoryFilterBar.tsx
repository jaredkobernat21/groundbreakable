"use client";

import { useEffect, useRef, useState } from "react";
import { CATALYST_COLOR_GROUP_HEX, CATALYST_COLOR_GROUP_LABEL } from "@/lib/catalystTypeColors";
import { DC_STAGE_COLOR_HEX, DC_STAGE_LABEL, type DcStage } from "@/lib/catalysts/dcStage";
import { HOUSING_STAGE_LABEL, type HousingStage } from "@/lib/catalysts/housingStage";
import type { CategoryFilterValue } from "./FiltersPanel";

// "All" sits last -- an explicit opt-in to see every category together,
// not the default view.
const CATEGORY_ORDER: CategoryFilterValue[] = ["data_center", "infrastructure", "schools_civic", "housing", "other", "all"];
const CATEGORY_LABEL: Record<CategoryFilterValue, string> = {
  ...CATALYST_COLOR_GROUP_LABEL,
  all: "All",
};
const DC_STAGES: DcStage[] = ["potential", "possible", "planned"];
const HOUSING_STAGES: HousingStage[] = ["potential", "planned"];
// Housing keeps one map color for both subcategories (Jared's instruction)
// -- unlike DC_STAGE_COLOR_HEX's 3-color ramp, both pills use the same
// Housing group color.
const HOUSING_STAGE_PILL_COLOR = CATALYST_COLOR_GROUP_HEX.housing;

// Data Center Refocus (Jared, 2026-10-02): "The filter at the top should
// have 'data centers' as the default and then when you click on it you can
// switch between data centers, infrastructure, schools, housing." This is
// the map's top-nav anchor -- a single-select category dropdown (Data
// Centers by default) plus, only while Data Centers is selected, the
// Possible/Planned sub-filter pills with live counts. Replaces
// the old DcStageSummaryBar, which always showed all three stages as
// equally-primary pills regardless of category.
export default function CategoryFilterBar({
  category,
  onCategoryChange,
  categoryCount,
  dcStageCounts,
  activeDcStages,
  onToggleDcStage,
  housingStageCounts,
  activeHousingStages,
  onToggleHousingStage,
}: {
  category: CategoryFilterValue;
  onCategoryChange: (category: CategoryFilterValue) => void;
  categoryCount: number;
  dcStageCounts: Record<DcStage, number>;
  activeDcStages: Set<DcStage>;
  onToggleDcStage: (stage: DcStage) => void;
  housingStageCounts: Record<HousingStage, number>;
  activeHousingStages: Set<HousingStage>;
  onToggleHousingStage: (stage: HousingStage) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="pointer-events-auto flex shrink-0 items-center gap-1.5">
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-black/50 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm hover:border-white/30 sm:text-xs"
        >
          <span className="font-semibold">{categoryCount}</span>
          {CATEGORY_LABEL[category]}
          <span className="text-white/40">{menuOpen ? "▲" : "▼"}</span>
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-white/10 bg-black/90 py-1 shadow-2xl backdrop-blur-xl">
            {CATEGORY_ORDER.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  onCategoryChange(value);
                  setMenuOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-xs ${
                  value === category ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {CATEGORY_LABEL[value]}
              </button>
            ))}
          </div>
        )}
      </div>

      {category === "data_center" && (
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-1.5 py-1 backdrop-blur-sm">
          {DC_STAGES.map((stage) => {
            const active = activeDcStages.has(stage);
            const color = DC_STAGE_COLOR_HEX[stage];
            return (
              <button
                key={stage}
                type="button"
                onClick={() => onToggleDcStage(stage)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium transition sm:px-2.5 sm:py-1.5 sm:text-xs"
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.4)",
                  backgroundColor: active ? `${color}26` : "transparent",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color, opacity: active ? 1 : 0.4 }} />
                <span className="font-semibold">{dcStageCounts[stage]}</span>
                <span className="hidden sm:inline">{DC_STAGE_LABEL[stage]}</span>
              </button>
            );
          })}
        </div>
      )}

      {category === "housing" && (
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-1.5 py-1 backdrop-blur-sm">
          {HOUSING_STAGES.map((stage) => {
            const active = activeHousingStages.has(stage);
            return (
              <button
                key={stage}
                type="button"
                onClick={() => onToggleHousingStage(stage)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium transition sm:px-2.5 sm:py-1.5 sm:text-xs"
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.4)",
                  backgroundColor: active ? `${HOUSING_STAGE_PILL_COLOR}26` : "transparent",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: HOUSING_STAGE_PILL_COLOR, opacity: active ? 1 : 0.4 }} />
                <span className="font-semibold">{housingStageCounts[stage]}</span>
                <span className="hidden sm:inline">{HOUSING_STAGE_LABEL[stage]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
