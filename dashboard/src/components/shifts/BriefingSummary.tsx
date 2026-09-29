import type { CatalystWithSources } from "@/lib/types";
import { CATALYST_LIGHT_ACCENT_COLOR, CATALYST_TYPE_LABEL } from "@/lib/types";
import { ICON_PATHS } from "@/lib/icons";
import Icon from "./Icon";

// The market's single spotlighted Catalyst (is_spotlight -- an
// editorially curated "the one development most likely to move this
// market" pick, at most one per market, see lib/queries/catalysts.ts) --
// rendered at the top of the Market tab so it's the first thing a
// developer sees when one exists. Nothing renders when no catalyst is
// spotlighted.
//
// The "Market Pulse" momentum headline that used to sit above this
// (trending growth area + trend badge + Plans/Opportunities counts) was
// removed per Jared, 2026-09-29 -- MetricCardRow already shows the
// Plans/Opportunities counts directly below.
export default function BriefingSummary({
  spotlightCatalyst,
  onSelectCatalyst,
}: {
  spotlightCatalyst: CatalystWithSources | null;
  onSelectCatalyst: (id: string) => void;
}) {
  if (!spotlightCatalyst) return null;

  return (
    <button
      type="button"
      onClick={() => onSelectCatalyst(spotlightCatalyst.id)}
      className="block w-full rounded-lg border p-3 text-left transition hover:opacity-90"
      style={{ borderColor: `${CATALYST_LIGHT_ACCENT_COLOR}55`, backgroundColor: `${CATALYST_LIGHT_ACCENT_COLOR}12` }}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: CATALYST_LIGHT_ACCENT_COLOR }}>
        <Icon paths={ICON_PATHS.pulse} className="h-3 w-3" strokeWidth={2.2} />
        Catalyst · {CATALYST_TYPE_LABEL[spotlightCatalyst.catalyst_type]}
      </div>
      <p className="mt-1 text-sm font-semibold leading-snug text-[#1c1c1c]">{spotlightCatalyst.title}</p>
      {(spotlightCatalyst.why_it_matters ?? spotlightCatalyst.description) && (
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#1c1c1c]/60">
          {spotlightCatalyst.why_it_matters ?? spotlightCatalyst.description}
        </p>
      )}
    </button>
  );
}
