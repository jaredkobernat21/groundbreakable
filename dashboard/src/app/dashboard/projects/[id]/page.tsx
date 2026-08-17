import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectDetail, getNearbyProjects, getProjectEvents } from "@/lib/queries/planIntelligence";
import { eventTypeLabel, groupEventsByDate } from "@/lib/projectEventDisplay";
import { formatCurrency, formatDate, formatRelativeVerified } from "@/lib/format";
import {
  PARTY_ROLE_LABEL,
  PLAN_CATEGORY_LABEL,
  PROJECT_CATEGORY_LABEL,
  PROJECT_STAGE_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  type PartyRole,
  type ProjectPartyWithCompany,
} from "@/lib/types";

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

  const [{ data: events }, { data: nearbyProjects }] = await Promise.all([
    getProjectEvents(supabase, project.id),
    getNearbyProjects(supabase, project.market_id, project.id, { lat: project.latitude, lng: project.longitude }),
  ]);

  const eventGroups = groupEventsByDate(events ?? []);
  const partyGroups = groupPartiesByRole(project.parties);

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
          {PROJECT_CATEGORY_LABEL[project.category]} · {PROJECT_STATUS_LABEL[project.status]}
          {project.address ? ` · ${project.address}` : ""}
        </p>
      </div>

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
                        {PROJECT_CATEGORY_LABEL[nearby.category]}
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
