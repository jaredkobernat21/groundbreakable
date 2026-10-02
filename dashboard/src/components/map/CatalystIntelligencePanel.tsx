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
  ENTITLEMENT_VELOCITY_LABEL,
  PILLAR_STRENGTH_LABEL,
  POTENTIAL_SITE_FACTOR_LABEL,
  POTENTIAL_SITE_FACTOR_WEIGHT,
  POTENTIAL_SITE_PILLAR_FACTORS,
  UTILITY_TIMELINE_LABEL,
  type PotentialSitePillar,
} from "@/lib/catalysts/potentialSiteCriteria";
import type { PotentialScoreComponent } from "@/lib/types";

const CONFIDENCE_LABEL: Record<CatalystWithSources["confidence"], string> = {
  verified: "Verified against primary source",
  reported: "Reported by named source",
  unconfirmed: "Unconfirmed — treat as preliminary",
};

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
  // card-level pillars, purely for the "expand into supporting details"
  // view -- POTENTIAL_SITE_PILLAR_FACTORS is the single source of truth
  // for which factor belongs under which pillar.
  const potentialComponentsByPillar: Record<PotentialSitePillar, PotentialScoreComponent[]> = { power: [], site: [], approval: [], infrastructure: [] };
  if (catalyst.potential_score_components) {
    for (const component of catalyst.potential_score_components) {
      for (const pillar of Object.keys(POTENTIAL_SITE_PILLAR_FACTORS) as PotentialSitePillar[]) {
        if (POTENTIAL_SITE_PILLAR_FACTORS[pillar].includes(component.key)) {
          potentialComponentsByPillar[pillar].push(component);
        }
      }
    }
  }

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

      {dcStage && <p className="mt-3 text-sm font-medium leading-snug text-white/90">{DC_STAGE_HEADLINE[dcStage]}</p>}

      {dcStage === "potential" && (
        <div className="mt-4 border-t border-white/10 pt-4">
          {catalyst.potential_score != null && (
            <div className="mb-4">
              <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Potential Score</p>
              <p className="text-lg font-semibold text-white">{catalyst.potential_score} / 100</p>
            </div>
          )}
          {catalyst.opportunity_area && (
            <div className="mb-4">
              <p className="mb-0.5 text-[11px] uppercase tracking-wide text-white/35">Opportunity Area</p>
              <p className="text-sm text-white/70">{catalyst.opportunity_area}</p>
            </div>
          )}

          {/* 4 scannable pillars (Jared's 2026-10-02 clarification: keep the
              map simple, push Approval/Infrastructure depth in here instead
              of new top-level categories), each expandable into supporting
              detail -- never shown unless the underlying label is actually
              on file, so an unscored pillar doesn't render as a false "Unknown". */}
          <div className="space-y-2">
            {catalyst.power_pillar_label && (
              <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                  <span>Power</span>
                  <span className="text-white/60">{PILLAR_STRENGTH_LABEL[catalyst.power_pillar_label]}</span>
                </summary>
                <div className="mt-2 space-y-2 text-sm text-white/70">
                  {catalyst.power_notes && <p className="leading-relaxed">{catalyst.power_notes}</p>}
                  {potentialComponentsByPillar.power.map((c) => (
                    <div key={c.key} className="flex justify-between text-xs text-white/50">
                      <span>{POTENTIAL_SITE_FACTOR_LABEL[c.key]}</span>
                      <span>
                        {c.points} / {POTENTIAL_SITE_FACTOR_WEIGHT[c.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {catalyst.site_pillar_label && (
              <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                  <span>Site</span>
                  <span className="text-white/60">{PILLAR_STRENGTH_LABEL[catalyst.site_pillar_label]}</span>
                </summary>
                <div className="mt-2 space-y-2 text-sm text-white/70">
                  {([
                    ["Land / Expansion", catalyst.land_notes],
                    ["Fiber", catalyst.fiber_notes],
                    ["Environmental / Physical Risk", catalyst.risk_notes],
                  ] as const).map(
                    ([label, value]) =>
                      value && (
                        <p key={label} className="leading-relaxed">
                          <span className="text-white/40">{label}: </span>
                          {value}
                        </p>
                      )
                  )}
                  {potentialComponentsByPillar.site.map((c) => (
                    <div key={c.key} className="flex justify-between text-xs text-white/50">
                      <span>{POTENTIAL_SITE_FACTOR_LABEL[c.key]}</span>
                      <span>
                        {c.points} / {POTENTIAL_SITE_FACTOR_WEIGHT[c.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {catalyst.approval_pillar_label && (
              <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                  <span>Approval</span>
                  <span className="text-white/60">{APPROVAL_PILLAR_LABEL[catalyst.approval_pillar_label]}</span>
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
                </div>
              </details>
            )}

            {catalyst.utility_timeline && (
              <details className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white">
                  <span>Infrastructure</span>
                  <span className="text-white/60">{UTILITY_TIMELINE_LABEL[catalyst.utility_timeline]}</span>
                </summary>
                <div className="mt-2 space-y-2 text-sm text-white/70">
                  {catalyst.utility_timeline_notes && (
                    <p className="leading-relaxed">
                      <span className="text-white/40">Utility Timeline: </span>
                      {catalyst.utility_timeline_notes}
                    </p>
                  )}
                </div>
              </details>
            )}
          </div>

          {catalyst.unknowns_to_verify.length > 0 && (
            <div className="mt-4">
              <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Unknowns to Verify</p>
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

      {catalyst.why_it_matters && (
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
