import type { CatalystWithSources, DevelopmentOpportunityWithSources } from "@/lib/types";
import { CATALYST_STATUS_LABEL, CATALYST_TYPE_LABEL, CATALYSTS_COLOR } from "@/lib/types";
import { formatCurrency, formatDate, formatRelativeVerified } from "@/lib/format";
import { catalystMarkerSvgMarkup } from "@/lib/markerIcons";
import { planItemKey, planItemSubtitle, planItemTitle, type PlanItem } from "@/lib/planItems";

const CONFIDENCE_LABEL: Record<CatalystWithSources["confidence"], string> = {
  verified: "Verified against primary source",
  reported: "Reported by named source",
  unconfirmed: "Unconfirmed — treat as preliminary",
};

// The live dashboard's Catalyst detail surface -- same right-anchored
// dark-glass overlay convention as every other detail panel (ShiftDetailPanel/
// OpportunityDetailPanel/PlanDetailPanel). Distinct from the legacy
// components/intelligence/CatalystDetailPanel.tsx, which targets the old
// opportunities/ProjectWithSource types still used by /preview/topeka --
// this one targets the current development_opportunities/PlanItem types
// the live Plans/Opportunities dashboard actually uses.
export default function CatalystDetailPanel({
  catalyst,
  nearbyPlans,
  nearbyOpportunities,
  onSelectPlan,
  onSelectOpportunity,
  onClose,
}: {
  catalyst: CatalystWithSources;
  nearbyPlans: PlanItem[];
  nearbyOpportunities: DevelopmentOpportunityWithSources[];
  onSelectPlan: (key: string) => void;
  onSelectOpportunity: (id: string) => void;
  onClose: () => void;
}) {
  const sources = [catalyst.source, ...catalyst.additionalSources].filter((s): s is NonNullable<typeof s> => s != null);

  return (
    <div className="absolute right-3 top-16 bottom-3 z-30 w-[400px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:top-3">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>

      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${CATALYSTS_COLOR}55`, color: CATALYSTS_COLOR, backgroundColor: `${CATALYSTS_COLOR}1a` }}
      >
        <span className="flex h-3 w-3 items-center justify-center" dangerouslySetInnerHTML={{ __html: catalystMarkerSvgMarkup({ size: 12, fill: CATALYSTS_COLOR }) }} />
        Catalyst · {CATALYST_TYPE_LABEL[catalyst.catalyst_type]}
        {catalyst.is_spotlight && <span className="text-amber-300">★ Spotlight</span>}
      </div>

      <h2 className="pr-6 text-lg font-semibold leading-snug text-white">{catalyst.title}</h2>
      <div className="mt-1 text-sm text-white/50">{CATALYST_STATUS_LABEL[catalyst.status]}</div>
      {catalyst.address && <div className="mt-1 text-sm text-white/40">{catalyst.address}</div>}

      {catalyst.description && <p className="mt-4 text-sm leading-relaxed text-white/70">{catalyst.description}</p>}

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
        {(catalyst.estimated_value != null || catalyst.estimated_scale_note) && (
          <div className="col-span-2">
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Estimated Scale</dt>
            <dd className="mt-0.5 text-sm font-medium text-white">
              {[catalyst.estimated_value != null ? formatCurrency(catalyst.estimated_value) : null, catalyst.estimated_scale_note]
                .filter(Boolean)
                .join(" · ")}
            </dd>
          </div>
        )}
        {catalyst.expected_timeline && (
          <div className="col-span-2">
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Expected Timeline</dt>
            <dd className="mt-0.5 text-sm font-medium text-white">{catalyst.expected_timeline}</dd>
          </div>
        )}
      </dl>

      {catalyst.why_it_matters && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Why It Matters</p>
          <p className="text-sm leading-relaxed text-white/70">{catalyst.why_it_matters}</p>
        </div>
      )}

      {catalyst.development_impact && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Potential Development Impact</p>
          <p className="text-sm leading-relaxed text-white/70">{catalyst.development_impact}</p>
        </div>
      )}

      {catalyst.related_context.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Related Infrastructure / Zoning / Incentives</p>
          <ul className="space-y-1.5">
            {catalyst.related_context.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/80">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-wide text-white/35">Related Plans ({nearbyPlans.length})</p>
        {nearbyPlans.length === 0 ? (
          <p className="text-sm text-white/40">No related Plans found nearby.</p>
        ) : (
          <ul className="space-y-1.5">
            {nearbyPlans.map((plan) => (
              <li key={planItemKey(plan)}>
                <button type="button" onClick={() => onSelectPlan(planItemKey(plan))} className="text-left text-sm text-white/70 hover:text-white">
                  <span className="font-medium">{planItemTitle(plan)}</span>
                  <span className="text-white/40"> — {planItemSubtitle(plan)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-wide text-white/35">Related Opportunities ({nearbyOpportunities.length})</p>
        {nearbyOpportunities.length === 0 ? (
          <p className="text-sm text-white/40">No related Opportunities found nearby.</p>
        ) : (
          <ul className="space-y-1.5">
            {nearbyOpportunities.map((opp) => (
              <li key={opp.id}>
                <button type="button" onClick={() => onSelectOpportunity(opp.id)} className="text-left text-sm text-white/70 hover:text-white">
                  <span className="font-medium">{opp.address}</span>
                  <span className="text-white/40"> — {opp.opportunity_type}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {catalyst.date_announced && (
        <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/60">Announced {formatDate(catalyst.date_announced)}</div>
      )}

      {sources.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Sources</p>
          {sources.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer noopener" className="block text-xs text-white/45 hover:text-white/80">
              {source.agency}
              {source.title ? ` — ${source.title}` : ""} ↗
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <div>{CONFIDENCE_LABEL[catalyst.confidence]}</div>
        <div>Last verified {formatRelativeVerified(catalyst.last_verified_at)}</div>
      </div>
    </div>
  );
}
