import {
  OPPORTUNITIES_COLOR,
  OPPORTUNITY_TYPE_LABEL,
  STACKED_OPPORTUNITY_GLOW_COLOR,
  isStackedOpportunity,
  primarySignal,
  type OpportunityWithSource,
  type ProjectWithSource,
} from "@/lib/types";
import { formatCurrency, formatDate, formatRelativeVerified } from "@/lib/format";
import { bulbMarkerSvgMarkup, resolveOpportunityIcon } from "@/lib/markerIcons";
import { haversineDistanceMeters } from "@/lib/geo";

const CONFIDENCE_LABEL: Record<OpportunityWithSource["confidence"], string> = {
  verified: "Verified against primary source",
  reported: "Reported by named source",
  unconfirmed: "Unconfirmed — treat as preliminary",
};

function findNearestProject(opportunity: OpportunityWithSource, projects: ProjectWithSource[]) {
  let nearest: { project: ProjectWithSource; distanceMeters: number } | null = null;
  for (const project of projects) {
    const distanceMeters = haversineDistanceMeters(
      opportunity.latitude,
      opportunity.longitude,
      project.latitude,
      project.longitude
    );
    if (!nearest || distanceMeters < nearest.distanceMeters) {
      nearest = { project, distanceMeters };
    }
  }
  return nearest;
}

export default function OpportunityDetailPanel({
  opportunity,
  projects,
  onClose,
}: {
  opportunity: OpportunityWithSource;
  projects: ProjectWithSource[];
  onClose: () => void;
}) {
  const nearestActivity = findNearestProject(opportunity, projects);

  const hasInvestmentPotential = opportunity.asking_price != null && opportunity.estimated_resale_value != null;
  const potentialGain = hasInvestmentPotential
    ? opportunity.estimated_resale_value! - opportunity.asking_price!
    : null;
  const potentialGainPct =
    hasInvestmentPotential && opportunity.asking_price! > 0 ? (potentialGain! / opportunity.asking_price!) * 100 : null;

  const hasBuildability =
    opportunity.zoning_district || opportunity.permitted_uses || opportunity.rezoning_potential || opportunity.buildability_notes;

  const stacked = isStackedOpportunity(opportunity.signals);

  const hasPriceDrop = opportunity.original_list_price != null && opportunity.asking_price != null;
  const priceDropAmount = hasPriceDrop ? opportunity.original_list_price! - opportunity.asking_price! : null;
  const priceDropPct =
    hasPriceDrop && opportunity.original_list_price! > 0 ? (priceDropAmount! / opportunity.original_list_price!) * 100 : null;

  const facts = [
    opportunity.estimated_equity != null && {
      label: "Estimated Equity",
      value: formatCurrency(opportunity.estimated_equity),
    },
    opportunity.assessed_value != null && {
      label: "Assessed Value",
      value: formatCurrency(opportunity.assessed_value),
    },
    opportunity.years_owned != null && { label: "Years Owned", value: `${opportunity.years_owned}` },
    opportunity.is_absentee != null && { label: "Absentee Owner", value: opportunity.is_absentee ? "Yes" : "No" },
    opportunity.opportunity_score != null && { label: "Opportunity Score", value: `${opportunity.opportunity_score}/100` },
    opportunity.lot_size_acres != null && { label: "Lot Size", value: `${opportunity.lot_size_acres} acres` },
    opportunity.code_violation_count != null && { label: "Code Violations", value: `${opportunity.code_violation_count}` },
    opportunity.vacant_since != null && { label: "Vacant Since", value: formatDate(opportunity.vacant_since) },
    hasPriceDrop && {
      label: "Price Drop",
      value: `${formatCurrency(priceDropAmount)}${priceDropPct != null ? ` (${priceDropPct.toFixed(0)}%)` : ""}`,
    },
  ].filter(Boolean) as { label: string; value: string | null }[];

  return (
    <div className="absolute right-3 top-3 bottom-3 w-[340px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 text-white/40 hover:text-white"
      >
        ✕
      </button>

      {stacked && (
        <div
          className="mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{
            borderColor: `${STACKED_OPPORTUNITY_GLOW_COLOR}66`,
            color: STACKED_OPPORTUNITY_GLOW_COLOR,
            backgroundColor: `${STACKED_OPPORTUNITY_GLOW_COLOR}1f`,
          }}
        >
          {opportunity.signals.length} Signals Stacked
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {opportunity.signals.map((signal) => (
          <span
            key={signal}
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
            style={{ borderColor: `${OPPORTUNITIES_COLOR}55`, color: OPPORTUNITIES_COLOR, backgroundColor: `${OPPORTUNITIES_COLOR}1a` }}
          >
            {signal === primarySignal(opportunity.signals) && (
              <span
                className="flex h-3 w-3 items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: bulbMarkerSvgMarkup({ size: 12, fill: OPPORTUNITIES_COLOR, icon: resolveOpportunityIcon(opportunity.signals) }),
                }}
              />
            )}
            {OPPORTUNITY_TYPE_LABEL[signal]}
          </span>
        ))}
      </div>

      <h2 className="pr-6 text-lg font-semibold leading-snug text-white">{opportunity.address}</h2>
      {opportunity.listing_status && <div className="mt-1 text-sm text-white/50">{opportunity.listing_status}</div>}
      {opportunity.owner_name && <div className="mt-1 text-sm text-white/40">Owner: {opportunity.owner_name}</div>}

      {opportunity.distress_indicators && opportunity.distress_indicators.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {opportunity.distress_indicators.map((indicator) => (
            <span
              key={indicator}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50"
            >
              {indicator.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Why Groundbreakable Flagged It</div>
        <p className="text-sm leading-relaxed text-white/70">{opportunity.why_flagged}</p>
      </div>

      {opportunity.code_violation_summary && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Code Violations</div>
          <p className="text-sm leading-relaxed text-white/70">{opportunity.code_violation_summary}</p>
        </div>
      )}

      {nearestActivity && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Distance from Activity</div>
          <p className="text-sm text-white/70">
            {(nearestActivity.distanceMeters / 1609.34).toFixed(2)} mi from{" "}
            <span className="text-white">{nearestActivity.project.title}</span>
          </p>
        </div>
      )}

      {hasInvestmentPotential && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Investment Potential</div>
          <dl className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/35">Asking Price</dt>
              <dd className="mt-0.5 text-sm font-medium text-white">{formatCurrency(opportunity.asking_price)}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/35">Estimated Resale Value</dt>
              <dd className="mt-0.5 text-sm font-medium text-white">
                {formatCurrency(opportunity.estimated_resale_value)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/35">Potential Gain</dt>
              <dd className={`mt-0.5 text-sm font-medium ${potentialGain! >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(potentialGain)}
                {potentialGainPct != null && ` (${potentialGainPct.toFixed(0)}%)`}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {hasBuildability && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Buildability</div>
          <dl className="mt-2 space-y-2">
            {opportunity.zoning_district && (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/35">Zoning District</dt>
                <dd className="mt-0.5 text-sm text-white">{opportunity.zoning_district}</dd>
              </div>
            )}
            {opportunity.permitted_uses && (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/35">Potentially Buildable Uses</dt>
                <dd className="mt-0.5 text-sm text-white/70">{opportunity.permitted_uses}</dd>
              </div>
            )}
            {opportunity.rezoning_potential && (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/35">Rezoning Potential</dt>
                <dd className="mt-0.5 text-sm text-white/70">{opportunity.rezoning_potential}</dd>
              </div>
            )}
            {opportunity.buildability_notes && (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/35">Notes (fire code, permits, etc.)</dt>
                <dd className="mt-0.5 text-sm text-white/70">{opportunity.buildability_notes}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {facts.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[11px] uppercase tracking-wide text-white/35">{fact.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-white">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {opportunity.date_identified && (
        <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/60">
          Identified {formatDate(opportunity.date_identified)}
        </div>
      )}

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <div>{CONFIDENCE_LABEL[opportunity.confidence]}</div>
        {opportunity.source && (
          <div>
            Source:{" "}
            <a
              href={opportunity.source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/70 underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              {opportunity.source.agency}
            </a>
          </div>
        )}
        <div>Last verified {formatRelativeVerified(opportunity.last_verified_at)}</div>
      </div>
    </div>
  );
}
