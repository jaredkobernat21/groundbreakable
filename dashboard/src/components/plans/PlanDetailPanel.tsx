import type {
  DevelopmentFrictionCaseWithSource,
  EntitlementCaseDetail,
  ProjectEventWithProject,
  ProjectPersonWithSource,
  ProjectWithSource,
} from "@/lib/types";
import {
  ENTITLEMENT_APPROVAL_PATH_LABEL,
  ENTITLEMENT_CASE_STATUS_LABEL,
  ENTITLEMENT_DECISION_BODY_LABEL,
  PROJECT_STAGE_LABEL,
} from "@/lib/types";
import type { EntitlementRealityScoreResult } from "@/lib/entitlement/score";
import type { PlanItem } from "@/lib/planItems";
import { formatCurrency, formatDate } from "@/lib/format";
import { eventTypeLabel, groupEventsByDate } from "@/lib/projectEventDisplay";
import ShiftDetailPanel from "../shifts/ShiftDetailPanel";
import DevelopmentFrictionCaseCard from "../friction/DevelopmentFrictionCaseCard";

function humanizeSnakeCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// The Plans feature's one detail surface -- a bare shift renders through
// the existing ShiftDetailPanel unchanged; an entitlement case gets the
// full request -> staff -> hearings -> changes -> conditions -> score
// breakdown (ported from the old per-project page, see git history for
// app/dashboard/projects/[id]/page.tsx) plus, when this case (or its
// linked project) has a real development_friction_cases row, that case's
// full opposition/delay story inline -- friction is context on a plan, not
// its own destination (Jared, 2026-09-25).
export default function PlanDetailPanel({
  plan,
  caseDetail,
  project,
  projectEvents,
  realityScore,
  relatedFrictionCases,
  people,
  onClose,
}: {
  plan: PlanItem;
  caseDetail: EntitlementCaseDetail | null;
  project: ProjectWithSource | null;
  projectEvents: ProjectEventWithProject[];
  realityScore: EntitlementRealityScoreResult | null;
  relatedFrictionCases: DevelopmentFrictionCaseWithSource[];
  people: ProjectPersonWithSource[];
  onClose: () => void;
}) {
  if (plan.kind === "shift") {
    return <ShiftDetailPanel shift={plan.shift} people={people} onClose={onClose} />;
  }

  if (!caseDetail) return null;
  const eventGroups = groupEventsByDate(projectEvents);

  return (
    <div className="absolute right-3 top-16 bottom-3 z-30 w-[420px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:top-3">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>

      <div className="mb-3 flex items-center justify-between gap-3 pr-6">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
          {caseDetail.case_number ?? "Entitlement Case"}
        </p>
        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
          {ENTITLEMENT_CASE_STATUS_LABEL[caseDetail.status]}
        </span>
      </div>

      <h2 className="mb-1 text-base font-semibold leading-snug text-white">{caseDetail.address ?? "Address not on file"}</h2>
      {caseDetail.summary && <p className="mb-4 text-sm leading-relaxed text-white/70">{caseDetail.summary}</p>}

      <dl className="mb-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Approval Path</dt>
          <dd className="mt-0.5 font-medium text-white">
            {caseDetail.approval_type
              ? `${ENTITLEMENT_APPROVAL_PATH_LABEL[caseDetail.approval_type.approval_path]} (${caseDetail.approval_type.label})`
              : "Not on file"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Acreage</dt>
          <dd className="mt-0.5 font-medium text-white">{caseDetail.acreage != null ? `${caseDetail.acreage} ac` : "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Current Zoning</dt>
          <dd className="mt-0.5 font-medium text-white">{caseDetail.existing_zoning ?? "Not on file"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Requested Zoning</dt>
          <dd className="mt-0.5 font-medium text-white">{caseDetail.requested_zoning ?? "Not on file"}</dd>
        </div>
      </dl>

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

      {caseDetail.events.length > 0 && (
        <div className="mb-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">
            Staff / Planning Commission / City Commission History
          </p>
          <div className="space-y-3 border-l border-white/10 pl-4">
            {[...caseDetail.events]
              .sort((a, b) => a.event_date.localeCompare(b.event_date))
              .map((event) => (
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

      <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-4 text-[10px] text-white/40">
        <span>
          {caseDetail.confidence === "verified" ? "Verified" : caseDetail.confidence === "reported" ? "Reported" : "Unconfirmed"}
        </span>
        {caseDetail.source && (
          <a href={caseDetail.source.url} target="_blank" rel="noreferrer" className="shrink-0 truncate underline decoration-white/30 underline-offset-2 hover:decoration-white">
            Source: {caseDetail.source.agency}
          </a>
        )}
      </div>
    </div>
  );
}
