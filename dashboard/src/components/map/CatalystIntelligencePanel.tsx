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
import {
  APPROVAL_PILLAR_LABEL,
  CITY_RECEPTIVENESS_LABEL,
  COMMUNITY_FRICTION_LABEL,
  computeNextSteps,
  computeReadinessStage,
  computeWhySiteSummary,
  ENTITLEMENT_VELOCITY_LABEL,
  INTELLIGENCE_CATEGORY_LABEL,
  PILLAR_STRENGTH_LABEL,
  POTENTIAL_EVIDENCE_STATUS_LABEL,
  POTENTIAL_SITE_CATEGORY_FACTORS,
  POTENTIAL_SITE_FACTOR_LABEL,
  POTENTIAL_SITE_FACTOR_WEIGHT,
  POTENTIAL_SITE_TYPE_LABEL,
  READINESS_STAGE_DESCRIPTION,
  READINESS_STAGE_LABEL,
  UTILITY_TIMELINE_BUCKET_CAPTION,
  UTILITY_TIMELINE_BUCKET_LABEL,
  type IntelligenceCategory,
} from "@/lib/catalysts/potentialSiteCriteria";
import type { PotentialEvidenceStatus, PotentialScoreComponent } from "@/lib/types";

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
  const potentialComponentsByCategory: Record<IntelligenceCategory, PotentialScoreComponent[]> = { energy: [], timeline: [], risk: [], people: [] };
  if (catalyst.potential_score_components) {
    for (const component of catalyst.potential_score_components) {
      for (const category of Object.keys(POTENTIAL_SITE_CATEGORY_FACTORS) as IntelligenceCategory[]) {
        if (POTENTIAL_SITE_CATEGORY_FACTORS[category].includes(component.key)) {
          potentialComponentsByCategory[category].push(component);
        }
      }
    }
  }
  const whySiteSummary = dcStage === "potential" ? computeWhySiteSummary(catalyst) : null;
  const readinessStage = dcStage === "potential" ? computeReadinessStage(catalyst) : null;
  const nextSteps = dcStage === "potential" ? computeNextSteps(catalyst) : [];

  return (
    <>
      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${color}55`, color, backgroundColor: `${color}1a` }}
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {dcStage ? `${DC_STAGE_LABEL[dcStage]} Data Center` : CATALYST_COLOR_GROUP_LABEL[catalystColorGroup(catalyst)]}
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

      {dcStage && <p className="mt-3 text-sm font-medium leading-snug text-white/90">{DC_STAGE_HEADLINE[dcStage]}</p>}

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

          {catalyst.potential_score != null && (
            <div className="mb-4">
              <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Potential Score</p>
              <p className="text-lg font-semibold text-white">{catalyst.potential_score} / 100</p>
            </div>
          )}

          {/* Energy + Time to Power are the two highest-priority factors
              (Jared's spec: "visually more prominent than secondary
              factors") -- a glanceable highlight row, with full prose/
              scoring detail staying in the expandable sections below, not
              duplicated here. Time to Power's bucket label (Fast Path/
              Moderate/Long) reuses the same utility_timeline value as
              before -- a relabeling, not a new figure -- with a one-time,
              clearly-general legend caption instead of a fabricated
              site-specific date range. */}
          {(catalyst.power_pillar_label || catalyst.utility_timeline) && (
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div>
                <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Energy</p>
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

          {/* The four primary intelligence categories (Jared's brief) --
              structurally always present for a Potential site, each with a
              graceful "not yet researched" fallback rather than
              disappearing when thin, so the four-category promise is
              visible even on a lightly-researched row. Every fact rendered
              here is the exact same note-field content shown under the
              prior Power/Site/Approval pillar headers -- only the grouping
              and headers changed, nothing was dropped or reworded. */}
          <div className="space-y-2">
            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>{INTELLIGENCE_CATEGORY_LABEL.energy}</span>
                <span className="text-white/60">{catalyst.power_pillar_label ? PILLAR_STRENGTH_LABEL[catalyst.power_pillar_label] : "Unknown"}</span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                {catalyst.power_notes && <p className="leading-relaxed">{catalyst.power_notes}</p>}
                {catalyst.natural_gas_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Natural Gas / Behind-the-Meter: </span>
                    {catalyst.natural_gas_notes}
                  </p>
                )}
                {catalyst.water_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Water: </span>
                    {catalyst.water_notes}
                  </p>
                )}
                {catalyst.fiber_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Fiber: </span>
                    {catalyst.fiber_notes}
                  </p>
                )}
                {potentialComponentsByCategory.energy.map((c) => (
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
                {!catalyst.power_notes &&
                  !catalyst.natural_gas_notes &&
                  !catalyst.water_notes &&
                  !catalyst.fiber_notes &&
                  potentialComponentsByCategory.energy.length === 0 && (
                    <p className="text-white/40">No energy-specific detail on file yet — confirming utility capacity and delivery timing is a recommended next step.</p>
                  )}
              </div>
            </details>

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>{INTELLIGENCE_CATEGORY_LABEL.timeline}</span>
                <span className="text-white/60">
                  {catalyst.utility_timeline ? UTILITY_TIMELINE_BUCKET_LABEL[catalyst.utility_timeline] : "Unknown"}
                </span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                {catalyst.utility_timeline_notes && (
                  <p className="leading-relaxed">
                    <span className="text-white/40">Utility Delivery Timeline: </span>
                    {catalyst.utility_timeline_notes}
                  </p>
                )}
                {!catalyst.utility_timeline_notes && <p className="text-white/40">No additional timeline detail on file yet beyond the Time to Power assessment above.</p>}
              </div>
            </details>

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>{INTELLIGENCE_CATEGORY_LABEL.risk}</span>
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  {catalyst.site_pillar_label && (
                    <span className="rounded border border-white/15 px-1.5 py-0.5">Site: {PILLAR_STRENGTH_LABEL[catalyst.site_pillar_label]}</span>
                  )}
                  {catalyst.approval_pillar_label && (
                    <span className="rounded border border-white/15 px-1.5 py-0.5">Approval: {APPROVAL_PILLAR_LABEL[catalyst.approval_pillar_label]}</span>
                  )}
                  {!catalyst.site_pillar_label && !catalyst.approval_pillar_label && "Unknown"}
                </span>
              </summary>
              <div className="mt-2 space-y-2 text-sm text-white/70">
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
                {potentialComponentsByCategory.risk.map((c) => (
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

            <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                <span>{INTELLIGENCE_CATEGORY_LABEL.people}</span>
                <span className="text-white/60">{catalyst.people ? "Logged" : "Not yet researched"}</span>
              </summary>
              <div className="mt-2 space-y-3 text-sm text-white/70">
                {catalyst.people?.owner && (
                  <PeopleFactGroup
                    label="Owner"
                    facts={[
                      ["Name", catalyst.people.owner.name],
                      ["Entity", catalyst.people.owner.entity],
                      ["Contact", catalyst.people.owner.contact],
                      ["Ownership Since", catalyst.people.owner.ownership_since],
                      ["Outreach Status", catalyst.people.owner.outreach_status],
                      ["Interest Status", catalyst.people.owner.interest_status],
                      ["Asking Price", catalyst.people.owner.asking_price],
                      ["Site Control Status", catalyst.people.owner.site_control_status],
                      ["Mineral Rights", catalyst.people.owner.mineral_rights],
                      ["Notes", catalyst.people.owner.notes],
                    ]}
                  />
                )}
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
                {!catalyst.people && (
                  <p className="text-white/40">Not yet researched — ownership and utility contacts are a recommended next step.</p>
                )}
              </div>
            </details>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/35">Readiness</p>
            <p className="text-sm font-medium text-white">{READINESS_STAGE_LABEL[readinessStage!]}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/50">{READINESS_STAGE_DESCRIPTION[readinessStage!]}</p>
            {catalyst.readiness_notes && <p className="mt-1 text-xs leading-relaxed text-white/60">{catalyst.readiness_notes}</p>}
          </div>

          {nextSteps.length > 0 && (
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
          )}

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

      {/* Suppressed for Potential -- already rendered at the top of that
          stage's own block as "Why This Is Surfacing", same field. */}
      {catalyst.why_it_matters && dcStage !== "potential" && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Why It Matters</p>
          <p className="text-sm leading-relaxed text-white/70">{catalyst.why_it_matters}</p>
        </div>
      )}

      {catalyst.expected_timeline && (
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
