"use client";

import { CATALYST_COLOR_GROUP_HEX, CATALYST_COLOR_GROUP_LABEL, type CatalystColorGroup } from "@/lib/catalystTypeColors";

const TYPE_ORDER: CatalystColorGroup[] = [
  "data_center",
  "infrastructure",
  "housing",
  "schools_civic",
  "government_incentives",
  "other",
];

// Institutional redesign (Jared, 2026-09-30): "Add a clean top filter bar"
// -- persistent Type pills (All Catalysts + the 6 color groups), replacing
// the old slide-out's Type section. Everything else (Stage/Time/Impact
// Radius/Market/Layers) lives in the trimmed FiltersPanel.tsx popover,
// opened via the "More Filters" button here.
export default function TopFilterBar({
  activeTypes,
  onChangeTypes,
  onOpenMoreFilters,
}: {
  activeTypes: Set<CatalystColorGroup>;
  onChangeTypes: (types: Set<CatalystColorGroup>) => void;
  onOpenMoreFilters: () => void;
}) {
  const allSelected = activeTypes.size === TYPE_ORDER.length;

  function selectAll() {
    onChangeTypes(new Set(TYPE_ORDER));
  }

  function selectOnly(type: CatalystColorGroup) {
    onChangeTypes(new Set([type]));
  }

  return (
    <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto rounded-full border border-white/[0.08] bg-[#0E0F12]/80 px-1.5 py-1.5 backdrop-blur-xl">
      <button
        type="button"
        onClick={selectAll}
        className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
          allSelected ? "bg-white/[0.08] text-[#EDECE8]" : "text-[#7A7E87] hover:text-[#C7C9CE]"
        }`}
      >
        All Catalysts
      </button>
      {TYPE_ORDER.map((type) => {
        const active = !allSelected && activeTypes.has(type);
        const color = CATALYST_COLOR_GROUP_HEX[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => selectOnly(type)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
              active ? "bg-white/[0.08] text-[#EDECE8]" : "text-[#7A7E87] hover:text-[#C7C9CE]"
            }`}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            {CATALYST_COLOR_GROUP_LABEL[type]}
          </button>
        );
      })}
      <div className="mx-1 h-4 w-px shrink-0 bg-white/[0.08]" />
      <button
        type="button"
        onClick={onOpenMoreFilters}
        className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#7A7E87] transition hover:text-[#C7C9CE]"
      >
        More Filters
      </button>
    </div>
  );
}
