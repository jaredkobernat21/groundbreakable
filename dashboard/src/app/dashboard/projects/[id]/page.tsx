import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectDetail, getNearbyProjects, getProjectEvents } from "@/lib/queries/planIntelligence";
import { getEntitlementCaseDetailByProjectId } from "@/lib/queries/entitlementCases";
import { computeEntitlementRealityScore } from "@/lib/entitlement/score";
import { eventTypeLabel, groupEventsByDate } from "@/lib/projectEventDisplay";
import { formatCurrency, formatDate, formatRelativeVerified } from "@/lib/format";
import {
  ENTITLEMENT_APPROVAL_PATH_LABEL,
  ENTITLEMENT_CASE_STATUS_LABEL,
  ENTITLEMENT_DECISION_BODY_LABEL,
  PARTY_ROLE_LABEL,
  PLAN_CATEGORY_LABEL,
  PROJECT_STAGE_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  type PartyRole,
  type ProjectPartyWithCompany,
} from "@/lib/types";

function humanizeSnakeCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const dynamic = "force-dynamic";

// Display order for the People/Companies section (§15) -- developer and
// owner first since those are almost always known, applicant last since
// it's the most process-specific role.
const PARTY_ROLE_ORDER: PartyRole[] = ["developer", "owner", "investor", "builder_gc", "architect_engineer", "applicant"];

function groupPartiesByRole(parties: ProjectPartyWithCompany[]) {
  const groups = new Map<PartyRole, ProjectPartyWithCompany[]>();
  for (const party of parties) {
    const existing = groups.get(party.role);
    if (existing) existing.push(party);
    else groups.set(party.role, [party]);
  }
  return PARTY_ROLE_ORDER.filter((role) => groups.has(role)).map((role) => ({ role, parties: groups.get(role)! }));
}

// The persistent Project detail page (§15, Phase 4): overview, people/
// companies (project_parties -> companies, replacing the old developer/
// contractor/investor text columns), stage, full event history, sources,
// and nearby projects. A Project is a real entity now, not just a pin --
// this is where its whole record lives.
export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: project } = await getProjectDetail(supabase, params.id);
  if (!project) notFound();

  const [{ data: events }, { data: nearbyProjects }, { data: entitlementCase }] = await Promise.all([
    getProjectEvents(supabase, project.id),
    getNearbyProjects(supabase, project.market_id, project.id, { lat: project.latitude, lng: project.longitude }),
    getEntitlementCaseDetailByProjectId(supabase, project.id),
  ]);

  const eventGroups = groupEventsByDate(events ?? []);
  const partyGroups = groupPartiesByRole(project.parties);

  // Entitlement Reality Score (spec §9): computed from the linked case's
  // own fields, not re-entered -- only meaningful once a case is actually
  // linked, so this stays null otherwise rather than scoring a project
  // with no entitlement record on file.
  const entitlementScore = entitlementCase
    ? await computeEntitlementRealityScore(supabase, project.market_id, {
        latitude: entitlementCase.latitude,
        longitude: entitlementCase.longitude,
        existingZoning: entitlementCase.existing_zoning,
        requestedZoning: entitlementCase.requested_zoning,
        proposedUse: entitlementCase.proposed_use,
        acreage: entitlementCase.acreage,
        proposedUnits: entitlementCase.proposed_units,
        planningArea: entitlementCase.planning_area,
        approvalTypeKey: entitlementCase.approval_type?.key ?? null,
        excludeCaseId: entitlementCase.id,
      })
    : null;

  // events is already ordered newest-first (getProjectEvents), so its
  // first status-bearing row is the project's current granular status --
  // no separate query needed, and it stays fresh as new events land
  // instead of relying on a status cache column on projects itself.
  const currentStatus = events?.find((e) => e.status)?.status ?? null;

  // Documents/Sources (§15) -- the project's own citation plus every
  // distinct source an event has added since, deduplicated by source id
  // so a repeatedly-cited agency only shows once.
  const sourcesById = new Map<string, NonNullable<typeof project.source>>();
  if (project.source) sourcesById.set(project.source.id, project.source);
  for (const event of events ?? []) {
    if (event.source) sourcesById.set(event.source.id, event.source);
  }
  const sources = Array.from(sourcesById.values());

  const facts = [
    project.project_value != null && { label: "Project Value", value: formatCurrency(project.project_value) },
    project.units != null && { label: "Units", value: project.units.toLocaleString() },
    project.acreage != null && { label: "Acreage", value: `${project.acreage} ac` },
    project.date_announced && { label: "Announced", value: formatDate(project.date_announced) },
  ].filter(Boolean) as { label: string; value: string | null }[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#1c1c1c]/50">
        <Link href={`/dashboard/projects?market=${project.market.slug}`} className="hover:text-[#1c1c1c]">
          ← Projects
        </Link>
        <span>·</span>
        <span>
          {project.market.name}, {project.market.state}
        </span>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          {project.plan_category && (
            <span className="rounded-full bg-[#1c1c1c]/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#1c1c1c]/60">
              {PLAN_CATEGORY_LABEL[project.plan_category]}
            </span>
          )}
          {project.project_type && (
            <span className="rounded-full bg-[#1c1c1c]/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#1c1c1c]/60">
              {PROJECT_TYPE_LABEL[project.project_type]}
            </span>
          )}
          {project.stage && (
            <span className="rounded-full border border-[#1c1c1c]/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#1c1c1c]">
              {PROJECT_STAGE_LABEL[project.stage]}
            </span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-[#1c1c1c]">{project.title}</h1>
        <p className="mt-1 text-sm text-[#1c1c1c]/50">
          {currentStatus ? PROJECT_STATUS_LABEL[currentStatus] : "No status recorded"}
          {project.address ? ` · ${project.address}` : ""}
        </p>
      </div>

      {entitlementCase && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Entitlement</h2>
              <span className="rounded-full bg-[#1c1c1c]/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#1c1c1c]/60">
                {ENTITLEMENT_CASE_STATUS_LABEL[entitlementCase.status]}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[#1c1c1c]/35">Approval Path</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#1c1c1c]">
                  {entitlementCase.approval_type
                    ? `${ENTITLEMENT_APPROVAL_PATH_LABEL[entitlementCase.approval_type.approval_path]} (${entitlementCase.approval_type.label})`
                    : "Not on file"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[#1c1c1c]/35">Current Zoning</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#1c1c1c]">{entitlementCase.existing_zoning ?? "Not on file"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[#1c1c1c]/35">Requested Zoning</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#1c1c1c]">{entitlementCase.requested_zoning ?? "Not on file"}</dd>
              </div>
            </dl>

            {entitlementCase.summary && <p className="mt-4 text-sm leading-relaxed text-[#1c1c1c]/70">{entitlementCase.summary}</p>}

            {entitlementCase.changes.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1c1c1c]/35">Requested vs. Approved</h3>
                <div className="space-y-2">
                  {entitlementCase.changes.map((change) => (
                    <div key={change.id} className="rounded-lg bg-[#1c1c1c]/[0.03] p-3 text-sm">
                      <p className="text-[11px] uppercase tracking-wide text-[#1c1c1c]/40">{humanizeSnakeCase(change.dimension)}</p>
                      <p className="mt-1 text-[#1c1c1c]/70">
                        <span className="text-[#1c1c1c]/45">Requested:</span> {change.requested_value ?? "—"}
                      </p>
                      <p className="mt-0.5 text-[#1c1c1c]/70">
                        <span className="text-[#1c1c1c]/45">Approved:</span> {change.approved_value ?? "—"}
                      </p>
                      {change.change_summary && <p className="mt-1 text-[#1c1c1c]/60">{change.change_summary}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entitlementCase.events.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1c1c1c]/35">Staff / Planning Commission / City Commission History</h3>
                <div className="space-y-3 border-l border-[#1c1c1c]/10 pl-4">
                  {[...entitlementCase.events]
                    .sort((a, b) => a.event_date.localeCompare(b.event_date))
                    .map((event) => (
                      <div key={event.id} className="text-sm">
                        <p className="font-medium text-[#1c1c1c]">
                          {formatDate(event.event_date)} — {event.decision_body ? ENTITLEMENT_DECISION_BODY_LABEL[event.decision_body] : humanizeSnakeCase(event.event_type)}
                        </p>
                        {event.outcome && <p className="mt-0.5 text-[#1c1c1c]/60">{humanizeSnakeCase(event.outcome)}</p>}
                        {(event.vote_yes != null || event.vote_no != null) && (
                          <p className="mt-0.5 text-[#1c1c1c]/50">
                            Vote: {event.vote_yes ?? 0}–{event.vote_no ?? 0}
                            {event.vote_abstain ? ` (${event.vote_abstain} abstain)` : ""}
                          </p>
                        )}
                        {event.note && <p className="mt-0.5 text-[#1c1c1c]/60">{event.note}</p>}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {entitlementCase.conditions.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1c1c1c]/35">Conditions of Approval</h3>
                <ul className="list-disc space-y-1 pl-4 text-sm text-[#1c1c1c]/70">
                  {entitlementCase.conditions.map((condition) => (
                    <li key={condition.id}>{condition.condition_text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {entitlementCase.parties.length > 0 && (
              <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Entitlement Parties</h2>
                <dl className="space-y-3">
                  {entitlementCase.parties.map((party) => (
                    <div key={party.id}>
                      <dt className="text-[11px] uppercase tracking-wide text-[#1c1c1c]/35">{humanizeSnakeCase(party.role)}</dt>
                      <dd className="mt-0.5 text-sm font-medium text-[#1c1c1c]">{party.company_name ?? party.person_name}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {entitlementScore && (
              <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Entitlement Reality Score</h2>
                  <span className="text-[11px] uppercase tracking-wide text-[#1c1c1c]/35">{entitlementScore.confidence} confidence</span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-[#1c1c1c]">
                  {entitlementScore.score}
                  <span className="text-base font-normal text-[#1c1c1c]/40">/100</span>
                </p>
                <p className="mt-1 text-[11px] text-[#1c1c1c]/40">A decision-support index, not a probability of approval.</p>
                <dl className="mt-4 space-y-2">
                  {entitlementScore.components.map((component) => (
                    <div key={component.key} className="flex items-center justify-between gap-2 text-sm">
                      <dt className="text-[#1c1c1c]/60">{component.label}</dt>
                      <dd className="font-medium text-[#1c1c1c]">
                        {component.points}/{component.maxPoints}
                      </dd>
                    </div>
                  ))}
                </dl>
                {entitlementScore.missingInformation.length > 0 && (
                  <div className="mt-4 border-t border-[#1c1c1c]/10 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1c1c1c]/35">Missing Information</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-[#1c1c1c]/50">
                      {entitlementScore.missingInformation.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {project.description && (
            <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Overview</h2>
              <p className="text-sm leading-relaxed text-[#1c1c1c]/80">{project.description}</p>
            </div>
          )}

          <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Timeline</h2>
            {eventGroups.length === 0 ? (
              <p className="text-sm text-[#1c1c1c]/40">No recorded history yet.</p>
            ) : (
              <div className="space-y-5">
                {eventGroups.map((group) => (
                  <div key={group.date} className="grid grid-cols-[84px_1fr] gap-4">
                    <div className="pt-0.5 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">
                      {formatDate(group.date)}
                    </div>
                    <div className="space-y-3 border-l border-[#1c1c1c]/10 pl-4">
                      {group.events.map((event) => (
                        <div key={event.id}>
                          <div className="text-sm font-medium text-[#1c1c1c]">{eventTypeLabel(event.event_type)}</div>
                          {event.note && <p className="mt-0.5 text-sm text-[#1c1c1c]/60">{event.note}</p>}
                          {event.amount != null && (
                            <p className="mt-0.5 text-sm text-[#1c1c1c]/60">
                              {formatCurrency(event.amount)}
                              {event.funding_source ? ` — ${event.funding_source}` : ""}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Documents / Sources</h2>
            {sources.length === 0 ? (
              <p className="text-sm text-[#1c1c1c]/40">No sources on record.</p>
            ) : (
              <ul className="space-y-2">
                {sources.map((source) => (
                  <li key={source.id} className="text-sm">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-medium text-[#1c1c1c] underline decoration-[#1c1c1c]/20 underline-offset-2 hover:decoration-[#1c1c1c]"
                    >
                      {source.title ?? source.agency}
                    </a>
                    <span className="text-[#1c1c1c]/40"> · {source.agency}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 border-t border-[#1c1c1c]/10 pt-3 text-xs text-[#1c1c1c]/40">
              Confidence: {project.confidence} · Last verified {formatRelativeVerified(project.last_verified_at)}
            </div>
          </div>

          <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">
              Related Intelligence — Nearby Projects
            </h2>
            {!nearbyProjects || nearbyProjects.length === 0 ? (
              <p className="text-sm text-[#1c1c1c]/40">No other projects within 1 mile.</p>
            ) : (
              <ul className="space-y-2">
                {nearbyProjects.map((nearby) => (
                  <li key={nearby.id}>
                    <Link
                      href={`/dashboard/projects/${nearby.id}?market=${project.market.slug}`}
                      className="flex items-center justify-between gap-2 text-sm text-[#1c1c1c]/70 hover:text-[#1c1c1c]"
                    >
                      <span className="truncate font-medium">{nearby.title}</span>
                      <span className="shrink-0 text-[11px] uppercase tracking-wide text-[#1c1c1c]/35">
                        {nearby.plan_category ? PLAN_CATEGORY_LABEL[nearby.plan_category] : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">People / Companies</h2>
            {partyGroups.length === 0 ? (
              <p className="text-sm text-[#1c1c1c]/40">No parties on record yet.</p>
            ) : (
              <dl className="space-y-3">
                {partyGroups.map(({ role, parties }) => (
                  <div key={role}>
                    <dt className="text-[11px] uppercase tracking-wide text-[#1c1c1c]/35">{PARTY_ROLE_LABEL[role]}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-[#1c1c1c]">
                      {parties.map((p) => p.company.name).join(", ")}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {facts.length > 0 && (
            <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Facts</h2>
              <dl className="space-y-3">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-[11px] uppercase tracking-wide text-[#1c1c1c]/35">{fact.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-[#1c1c1c]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <Link
            href={`/dashboard/map?market=${project.market.slug}&select=${project.id}&selectType=project`}
            className="block rounded-xl border border-[#1c1c1c]/10 bg-white p-5 text-center text-sm font-medium text-[#1c1c1c] hover:border-[#1c1c1c]/25"
          >
            View on Map →
          </Link>
        </div>
      </div>
    </div>
  );
}
