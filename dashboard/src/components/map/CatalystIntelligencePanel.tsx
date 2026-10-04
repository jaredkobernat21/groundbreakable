"use client";

import type { CatalystWithSources } from "@/lib/types";
import { CATALYST_STATUS_LABEL, CATALYST_TYPE_LABEL } from "@/lib/types";
import { DATA_CENTER_SIGNAL_LABEL } from "@/lib/catalysts/dataCenterSignal";
import { formatCurrency, formatRelativeVerified } from "@/lib/format";
import { catalystColorHex, CATALYST_COLOR_GROUP_LABEL, catalystColorGroup } from "@/lib/catalystTypeColors";
import {
  computeDcStage,
  dcConfidenceLabel,
  dcSignalCount,
  DC_STAGE_COLOR_HEX,
  DC_STAGE_HEADLINE,
  DC_STAGE_LABEL,
  nearbySupportingCatalysts,
} from "@/lib/catalysts/dcStage";
import { computeHousingStage, HOUSING_STAGE_HEADLINE, HOUSING_STAGE_LABEL } from "@/lib/catalysts/housingStage";
import {
  computeWhyHousingSiteSummary,
  ENTITLEMENT_STATUS_DESCRIPTION,
  ENTITLEMENT_STATUS_LABEL,
  HOUSING_TYPE_LABEL,
} from "@/lib/catalysts/housingPotentialCriteria";
import {
  APPROVAL_PILLAR_LABEL,
  CITY_RECEPTIVENESS_LABEL,
  COMMUNITY_FRICTION_LABEL,
  computeDataConfidence,
  computeNextSteps,
  computeReadinessStage,
  computeWhySiteSummary,
  DEVELOPER_ASSESSMENT_COLOR_HEX,
  DEVELOPER_ASSESSMENT_DESCRIPTION,
  DEVELOPER_ASSESSMENT_LABEL,
  ENTITLEMENT_VELOCITY_LABEL,
  INTELLIGENCE_CATEGORY_LABEL,
  ownersOrLegacyOwner,
  PILLAR_STRENGTH_LABEL,
  POTENTIAL_EVIDENCE_STATUS_LABEL,
  POTENTIAL_SITE_CATEGORY_FACTORS,
  POTENTIAL_SITE_FACTOR_LABEL,
  POTENTIAL_SITE_FACTOR_WEIGHT,
  POTENTIAL_SITE_TYPE_LABEL,
  READINESS_STAGE_DESCRIPTION,
  READINESS_STAGE_LABEL,
  siteOwnershipSummary,
  UTILITY_TIMELINE_BUCKET_CAPTION,
  UTILITY_TIMELINE_BUCKET_LABEL,
  type IntelligenceCategory,
} from "@/lib/catalysts/potentialSiteCriteria";
import {
  DEVELOPMENT_IMPACT_LEVEL_LABEL,
  DEVELOPMENT_IMPACT_TYPE_LABEL,
  infrastructureStatusGroup,
  INFRASTRUCTURE_STATUS_GROUP_LABEL,
  INFRASTRUCTURE_TYPE_LABEL,
} from "@/lib/catalysts/infrastructureCriteria";
import type { PotentialEvidenceStatus, PotentialScoreComponent, PotentialSitePeople, ReadinessStage } from "@/lib/types";

const CONFIDENCE_LABEL: Record<CatalystWithSources["confidence"], string> = {
  verified: "Verified against primary source",
  reported: "Reported by named source",
  unconfirmed: "Unconfirmed — treat as preliminary",
};

// Small inline confidence badge for a single Potential factor (2026-10-03) --
// a different axis from a pillar's strength label: "how sure are we," not
// "how good is this." Optional on each score component, so most existing
// rows simply never render one.
function EvidenceBadge({ status }: { status: PotentialEvidenceStatus }) {
  const style =
    status === "verified"
      ? "border-emerald-400/30 text-emerald-300"
      : status === "reported" || status === "indicated" || status === "estimated"
        ? "border-amber-400/30 text-amber-300"
        : "border-white/15 text-white/40";
  return <span className={`rounded border px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide ${style}`}>{POTENTIAL_EVIDENCE_STATUS_LABEL[status]}</span>;
}

// Renders one PEOPLE sub-group (Owner/Utility/Government/Development) as a
// compact label: value list -- only the fields a researcher actually found
// are shown, never a placeholder for a missing one. Shared by all four
// sub-groups in the Potential stage's People section instead of repeating
// the same filter/map four times.
function PeopleFactGroup({ label, facts }: { label: string; facts: [string, string | undefined][] }) {
  const present = facts.filter((f): f is [string, string] => Boolean(f[1]));
  if (present.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/40">{label}</p>
      <div className="space-y-1">
        {present.map(([factLabel, value]) => (
          <p key={factLabel} className="leading-relaxed">
            <span className="text-white/40">{factLabel}: </span>
            {value}
          </p>
        ))}
      </div>
    </div>
  );
}

// Compact label:value row shared by the buyer-intelligence accordions (POWER/LAND/BTM ENERGY/
// CONNECTIVITY + WATER) added 2026-10-04 -- only renders when the fact is actually on file,
// never a placeholder for an unresearched one.
function FactRow({ label, value, status }: { label: string; value: string | number | null | undefined; status?: PotentialEvidenceStatus | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-white/40">{label}</span>
      <span className="flex items-center gap-1.5 text-right text-white/80">
        {value}
        {status && <EvidenceBadge status={status} />}
      </span>
    </div>
  );
}

// SITE CONTROL (2026-10-04 buyer-intelligence brief) -- DC Potential's own ownership section,
// distinct from the generic PotentialPeopleSection below (still used as-is by Housing Potential
// and Infrastructure). Iterates `owners[]` (falling back to the legacy single `people.owner` via
// ownersOrLegacyOwner) so a site with multiple owners shows each one's controlled acreage/parcels
// separately, per the buyer brief's "who controls the land, and how do I reach them" goal. Utility/
// Government/Development contacts stay sourced from the same `people` column as before -- only the
// Owner sub-group's shape changed.
function DcSiteControlSection({ catalyst }: { catalyst: CatalystWithSources }) {
  const owners = ownersOrLegacyOwner(catalyst);
  const summary = siteOwnershipSummary(catalyst);

  return (
    <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
        <span>Site Control</span>
        <span className="text-white/60">{owners.length > 0 ? `${summary.ownerCount} Owner${summary.ownerCount === 1 ? "" : "s"}` : "Research Pending"}</span>
      </summary>
      <div className="mt-2 space-y-3 text-sm text-white/70">
        {owners.length === 0 && <p className="text-white/40">Not yet researched — ownership and sale/option willingness is a recommended next step.</p>}
        {owners.length > 0 && (
          <div className="flex gap-4 text-xs text-white/50">
            <span>
              Owners: <span className="text-white/80">{summary.ownerCount}</span>
            </span>
            {summary.totalParcels != null && (
              <span>
                Parcels: <span className="text-white/80">{summary.totalParcels}</span>
              </span>
            )}
            <span>
              Complexity: <span className="text-white/80">{summary.complexityLabel}</span>
            </span>
          </div>
        )}
        {owners.map((owner, i) => (
          <div key={i} className={owners.length > 1 ? "border-t border-white/10 pt-2 first:border-t-0 first:pt-0" : undefined}>
            {owners.length > 1 && <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/40">Owner {i + 1}</p>}
            <div className="space-y-1">
              {([
                ["Owner", owner.name],
                ["Entity", owner.entity],
                ["Controlled Acreage", owner.controlled_acreage != null ? `${owner.controlled_acreage} acres` : undefined],
                ["Parcels", owner.parcel_count],
                ["Mailing Address", owner.mailing_address],
                ["Registered Agent", owner.registered_agent],
                ["Public Phone", owner.public_contact?.phone],
                ["Public Email", owner.public_contact?.email],
                ["Website", owner.public_contact?.website],
                ["Ownership Complexity", owner.ownership_complexity],
                ["Last Verified", owner.last_verified],
                ["Source", owner.source],
                ["Notes", owner.notes],
              ] as const).map(([label, value]) =>
                value != null && value !== "" ? (
                  <p key={label} className="leading-relaxed">
                    <span className="text-white/40">{label}: </span>
                    {value}
                  </p>
                ) : null
              )}
            </div>
          </div>
        ))}
        {catalyst.people?.utility && (
          <PeopleFactGroup
            label="Utility"
            facts={[
              ["Utility", catalyst.people.utility.utility],
              ["Economic Development Contact", catalyst.people.utility.economic_development_contact],
              ["Large-Load Contact", catalyst.people.utility.large_load_contact],
              ["Engineer Contact", catalyst.people.utility.engineer_contact],
              ["Notes", catalyst.people.utility.notes],
            ]}
          />
        )}
        {catalyst.people?.government && (
          <PeopleFactGroup
            label="Government"
            facts={[
              ["Municipality", catalyst.people.government.municipality],
              ["County", catalyst.people.government.county],
              ["Planning Department", catalyst.people.government.planning_department],
              ["Economic Development Org", catalyst.people.government.economic_development_org],
              ["Decision-Making Body", catalyst.people.government.decision_making_body],
              ["Notes", catalyst.people.government.notes],
            ]}
          />
        )}
        {catalyst.people?.development && (
          <PeopleFactGroup
            label="Development"
            facts={[
              ["Developer", catalyst.people.development.developer],
              ["Broker", catalyst.people.development.broker],
              ["Site Selection Contact", catalyst.people.development.site_selection_contact],
              ["EPC", catalyst.people.development.epc],
              ["Engineering Firm", catalyst.people.development.engineering_firm],
              ["Energy Developer", catalyst.people.development.energy_developer],
              ["Gas Provider", catalyst.people.development.gas_provider],
              ["Notes", catalyst.people.development.notes],
            ]}
          />
        )}
      </div>
    </details>
  );
}

// Shared across every Potential-tier catalyst_type (prospective_data_center_site,
// prospective_housing_site) -- the `people`/readiness_stage/readiness_notes/
// next_steps columns are generic/catalyst-agnostic (see migration
// 20261003180000_housing_potential_subcategory.sql), so this markup is
// written once rather than duplicated per Potential tier.
function PotentialPeopleSection({ people }: { people: PotentialSitePeople | null }) {
  return (
    <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
        <span>People</span>
        <span className="text-white/60">{people ? "Logged" : "Not yet researched"}</span>
      </summary>
      <div className="mt-2 space-y-3 text-sm text-white/70">
        {people?.owner && (
          <PeopleFactGroup
            label="Owner"
            facts={[
              ["Name", people.owner.name],
              ["Entity", people.owner.entity],
              ["Contact", people.owner.contact],
              ["Ownership Since", people.owner.ownership_since],
              ["Outreach Status", people.owner.outreach_status],
              ["Interest Status", people.owner.interest_status],
              ["Asking Price", people.owner.asking_price],
              ["Site Control Status", people.owner.site_control_status],
              ["Mineral Rights", people.owner.mineral_rights],
              ["Notes", people.owner.notes],
            ]}
          />
        )}
        {people?.utility && (
          <PeopleFactGroup
            label="Utility"
            facts={[
              ["Utility", people.utility.utility],
              ["Economic Development Contact", people.utility.economic_development_contact],
              ["Large-Load Contact", people.utility.large_load_contact],
              ["Engineer Contact", people.utility.engineer_contact],
              ["Notes", people.utility.notes],
            ]}
          />
        )}
        {people?.government && (
          <PeopleFactGroup
            label="Government"
            facts={[
              ["Municipality", people.government.municipality],
              ["County", people.government.county],
              ["Planning Department", people.government.planning_department],
              ["Economic Development Org", people.government.economic_development_org],
              ["Decision-Making Body", people.government.decision_making_body],
              ["Notes", people.government.notes],
            ]}
          />
        )}
        {people?.development && (
          <PeopleFactGroup
            label="Development"
            facts={[
              ["Developer", people.development.developer],
              ["Broker", people.development.broker],
              ["Site Selection Contact", people.development.site_selection_contact],
              ["EPC", people.development.epc],
              ["Engineering Firm", people.development.engineering_firm],
              ["Energy Developer", people.development.energy_developer],
              ["Gas Provider", people.development.gas_provider],
              ["Notes", people.development.notes],
            ]}
          />
        )}
        {!people && <p className="text-white/40">Not yet researched — ownership and utility contacts are a recommended next step.</p>}
      </div>
    </details>
  );
}

function PotentialReadinessSection({ readinessStage, readinessNotes }: { readinessStage: ReadinessStage; readinessNotes: string | null }) {
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Readiness</p>
      <p className="text-sm font-medium text-white">{READINESS_STAGE_LABEL[readinessStage]}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/50">{READINESS_STAGE_DESCRIPTION[readinessStage]}</p>
      {readinessNotes && <p className="mt-1 text-xs leading-relaxed text-white/60">{readinessNotes}</p>}
    </div>
  );
}

function PotentialNextStepsSection({ nextSteps }: { nextSteps: string[] }) {
  if (nextSteps.length === 0) return null;
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-white/35">Next Steps</p>
      <ol className="space-y-1 text-sm text-white/70">
        {nextSteps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-white/30">{i + 1}.</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (24 * 60 * 60 * 1000));
}

function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Data Center Refocus (Jared, 2026-10-01; collapsed to 2 stages 2026-10-02)
// -- this panel branches on the catalyst's DC stage (lib/catalysts/
// dcStage.ts) and leads with the exact UI-goal headline from the brief for
// that stage, instead of treating every catalyst_type identically. A
// catalyst with no DC stage (a pure supporting-layer item, only reachable
// via a non-Data-Centers category tab or the "why we're watching" list
// below) falls back to the original type-group framing. Possible now covers
// both a single isolated signal and a converging multi-signal
// `potential_data_center` investigation -- the richer confidence/signal-
// count detail only renders when signal_confidence is actually on file.
// Shared detail content -- extracted (2026-10-02, mobile optimization) so
// the mobile bottom sheet's "View Project" expansion can reuse the exact
// same catalyst detail rendering instead of rebuilding it. This component
// is the full content with no outer chrome (no absolute positioning, no
// close button) so either caller can wrap it however it needs to
// (desktop's floating panel below, or MobileBottomSheet's scrollable sheet
// body).
export function CatalystDetails({
  catalyst,
  allCatalysts,
  isFollowing,
  onToggleFollow,
}: {
  catalyst: CatalystWithSources;
  allCatalysts: CatalystWithSources[];
  isFollowing: boolean;
  onToggleFollow: () => void;
}) {
  const dcStage = computeDcStage(catalyst);
  const housingStage = computeHousingStage(catalyst);
  const color = dcStage ? DC_STAGE_COLOR_HEX[dcStage] : catalystColorHex(catalyst);
  const sources = [catalyst.source, ...catalyst.additionalSources].filter((s): s is NonNullable<typeof s> => s != null);
  const confidenceLabel = dcConfidenceLabel(catalyst.signal_confidence);
  const flaggedEarly =
    dcStage === "planned" && catalyst.date_announced != null && new Date(catalyst.date_announced).getTime() > new Date(catalyst.created_at).getTime();
  const watching = dcStage ? nearbySupportingCatalysts(catalyst, allCatalysts) : [];

  // Groups the underlying 8-factor score breakdown under each of the 4
  // Energy/Timeline/Risk/People categories (Jared's 2026-10-03 brief),
  // purely for the "expand into supporting details" view --
  // POTENTIAL_SITE_CATEGORY_FACTORS is the single source of truth for
  // which factor belongs under which category.
  const potentialComponentsByCategory: Record<IntelligenceCategory, PotentialScoreComponent[]> = {
    power: [],
    land: [],
    btm_energy: [],
    connectivity_water: [],
    entitlement: [],
  };
  if (catalyst.potential_score_components) {
    for (const component of catalyst.potential_score_components) {
      for (const category of Object.keys(POTENTIAL_SITE_CATEGORY_FACTORS) as IntelligenceCategory[]) {
        if (POTENTIAL_SITE_CATEGORY_FACTORS[category].includes(component.key)) {
          potentialComponentsByCategory[category].push(component);
        }
      }
    }
  }
  // readiness_stage/next_steps are generic, catalyst-agnostic columns (see
  // migration 20261003180000_housing_potential_subcategory.sql) shared by
  // every Potential-tier catalyst_type -- computed once here for whichever
  // one applies. why_this_site's synthesis differs per tier (different
  // source fields to draw from), so each tier gets its own summary below.
  const isPotentialTier = dcStage === "potential" || housingStage === "potential";
  const whySiteSummary = dcStage === "potential" ? computeWhySiteSummary(catalyst) : null;
  const whyHousingSiteSummary = housingStage === "potential" ? computeWhyHousingSiteSummary(catalyst) : null;
  const readinessStage = isPotentialTier ? computeReadinessStage(catalyst) : null;
  const nextSteps = isPotentialTier ? computeNextSteps(catalyst) : [];
  // Buyer-intelligence brief (2026-10-04) -- Data Confidence is DC-Potential-only (the fields it
  // reads, e.g. available_capacity_status/gas_pipeline_distance_miles, are meaningful only for
  // prospective_data_center_site rows); Housing Potential has no equivalent concept yet.
  const dataConfidence = dcStage === "potential" ? computeDataConfidence(catalyst) : null;

  // Infrastructure brief (2026-10-03) -- NOT a Potential/Planned tier like
  // the two above; a project-delivery lifecycle instead (see
  // lib/catalysts/infrastructureCriteria.ts).
  const isInfrastructure = catalyst.catalyst_type === "infrastructure_project";
  const infraStatusGroup = isInfrastructure ? infrastructureStatusGroup(catalyst.status) : null;
  const relatedOpportunities = isInfrastructure
    ? catalyst.related_catalyst_ids.map((id) => allCatalysts.find((c) => c.id === id)).filter((c): c is CatalystWithSources => c != null)
    : [];
  // "4 Potential Housing sites" / "1 Potential Data Center site" -- grouped
  // by the same stage labels the Potential tiers themselves use, not the
  // raw catalyst_type, so this reads identically to how the linked site
  // describes itself elsewhere in the product.
  const opportunityCounts = new Map<string, number>();
  for (const related of relatedOpportunities) {
    const relatedDcStage = computeDcStage(related);
    const relatedHousingStage = computeHousingStage(related);
    const label =
      relatedDcStage === "potential" ? "Potential Data Center site" : relatedHousingStage === "potential" ? "Potential Housing site" : CATALYST_TYPE_LABEL[related.catalyst_type];
    opportunityCounts.set(label, (opportunityCounts.get(label) ?? 0) + 1);
  }

  return (
    <>
      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${color}55`, color, backgroundColor: `${color}1a` }}
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {dcStage
          ? `${DC_STAGE_LABEL[dcStage]} Data Center`
          : housingStage
            ? `${HOUSING_STAGE_LABEL[housingStage]} Housing`
            : isInfrastructure && catalyst.infrastructure_type
              ? `${INFRASTRUCTURE_TYPE_LABEL[catalyst.infrastructure_type]} Infrastructure`
              : CATALYST_COLOR_GROUP_LABEL[catalystColorGroup(catalyst)]}
      </div>

      <h2 className="pr-6 text-lg font-semibold leading-snug text-white">{catalyst.title}</h2>
      <div className="mt-1 text-sm text-white/50">
        {CATALYST_TYPE_LABEL[catalyst.catalyst_type]} · {CATALYST_STATUS_LABEL[catalyst.status]}
      </div>
      {catalyst.address && <div className="mt-1 text-sm text-white/40">{catalyst.address}</div>}

      {dcStage === "potential" && catalyst.potential_site_type && (
        <div className="mt-1.5 inline-flex items-center rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50">
          {POTENTIAL_SITE_TYPE_LABEL[catalyst.potential_site_type]}
        </div>
      )}

      {housingStage === "potential" && catalyst.housing_type && (
        <div className="mt-1.5 inline-flex items-center rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50">
          {HOUSING_TYPE_LABEL[catalyst.housing_type]}
        </div>
      )}

      {/* Status (lifecycle bucket) + Timeline, ahead of Why It Matters,
          per the brief's top-of-panel ordering: Project Name / Type /
          Status / Timeline, then Why It Matters. */}
      {isInfrastructure && (infraStatusGroup || catalyst.expected_timeline) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-white/50">
          {infraStatusGroup && <span className="font-medium text-white/70">{INFRASTRUCTURE_STATUS_GROUP_LABEL[infraStatusGroup]}</span>}
          {infraStatusGroup && catalyst.expected_timeline && <span className="text-white/30">·</span>}
          {catalyst.expected_timeline && <span>{catalyst.expected_timeline}</span>}
        </div>
      )}

      {dcStage && <p className="mt-3 text-sm font-medium leading-snug text-white/90">{DC_STAGE_HEADLINE[dcStage]}</p>}
      {housingStage && <p className="mt-3 text-sm font-medium leading-snug text-white/90">{HOUSING_STAGE_HEADLINE[housingStage]}</p>}

      {dcStage === "potential" && (
        <div className="mt-4 border-t border-white/10 pt-4">
          {/* "Why This Site?" leads the card (Jared's 2026-10-03
              Energy/Timeline/Risk/People brief) -- computeWhySiteSummary
              falls back from the new why_this_site column to a synthesis of
              already-verified fields, then to why_it_matters (the field
              every other catalyst type uses, previously labeled "Why This
              Is Surfacing" here), so every existing row keeps a summary.
              The generic Why It Matters section further down stays
              suppressed for Potential to avoid showing the same source
              content twice. */}
          {whySiteSummary && (
            <div className="mb-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Why This Site?</p>
              <p className="text-sm leading-relaxed text-white/80">{whySiteSummary}</p>
            </div>
          )}

          {catalyst.developer_assessment && (
            <div
              className="mb-4 flex items-center justify-between rounded-lg border px-3 py-2"
              style={{
                borderColor: `${DEVELOPER_ASSESSMENT_COLOR_HEX[catalyst.developer_assessment]}55`,
                backgroundColor: `${DEVELOPER_ASSESSMENT_COLOR_HEX[catalyst.developer_assessment]}1a`,
              }}
            >
              <div>
                <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Final Developer Assessment</p>
                <p className="text-sm font-semibold text-white">{DEVELOPER_ASSESSMENT_LABEL[catalyst.developer_assessment]}</p>
                <p className="mt-0.5 text-xs text-white/50">{DEVELOPER_ASSESSMENT_DESCRIPTION[catalyst.developer_assessment]}</p>
              </div>
            </div>
          )}

          {catalyst.developer_takeaway && (
            <div className="mb-4">
              <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Developer Takeaway</p>
              <p className="text-sm leading-relaxed text-white/80">{catalyst.developer_takeaway}</p>
            </div>
          )}

          {(catalyst.potential_score != null || dataConfidence != null) && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              {catalyst.potential_score != null && (
                <div>
                  <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Potential Score</p>
                  <p className="text-lg font-semibold text-white">{catalyst.potential_score} / 100</p>
                </div>
              )}
              {dataConfidence != null && (
                <div>
                  <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Data Confidence</p>
                  <p className="text-lg font-semibold text-white">{dataConfidence}%</p>
                </div>
              )}
            </div>
          )}

          {/* Power + Time to Power are the two highest-priority facts (buyer brief: Power "should
              be the most important section") -- a glanceable highlight row, with full granular
              detail (utility/transmission/substation/MW/gas/fiber/water/entitlement) staying in
              the expandable accordions below, not duplicated here. Time to Power's bucket label
              (Fast Path/Moderate/Long) reuses the same utility_timeline value as before -- a
              relabeling, not a new figure. */}
          {(catalyst.power_pillar_label || catalyst.utility_timeline) && (
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div>
                <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Power</p>
                <p className="text-base font-semibold text-white">
                  {catalyst.power_pillar_label ? PILLAR_STRENGTH_LABEL[catalyst.power_pillar_label] : "Unknown"}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Time to Power</p>
                <p className="text-base font-semibold text-white">
                  {catalyst.utility_timeline && catalyst.utility_timeline !== "unknown"
                    ? UTILITY_TIMELINE_BUCKET_LABEL[catalyst.utility_timeline]
                    : "Unknown / Requires Utility Verification"}
                </p>
                {catalyst.utility_timeline_notes && <p className="mt-1 text-xs leading-relaxed text-white/50">{catalyst.utility_timeline_notes}</p>}
                {catalyst.utility_timeline && catalyst.utility_timeline !== "unknown" && (
                  <p className="mt-1 text-[10px] leading-snug text-white/30">{UTILITY_TIMELINE_BUCKET_CAPTION}</p>
                )}
              </div>
            </div>
          )}

          {catalyst.opportunity_area && (
            <div className="mb-4">
              <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Opportunity Area</p>
              <p className="text-sm text-white/70">{catalyst.opportunity_area}</p>
            </div>
          )}

          {/* The 5 buyer-intelligence categories (Jared's 2026-10-04 brief, direct developer/
              site-buyer feedback) -- structurally always present for a Potential site, each with
              a graceful "not yet researched" fallback rather than disappearing when thin. Power/
              Land/Connectivity+Water/Entitlement keep every prose note field the prior Energy/
              Timeline/Risk categories already rendered (nothing dropped, only regrouped +
              relabeled); BTM Energy is the one genuinely new category, surfacing
              natural_gas_notes (previously buried inside Energy) plus the new gas_pipeline_*
              columns. */}
          <div className="space-y-2">
            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>{INTELLIGENCE_CATEGORY_LABEL.power}</span>
                <span className="text-white/60">{catalyst.power_pillar_label ? PILLAR_STRENGTH_LABEL[catalyst.power_pillar_label] : "Unknown"}</span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                <FactRow label="Serving Utility" value={catalyst.serving_utility} />
                <FactRow
                  label="Transmission"
                  value={
                    catalyst.transmission_voltage_kv != null || catalyst.transmission_distance_miles != null
                      ? [
                          catalyst.transmission_voltage_kv != null ? `${catalyst.transmission_voltage_kv} kV` : null,
                          catalyst.transmission_distance_miles != null ? `${catalyst.transmission_distance_miles} mi` : null,
                        ]
                          .filter(Boolean)
                          .join(" — ")
                      : null
                  }
                />
                <FactRow label="Substation" value={catalyst.substation_distance_miles != null ? `${catalyst.substation_distance_miles} mi` : null} />
                <FactRow
                  label="Potential Load"
                  value={
                    catalyst.potential_load_mw_low != null || catalyst.potential_load_mw_high != null
                      ? catalyst.potential_load_mw_high != null && catalyst.potential_load_mw_high !== catalyst.potential_load_mw_low
                        ? `${catalyst.potential_load_mw_low ?? "?"}–${catalyst.potential_load_mw_high} MW`
                        : `${catalyst.potential_load_mw_low ?? catalyst.potential_load_mw_high} MW`
                      : null
                  }
                  status={catalyst.available_capacity_status}
                />
                <FactRow
                  label="Available Capacity"
                  value={catalyst.available_capacity_status ? POTENTIAL_EVIDENCE_STATUS_LABEL[catalyst.available_capacity_status] : null}
                />
                {catalyst.interconnection_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Interconnection: </span>
                    {catalyst.interconnection_notes}
                  </p>
                )}
                {catalyst.power_notes && <p className="leading-relaxed">{catalyst.power_notes}</p>}
                {potentialComponentsByCategory.power.map((c) => (
                  <div key={c.key} className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      {POTENTIAL_SITE_FACTOR_LABEL[c.key]}
                      {c.status && <EvidenceBadge status={c.status} />}
                    </span>
                    <span>
                      {c.points} / {POTENTIAL_SITE_FACTOR_WEIGHT[c.key]}
                    </span>
                  </div>
                ))}
                {!catalyst.serving_utility &&
                  !catalyst.transmission_voltage_kv &&
                  !catalyst.power_notes &&
                  potentialComponentsByCategory.power.length === 0 && (
                    <p className="text-white/40">No power-specific detail on file yet — confirming utility capacity and delivery timing is a recommended next step.</p>
                  )}
              </div>
            </details>

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>{INTELLIGENCE_CATEGORY_LABEL.land}</span>
                <span className="text-white/60">{catalyst.site_pillar_label ? PILLAR_STRENGTH_LABEL[catalyst.site_pillar_label] : "Unknown"}</span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                <FactRow label="Opportunity Area" value={catalyst.total_acreage != null ? `~${catalyst.total_acreage} acres` : null} />
                <FactRow label="Available Land" value={catalyst.available_acreage_status} />
                <FactRow label="Contiguous Acreage" value={catalyst.contiguous_acreage != null ? `${catalyst.contiguous_acreage} acres` : null} />
                <FactRow label="Parcels" value={catalyst.parcel_count} />
                <FactRow label="Zoning" value={catalyst.zoning_status} />
                <FactRow label="Floodplain" value={catalyst.floodplain_status} />
                {catalyst.land_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Land / Expansion: </span>
                    {catalyst.land_notes}
                  </p>
                )}
                {catalyst.risk_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Environmental / Physical Risk: </span>
                    {catalyst.risk_notes}
                  </p>
                )}
                {potentialComponentsByCategory.land.map((c) => (
                  <div key={c.key} className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      {POTENTIAL_SITE_FACTOR_LABEL[c.key]}
                      {c.status && <EvidenceBadge status={c.status} />}
                    </span>
                    <span>
                      {c.points} / {POTENTIAL_SITE_FACTOR_WEIGHT[c.key]}
                    </span>
                  </div>
                ))}
                {!catalyst.total_acreage && !catalyst.land_notes && potentialComponentsByCategory.land.length === 0 && (
                  <p className="text-white/40">No land-specific detail on file yet — confirming contiguous available acreage is a recommended next step.</p>
                )}
              </div>
            </details>

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>{INTELLIGENCE_CATEGORY_LABEL.btm_energy}</span>
                <span className="text-white/60">{catalyst.btm_potential_status ?? "Unknown"}</span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                <FactRow label="Natural Gas" value={catalyst.gas_pipeline_distance_miles != null ? `${catalyst.gas_pipeline_distance_miles} mi` : null} />
                <FactRow label="Operator" value={catalyst.gas_pipeline_operator} />
                <FactRow label="Pipeline Diameter" value={catalyst.gas_pipeline_diameter_in} />
                <FactRow label="BTM Potential" value={catalyst.btm_potential_status} />
                <FactRow label="Air Permitting" value={catalyst.air_permitting_notes} />
                {catalyst.natural_gas_notes && <p className="leading-relaxed">{catalyst.natural_gas_notes}</p>}
                {!catalyst.gas_pipeline_distance_miles && !catalyst.natural_gas_notes && (
                  <p className="text-white/40">No behind-the-meter gas detail on file yet — pipeline distance/operator is a recommended next step.</p>
                )}
              </div>
            </details>

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>{INTELLIGENCE_CATEGORY_LABEL.connectivity_water}</span>
                <span className="text-white/60">{catalyst.fiber_notes || catalyst.water_notes ? "Logged" : "Unknown"}</span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                {catalyst.fiber_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Fiber: </span>
                    {catalyst.fiber_notes}
                  </p>
                )}
                {catalyst.water_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Water: </span>
                    {catalyst.water_notes}
                  </p>
                )}
                {potentialComponentsByCategory.connectivity_water.map((c) => (
                  <div key={c.key} className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      {POTENTIAL_SITE_FACTOR_LABEL[c.key]}
                      {c.status && <EvidenceBadge status={c.status} />}
                    </span>
                    <span>
                      {c.points} / {POTENTIAL_SITE_FACTOR_WEIGHT[c.key]}
                    </span>
                  </div>
                ))}
                {!catalyst.fiber_notes && !catalyst.water_notes && potentialComponentsByCategory.connectivity_water.length === 0 && (
                  <p className="text-white/40">No connectivity or water detail on file yet — fiber carrier presence and large-volume water capacity are worth confirming.</p>
                )}
              </div>
            </details>

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>{INTELLIGENCE_CATEGORY_LABEL.entitlement}</span>
                <span className="text-white/60">{catalyst.approval_pillar_label ? APPROVAL_PILLAR_LABEL[catalyst.approval_pillar_label] : "Unknown"}</span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                {catalyst.entitlement_velocity && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Entitlement Velocity — {ENTITLEMENT_VELOCITY_LABEL[catalyst.entitlement_velocity]}: </span>
                    {catalyst.entitlement_velocity_notes}
                  </p>
                )}
                {catalyst.city_receptiveness && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">City Receptiveness — {CITY_RECEPTIVENESS_LABEL[catalyst.city_receptiveness]}: </span>
                    {catalyst.city_receptiveness_notes}
                  </p>
                )}
                {catalyst.community_friction && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Community Friction — {COMMUNITY_FRICTION_LABEL[catalyst.community_friction]}: </span>
                    {catalyst.community_friction_notes}
                  </p>
                )}
                {catalyst.incentives_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Incentives: </span>
                    {catalyst.incentives_notes}
                  </p>
                )}
                {catalyst.development_environment_notes && <p className="leading-relaxed">{catalyst.development_environment_notes}</p>}
                {potentialComponentsByCategory.entitlement.map((c) => (
                  <div key={c.key} className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      {POTENTIAL_SITE_FACTOR_LABEL[c.key]}
                      {c.status && <EvidenceBadge status={c.status} />}
                    </span>
                    <span>
                      {c.points} / {POTENTIAL_SITE_FACTOR_WEIGHT[c.key]}
                    </span>
                  </div>
                ))}
              </div>
            </details>

            <DcSiteControlSection catalyst={catalyst} />
          </div>

          {(catalyst.primary_advantage || catalyst.primary_risk) && (
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              {catalyst.primary_advantage && (
                <div>
                  <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-300/70">Primary Advantage</p>
                  <p className="text-sm leading-relaxed text-white/80">{catalyst.primary_advantage}</p>
                </div>
              )}
              {catalyst.primary_risk && (
                <div>
                  <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-300/70">Primary Risk</p>
                  <p className="text-sm leading-relaxed text-white/80">{catalyst.primary_risk}</p>
                </div>
              )}
            </div>
          )}

          <PotentialReadinessSection readinessStage={readinessStage!} readinessNotes={catalyst.readiness_notes} />
          <PotentialNextStepsSection nextSteps={nextSteps} />

          {catalyst.unknowns_to_verify.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">What Still Needs Verification</p>
              <ul className="space-y-1 text-sm text-white/70">
                {catalyst.unknowns_to_verify.map((u, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-white/30">—</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-xs italic text-white/40">
            {catalyst.why_still_potential ??
              "No credible public evidence was identified indicating that a data center is currently proposed, planned, or being pursued at this location."}
          </p>
        </div>
      )}

      {housingStage === "potential" && (
        <div className="mt-4 border-t border-white/10 pt-4">
          {/* Why This Site? -- mirrors the Data Center Potential block's
              top summary, synthesized from Housing's own fields (see
              computeWhyHousingSiteSummary). */}
          {whyHousingSiteSummary && (
            <div className="mb-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Why This Site?</p>
              <p className="text-sm leading-relaxed text-white/80">{whyHousingSiteSummary}</p>
            </div>
          )}

          {/* Opportunity Catalyst -- "what changed to make this land
              developable," the one concept with no Data-Center-era
              equivalent. Surfaced prominently per the brief, only when a
              researcher has actually identified one. */}
          {catalyst.opportunity_catalyst && (
            <div className="mb-4 rounded-lg border border-white/15 bg-white/[0.04] p-3">
              <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-white/35">Opportunity Catalyst</p>
              <p className="text-sm font-medium leading-relaxed text-white/90">{catalyst.opportunity_catalyst}</p>
            </div>
          )}

          {/* 4 always-present categories (Demand/Entitlement/Infrastructure/
              Site & Economics -- Economics folded into Site rather than its
              own accordion, since the brief itself says not to attempt a
              full pro forma and its content is typically a sentence or two),
              each with a graceful "not yet researched" fallback, same
              discipline as the Data Center Potential categories above. */}
          <div className="space-y-2">
            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>Demand</span>
                <span className="text-white/60">{catalyst.demand_notes ? "Logged" : "Not yet researched"}</span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                {catalyst.demand_notes ? (
                  <p className="leading-relaxed">{catalyst.demand_notes}</p>
                ) : (
                  <p className="text-white/40">No demand-specific detail on file yet -- population/household growth, permit activity, and nearby absorption are worth confirming.</p>
                )}
              </div>
            </details>

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>Entitlement</span>
                <span className="text-white/60">{ENTITLEMENT_STATUS_LABEL[catalyst.entitlement_status ?? "unknown"]}</span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                <p className="leading-relaxed text-white/50">{ENTITLEMENT_STATUS_DESCRIPTION[catalyst.entitlement_status ?? "unknown"]}</p>
                {catalyst.entitlement_notes && <p className="leading-relaxed">{catalyst.entitlement_notes}</p>}
              </div>
            </details>

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>Infrastructure</span>
                <span className="text-white/60">
                  {catalyst.sewer_notes || catalyst.water_notes || catalyst.road_notes || catalyst.natural_gas_notes || catalyst.fiber_notes
                    ? "Logged"
                    : "Not yet researched"}
                </span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                {([
                  ["Sewer", catalyst.sewer_notes],
                  ["Water", catalyst.water_notes],
                  ["Roads", catalyst.road_notes],
                  ["Natural Gas", catalyst.natural_gas_notes],
                  ["Fiber", catalyst.fiber_notes],
                ] as const).map(
                  ([label, value]) =>
                    value && (
                      <p key={label} className="leading-relaxed">
                        <span className="text-white/40">{label}: </span>
                        {value}
                      </p>
                    )
                )}
                {!catalyst.sewer_notes && !catalyst.water_notes && !catalyst.road_notes && !catalyst.natural_gas_notes && !catalyst.fiber_notes && (
                  <p className="text-white/40">No infrastructure detail on file yet -- sewer/water proximity and capacity are worth confirming directly with the provider.</p>
                )}
              </div>
            </details>

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>Site &amp; Economics</span>
                <span className="text-white/60">{catalyst.site_notes || catalyst.estimated_yield || catalyst.economics_notes ? "Logged" : "Not yet researched"}</span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                {catalyst.site_notes && <p className="leading-relaxed">{catalyst.site_notes}</p>}
                {catalyst.estimated_yield && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Preliminary Estimated Yield: </span>
                    {catalyst.estimated_yield}
                  </p>
                )}
                {catalyst.economics_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Preliminary Economics: </span>
                    {catalyst.economics_notes}
                  </p>
                )}
                {!catalyst.site_notes && !catalyst.estimated_yield && !catalyst.economics_notes && (
                  <p className="text-white/40">No site or economics detail on file yet.</p>
                )}
              </div>
            </details>

            <PotentialPeopleSection people={catalyst.people} />
          </div>

          <PotentialReadinessSection readinessStage={readinessStage!} readinessNotes={catalyst.readiness_notes} />
          <PotentialNextStepsSection nextSteps={nextSteps} />

          {catalyst.unknowns_to_verify.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">What Still Needs Verification</p>
              <ul className="space-y-1 text-sm text-white/70">
                {catalyst.unknowns_to_verify.map((u, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-white/30">—</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {isInfrastructure && (
        <div className="mt-4 border-t border-white/10 pt-4">
          {/* WHY IT MATTERS leads the card, reusing why_it_matters
              directly -- every existing infrastructure_project row
              already has one written in exactly this voice, so (unlike
              the two Potential tiers) no fallback-synthesis function was
              needed. Suppressed below from the generic Why It Matters
              block further down the panel to avoid showing it twice. */}
          {catalyst.why_it_matters && (
            <div className="mb-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Why It Matters</p>
              <p className="text-sm leading-relaxed text-white/80">{catalyst.why_it_matters}</p>
            </div>
          )}

          {catalyst.infrastructure_subtype && (
            <div className="mb-4">
              <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Project</p>
              <p className="text-sm text-white/70">{catalyst.infrastructure_subtype}</p>
            </div>
          )}

          {(catalyst.development_impact_types.length > 0 || catalyst.development_impact_level) && (
            <div className="mb-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Development Impact</p>
              {catalyst.development_impact_types.length > 0 && (
                <p className="text-sm font-medium text-white">
                  {catalyst.development_impact_types.map((t) => DEVELOPMENT_IMPACT_TYPE_LABEL[t]).join(" · ")}
                </p>
              )}
              {catalyst.development_impact_level && (
                <p className="mt-1 text-xs text-white/50">
                  Impact: <span className="font-medium text-white/70">{DEVELOPMENT_IMPACT_LEVEL_LABEL[catalyst.development_impact_level]}</span>
                </p>
              )}
            </div>
          )}

          {catalyst.impact_area_notes && (
            <div className="mb-4">
              <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-white/35">Impact Area</p>
              <p className="text-sm leading-relaxed text-white/70">{catalyst.impact_area_notes}</p>
            </div>
          )}

          <PotentialPeopleSection people={catalyst.people} />

          {/* OPPORTUNITIES CREATED -- read-only for now (resolved live
              against allCatalysts, never denormalized). The brief's own
              "eventually be able to click" phrasing marks real click-to-
              navigate as a future increment; not forced here. Never
              rendered at all when no related opportunity exists yet, per
              the brief's explicit "do not force this relationship." */}
          {relatedOpportunities.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-white/35">Opportunities Created</p>
              <ul className="space-y-1 text-sm text-white/70">
                {Array.from(opportunityCounts.entries()).map(([label, count]) => (
                  <li key={label} className="flex gap-2">
                    <span className="text-white/30">—</span>
                    {count} {label}
                    {count > 1 ? "s" : ""}
                  </li>
                ))}
              </ul>
              {catalyst.opportunities_created_notes && (
                <p className="mt-2 text-xs leading-relaxed text-white/50">{catalyst.opportunities_created_notes}</p>
              )}
            </div>
          )}

          {catalyst.unknowns_to_verify.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Next Intelligence Needed</p>
              <ul className="space-y-1 text-sm text-white/70">
                {catalyst.unknowns_to_verify.map((u, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-white/30">—</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {dcStage === "possible" && (
        <div className="mt-4 border-t border-white/10 pt-4">
          {confidenceLabel && (
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Confidence</p>
                <p className="text-sm font-medium text-white">{confidenceLabel}</p>
              </div>
              <div>
                <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Supporting Signals</p>
                <p className="text-sm font-medium text-white">{dcSignalCount(catalyst)}</p>
              </div>
            </div>
          )}
          {catalyst.signal_categories.length > 0 && (
            <>
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-white/35">Infrastructure Signals Observed</p>
              <ul className="space-y-1 text-sm text-white/70">
                {catalyst.signal_categories.map((category) => (
                  <li key={category} className="flex gap-2">
                    <span className="text-white/30">—</span>
                    {DATA_CENTER_SIGNAL_LABEL[category]}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-3 text-xs text-white/40">No data center is publicly confirmed at this location yet.</p>
        </div>
      )}

      {dcStage === "planned" && flaggedEarly && catalyst.date_announced && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          Groundbreakable flagged this site {daysBetween(catalyst.created_at, catalyst.date_announced)} days before public
          confirmation ({formatShortDate(catalyst.created_at)} → {formatShortDate(catalyst.date_announced)}).
        </div>
      )}

      {catalyst.estimated_value != null && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Investment</p>
          <p className="text-sm font-medium text-white">{formatCurrency(catalyst.estimated_value)}</p>
        </div>
      )}

      {catalyst.estimated_scale_note && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Scale</p>
          <p className="text-sm font-medium text-white">{catalyst.estimated_scale_note}</p>
        </div>
      )}

      {/* Suppressed for either Potential tier -- already rendered at the
          top of that tier's own block as "Why This Site?", which falls
          back to this same field when nothing more specific is on file.
          Also suppressed for Infrastructure, which renders why_it_matters
          directly at the top of its own block instead. */}
      {catalyst.why_it_matters && dcStage !== "potential" && housingStage !== "potential" && !isInfrastructure && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Why It Matters</p>
          <p className="text-sm leading-relaxed text-white/70">{catalyst.why_it_matters}</p>
        </div>
      )}

      {/* Suppressed for Infrastructure -- already shown in the compact
          Type/Status/Timeline summary near the top of the panel. */}
      {catalyst.expected_timeline && !isInfrastructure && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Timeline</p>
          <p className="text-sm font-medium text-white">{catalyst.expected_timeline}</p>
        </div>
      )}

      {watching.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-white/35">Why Groundbreakable Is Watching</p>
          <ul className="space-y-1 text-sm text-white/70">
            {watching.map((w) => (
              <li key={w.id} className="flex gap-2">
                <span className="text-white/30">—</span>
                <span>
                  {w.title}
                  {w.signal_categories.length > 0 && (
                    <span className="text-white/40"> ({w.signal_categories.map((c) => DATA_CENTER_SIGNAL_LABEL[c]).join(", ")})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center gap-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <span className="h-1.5 w-1.5 rounded-full border border-dashed" style={{ borderColor: color }} />
        Impact area shown on map
      </div>

      {sources.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Sources</p>
          <a
            href={sources[0].url}
            target="_blank"
            rel="noreferrer noopener"
            className="block rounded border border-white/10 px-3 py-2 text-center text-xs font-medium text-white/80 transition hover:border-white/30 hover:text-white"
          >
            View Source ↗
          </a>
          {sources.slice(1).map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer noopener" className="block text-xs text-white/45 hover:text-white/80">
              {source.agency}
              {source.title ? ` — ${source.title}` : ""} ↗
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onToggleFollow}
        className={`mt-4 w-full rounded px-3 py-2 text-sm font-medium transition ${
          isFollowing ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-black hover:bg-white/90"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <div>{CONFIDENCE_LABEL[catalyst.confidence]}</div>
        {/* created_at/last_verified_at are timestamptz, not the plain `date`
            columns formatDate() expects (it appends "T00:00:00" to the raw
            value) -- format directly instead. */}
        <div>First detected {formatShortDate(catalyst.created_at)}</div>
        <div>Last verified {formatRelativeVerified(catalyst.last_verified_at)}</div>
      </div>
    </>
  );
}

// Desktop floating panel (unchanged since the 2026-10-01/02 Data Center
// Refocus) -- just the absolute-positioned card chrome + close button
// around CatalystDetails now. Hidden below `sm` -- the mobile bottom sheet
// (NationalMapExperience) is the small-screen equivalent and renders
// CatalystDetails itself inside its own sheet chrome instead of this panel.
export default function CatalystIntelligencePanel({
  catalyst,
  allCatalysts,
  isFollowing,
  onToggleFollow,
  onClose,
}: {
  catalyst: CatalystWithSources;
  allCatalysts: CatalystWithSources[];
  isFollowing: boolean;
  onToggleFollow: () => void;
  onClose: () => void;
}) {
  return (
    <div className="hidden absolute right-3 top-3 bottom-3 z-30 w-[380px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/80 p-5 shadow-2xl backdrop-blur-xl sm:block">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>
      <CatalystDetails catalyst={catalyst} allCatalysts={allCatalysts} isFollowing={isFollowing} onToggleFollow={onToggleFollow} />
    </div>
  );
}
