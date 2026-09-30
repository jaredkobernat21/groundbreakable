"use client";

import type { CatalystWithSources } from "@/lib/types";
import { CATALYST_STATUS_LABEL } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { catalystColorHex } from "@/lib/catalystTypeColors";

// Institutional redesign (Jared, 2026-09-30): compact premium cards for
// whatever's currently in the map's viewport -- real live-viewport
// tracking (NationalCatalystMap.tsx's onViewportChange), not just the
// filtered list, per Jared's own confirmation this should be a genuine
// small interactive feature rather than CSS-only.
export default function CatalystsInViewRail({
  catalysts,
  selectedCatalystId,
  onSelectCatalyst,
}: {
  catalysts: CatalystWithSources[];
  selectedCatalystId: string | null;
  onSelectCatalyst: (id: string) => void;
}) {
  if (catalysts.length === 0) return null;

  return (
    <div className="pointer-events-auto flex gap-2 overflow-x-auto px-1 pb-1">
      {catalysts.map((catalyst) => {
        const color = catalystColorHex(catalyst);
        const isSelected = catalyst.id === selectedCatalystId;
        return (
          <button
            key={catalyst.id}
            type="button"
            onClick={() => onSelectCatalyst(catalyst.id)}
            className={`flex w-[220px] shrink-0 flex-col gap-1 rounded-lg border px-3 py-2.5 text-left backdrop-blur-xl transition ${
              isSelected ? "border-white/20 bg-white/[0.07]" : "border-white/[0.07] bg-[#0E0F12]/80 hover:border-white/15"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="truncate text-[12.5px] font-medium text-[#EDECE8]">{catalyst.title}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#7A7E87]">
              <span>{formatCurrency(catalyst.estimated_value) ?? catalyst.estimated_scale_note ?? CATALYST_STATUS_LABEL[catalyst.status]}</span>
              <span>·</span>
              <span>{CATALYST_STATUS_LABEL[catalyst.status]}</span>
            </div>
            {catalyst.address && <p className="truncate text-[11px] text-[#5C5F66]">{catalyst.address}</p>}
          </button>
        );
      })}
    </div>
  );
}
