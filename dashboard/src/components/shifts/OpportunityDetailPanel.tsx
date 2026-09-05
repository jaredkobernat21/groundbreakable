import type { DevelopmentOpportunityWithSources, GrowthArea, ZoningLandUseWithSource } from "@/lib/types";
import { GROWTH_AREA_MOMENTUM_LABEL, OPPORTUNITY_STRENGTH_LABEL } from "@/lib/types";
import { OPPORTUNITY_STRENGTH_COLOR, opportunitySignalLabel } from "@/lib/opportunityConstants";
import { formatDate } from "@/lib/format";

// The full click-through: address, opportunity type, strength, 3-5
// reasons, Momentum (which growth_areas polygon it falls inside, if any
// -- computed by the parent via pointInPolygon, not stored), Buildability
// (same idea against zoning_land_use), and every source record cited.
// Same right-anchored overlay convention as ShiftDetailPanel/
// InvestmentDetailPanel.
export default function OpportunityDetailPanel({
  opportunity,
  momentumArea,
  buildabilityZone,
  onClose,
}: {
  opportunity: DevelopmentOpportunityWithSources;
  momentumArea: GrowthArea | null;
  buildabilityZone: ZoningLandUseWithSource | null;
  onClose: () => void;
}) {
  const color = OPPORTUNITY_STRENGTH_COLOR[opportunity.strength];

  return (
    <div className="absolute right-3 top-16 bottom-3 z-30 w-[360px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:top-3">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>

      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${color}55`, color }}
      >
        {OPPORTUNITY_STRENGTH_LABEL[opportunity.strength]} Opportunity
      </div>

      <h2 className="mb-1 text-base font-semibold leading-snug text-white">{opportunity.address}</h2>
      <p className="mb-4 text-sm text-white/50">{opportunity.opportunity_type}</p>

      <div className="mb-4 border-t border-white/10 pt-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Why this is an opportunity</p>
        <ul className="space-y-2">
          {opportunity.reasons.map((reason, i) => (
            <li key={i} className="flex gap-2 text-sm text-white/80">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/40" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
        {opportunity.signals.map((signal) => (
          <span key={signal} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
            {opportunitySignalLabel(signal)}
          </span>
        ))}
      </div>

      <dl className="grid grid-cols-1 gap-3 border-t border-white/10 pt-4 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Momentum</dt>
          <dd className="text-white">
            {momentumArea
              ? `${momentumArea.name} — ${GROWTH_AREA_MOMENTUM_LABEL[momentumArea.momentum_state]}`
              : "Not inside a mapped momentum area"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Buildability</dt>
          <dd className="text-white">
            {buildabilityZone ? `${buildabilityZone.title}` : "Not yet mapped in the Buildability layer"}
          </dd>
        </div>
      </dl>

      {opportunity.sources.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Source records</p>
          {opportunity.sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="block text-xs text-white/45 hover:text-white/80"
            >
              {source.agency}
              {source.title ? ` — ${source.title}` : ""} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
