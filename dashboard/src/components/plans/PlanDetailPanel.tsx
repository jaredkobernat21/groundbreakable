"use client";

import { useState } from "react";
import type {
  CatalystWithSources,
  DevelopmentFrictionCaseWithSource,
  EntitlementCaseDetail,
  ProjectEventWithProject,
  ProjectPersonWithSource,
  ProjectWithSource,
} from "@/lib/types";
import {
  CATALYSTS_COLOR,
  CATALYST_TYPE_LABEL,
  ENTITLEMENT_APPROVAL_PATH_LABEL,
  ENTITLEMENT_CASE_STATUS_LABEL,
  ENTITLEMENT_DECISION_BODY_LABEL,
  PROJECT_STAGE_LABEL,
} from "@/lib/types";
import type { EntitlementRealityScoreResult } from "@/lib/entitlement/score";
import type { PlanItem } from "@/lib/planItems";
import { catalystForPlan } from "@/lib/catalystRules";
import {
  deriveBestDate,
  deriveCaseTypeLabel,
  deriveEntitlementLocationLabel,
  deriveWhatHappened,
  deriveWhyItMatters,
  humanizeSnakeCase,
  partyName,
} from "@/lib/planNarrative";
import { formatCurrency, formatDate } from "@/lib/format";
import { eventTypeLabel, groupEventsByDate } from "@/lib/projectEventDisplay";
import ShiftDetailPanel from "../shifts/ShiftDetailPanel";
import DevelopmentFrictionCaseCard from "../friction/DevelopmentFrictionCaseCard";

// The Plans feature's one detail surface -- a bare shift renders through
// the existing ShiftDetailPanel unchanged; an entitlement case gets a
// structured intelligence card (Jared, 2026-09-29): case type/number/
// status/location up top, then What Happened / Why It Matters / Key
// Details above the fold, with hearing history, the linked project's
// timeline, and friction as secondary context below, and the raw source
// text collapsed behind an explicit toggle rather than shown by default.
// See lib/planNarrative.ts for how each derived field is computed -- every
// one traces back to a real field or is a plainly-labeled fallback, never
// a fabricated fact.
export default function PlanDetailPanel({
  plan,
  catalysts,
  caseDetail,
  project,
  projectEvents,
  realityScore,
  relatedFrictionCases,
  people,
  onClose,
}: {
  plan: PlanItem;
  catalysts: CatalystWithSources[];
  caseDetail: EntitlementCaseDetail | null;
  project: ProjectWithSource | null;
  projectEvents: ProjectEventWithProject[];
  realityScore: EntitlementRealityScoreResult | null;
  relatedFrictionCases: DevelopmentFrictionCaseWithSource[];
  people: ProjectPersonWithSource[];
  onClose: () => void;
}) {
  const catalyst = catalystForPlan(catalysts, plan);

  if (plan.kind === "shift") {
    return <ShiftDetailPanel shift={plan.shift} people={people} catalyst={catalyst} onClose={onClose} />;
  }

  if (!caseDetail) return null;
  return <EntitlementCaseDetailCard caseDetail={caseDetail} catalyst={catalyst} project={project} projectEvents={projectEvents} realityScore={realityScore} relatedFrictionCases={relatedFrictionCases} onClose={onClose} />;
}

function EntitlementCaseDetailCard({
  caseDetail,
  catalyst,
  project,
  projectEvents,
  realityScore,
  relatedFrictionCases,
  onClose,
}: {
  caseDetail: EntitlementCaseDetail;
  catalyst: ReturnType<typeof catalystForPlan>;
  project: ProjectWithSource | null;
  projectEvents: ProjectEventWithProject[];
  realityScore: EntitlementRealityScoreResult | null;
  relatedFrictionCases: DevelopmentFrictionCaseWithSource[];
  onClose: () => void;
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  const eventGroups = groupEventsByDate(projectEvents);
  const sortedCaseEvents = [...caseDetail.events].sort((a, b) => b.event_date.localeCompare(a.event_date));
  const latestCaseEvent = sortedCaseEvents[0] ?? null;

  const location = deriveEntitlementLocationLabel(caseDetail, caseDetail.parties);
  const whatHappened = deriveWhatHappened(caseDetail);
  const whyItMatters = deriveWhyItMatters(caseDetail);

  const bestDate = deriveBestDate(caseDetail);
  const applicant = partyName(caseDetail.parties, ["applicant"]);
  const owner = partyName(caseDetail.parties, ["landowner"]);
  const zoningLine =
    caseDetail.existing_zoning && caseDetail.requested_zoning
      ? `${caseDetail.existing_zoning} → ${caseDetail.requested_zoning}`
      : caseDetail.requested_zoning ?? caseDetail.existing_zoning ?? null;
  const meetingBody = latestCaseEvent?.decision_body ? ENTITLEMENT_DECISION_BODY_LABEL[latestCaseEvent.decision_body] : null;

  // Only fields that actually have a value render -- see the live-data
  // audit in lib/planNarrative.ts (proposed_units/staff_recommendation/
  // application_date are 0% populated; several others are partial).
  const keyDetails: { label: string; value: string }[] = [
    bestDate && { label: "Date", value: formatDate(bestDate) ?? bestDate },
    { label: "Case Type", value: deriveCaseTypeLabel(caseDetail) },
    { label: "Status", value: ENTITLEMENT_CASE_STATUS_LABEL[caseDetail.status] },
    applicant && { label: "Applicant", value: applicant },
    owner && { label: "Owner", value: owner },
    { label: "Location", value: location },
    caseDetail.parcel_id && { label: "Parcel", value: caseDetail.parcel_id },
    zoningLine && { label: "Zoning", value: zoningLine },
    caseDetail.proposed_use && { label: "Proposed Use", value: caseDetail.proposed_use },
    caseDetail.proposed_units != null && { label: "Units / Lots", value: String(caseDetail.proposed_units) },
    caseDetail.acreage != null && { label: "Acreage", value: `${caseDetail.acreage} ac` },
    meetingBody && { label: "Meeting Body", value: meetingBody },
  ].filter((x): x is { label: string; value: string } => Boolean(x));

  // The raw summary is only worth a separate "original record" toggle when
  // it says something beyond what What Happened already shows -- when the
  // summary was short enough to already be used verbatim, don't repeat it.
  const showOriginalToggle = Boolean(caseDetail.summary) && caseDetail.summary !== whatHappened;

  return (
    <div className="absolute right-3 top-16 bottom-3 z-30 w-[420px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:top-3">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>

      {catalyst && (
        <div
          className="mb-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ borderColor: `${CATALYSTS_COLOR}55`, color: CATALYSTS_COLOR, backgroundColor: `${CATALYSTS_COLOR}1a` }}
        >
          ⚡ Catalyst · {CATALYST_TYPE_LABEL[catalyst.catalyst_type]}
        </div>
      )}

      <div className="mb-1 flex items-center gap-2 pr-6 text-[11px] font-semibold uppercase tracking-wide text-white/40">
        <span>{deriveCaseTypeLabel(caseDetail)}</span>
        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-white">{ENTITLEMENT_CASE_STATUS_LABEL[caseDetail.status]}</span>
      </div>
      <h2 className="mb-0.5 text-lg font-semibold leading-snug text-white">{caseDetail.case_number ?? "Untitled Case"}</h2>
      <p className="mb-4 text-sm text-white/50">{location}</p>

      <div className="mb-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/35">What Happened</p>
        <p className="text-sm leading-relaxed text-white/80">{whatHappened}</p>
      </div>

      <div className="mb-4 border-t border-white/10 pt-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/35">Why It Matters</p>
        <p className="text-sm leading-relaxed text-white/70">{whyItMatters}</p>
      </div>

      {keyDetails.length > 0 && (
        <dl className="mb-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
          {keyDetails.map((detail) => (
            <div key={detail.label}>
              <dt className="text-[11px] uppercase tracking-wide text-white/35">{detail.label}</dt>
              <dd className="mt-0.5 font-medium text-white">{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {caseDetail.approval_type && (
        <p className="mb-4 text-xs text-white/40">
          Approval path: {ENTITLEMENT_APPROVAL_PATH_LABEL[caseDetail.approval_type.approval_path]}
        </p>
      )}

      {realityScore && (
        <div className="mb-4 border-t border-white/10 pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/35">Entitlement Reality Score</p>
            <span className="text-[10px] uppercase tracking-wide text-white/35">{realityScore.confidence} confidence</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-white">
            {realityScore.score}
            <span className="text-sm font-normal text-white/40">/100</span>
          </p>
          <p className="mt-1 text-[11px] text-white/40">A decision-support index, not a probability of approval.</p>
        </div>
      )}

      {project && (
        <div className="mb-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">Project</p>
          <p className="text-sm font-medium text-white">{project.title}</p>
          <p className="mt-0.5 text-xs text-white/50">
            {[project.stage ? PROJECT_STAGE_LABEL[project.stage] : null, project.address].filter(Boolean).join(" · ")}
          </p>
          {project.project_value != null && (
            <p className="mt-0.5 text-xs text-white/50">Project value: {formatCurrency(project.project_value)}</p>
          )}

          {eventGroups.length > 0 && (
            <div className="mt-3 space-y-3 border-l border-white/10 pl-4">
              {eventGroups.map((group) => (
                <div key={group.date}>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-white/35">{formatDate(group.date)}</p>
                  {group.events.map((event) => (
                    <p key={event.id} className="mt-0.5 text-sm text-white/70">
                      {eventTypeLabel(event.event_type)}
                      {event.note ? ` — ${event.note}` : ""}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {relatedFrictionCases.length > 0 && (
        <div className="mb-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">Friction</p>
          <div className="space-y-3">
            {relatedFrictionCases.map((frictionCase) => (
              <DevelopmentFrictionCaseCard key={frictionCase.id} frictionCase={frictionCase} />
            ))}
          </div>
        </div>
      )}

      {sortedCaseEvents.length > 0 && (
        <div className="mb-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">Hearing History</p>
          <div className="space-y-3 border-l border-white/10 pl-4">
            {[...sortedCaseEvents].reverse().map((event) => (
              <div key={event.id} className="text-sm">
                <p className="font-medium text-white">
                  {formatDate(event.event_date)} —{" "}
                  {event.decision_body ? ENTITLEMENT_DECISION_BODY_LABEL[event.decision_body] : humanizeSnakeCase(event.event_type)}
                </p>
                {event.outcome && <p className="mt-0.5 text-white/60">{humanizeSnakeCase(event.outcome)}</p>}
                {(event.vote_yes != null || event.vote_no != null) && (
                  <p className="mt-0.5 text-white/50">
                    Vote: {event.vote_yes ?? 0}–{event.vote_no ?? 0}
                    {event.vote_abstain ? ` (${event.vote_abstain} abstain)` : ""}
                  </p>
                )}
                {event.note && <p className="mt-0.5 text-white/60">{event.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {caseDetail.changes.length > 0 && (
        <div className="mb-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">Requested vs. Approved</p>
          <div className="space-y-2">
            {caseDetail.changes.map((change) => (
              <div key={change.id} className="rounded-lg bg-white/5 p-3 text-sm">
                <p className="text-[11px] uppercase tracking-wide text-white/40">{humanizeSnakeCase(change.dimension)}</p>
                <p className="mt-1 text-white/70">
                  <span className="text-white/45">Requested:</span> {change.requested_value ?? "—"}
                </p>
                <p className="mt-0.5 text-white/70">
                  <span className="text-white/45">Approved:</span> {change.approved_value ?? "—"}
                </p>
                {change.change_summary && <p className="mt-1 text-white/60">{change.change_summary}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {caseDetail.conditions.length > 0 && (
        <div className="mb-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">Conditions of Approval</p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-white/70">
            {caseDetail.conditions.map((condition) => (
              <li key={condition.id}>{condition.condition_text}</li>
            ))}
          </ul>
        </div>
      )}

      {caseDetail.parties.length > 0 && (
        <div className="mb-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">Entitlement Parties</p>
          <div className="flex flex-wrap gap-1.5">
            {caseDetail.parties.map((party) => (
              <span key={party.id} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
                {humanizeSnakeCase(party.role)}: {party.company_name ?? party.person_name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-4 text-[10px] text-white/40">
        <span>{caseDetail.confidence === "verified" ? "Verified" : caseDetail.confidence === "reported" ? "Reported" : "Unconfirmed"}</span>
        {caseDetail.source && (
          <a
            href={caseDetail.source.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 truncate underline decoration-white/30 underline-offset-2 hover:decoration-white"
          >
            View original record
          </a>
        )}
      </div>

      {showOriginalToggle && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className="text-[11px] font-medium uppercase tracking-wide text-white/35 hover:text-white/60"
          >
            {showOriginal ? "Hide" : "Show"} original source text {showOriginal ? "▲" : "▼"}
          </button>
          {showOriginal && <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-white/45">{caseDetail.summary}</p>}
        </div>
      )}
    </div>
  );
}
