import type { CompanyProfile } from "@/lib/companyProfiles";
import { PROJECT_PERSON_CONFIDENCE_LABEL, PROJECT_PERSON_ROLE_LABEL, PROJECT_STAGE_LABEL, PROJECT_TYPE_LABEL } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

const CONFIDENCE_COLOR: Record<string, string> = {
  confirmed: "#22c55e",
  likely: "#eab308",
};

// The Development/Builder/Contractor profile the spec asks for --
// known-project counts by stage, estimated volume, primary type,
// frequent partners (a plain co-occurrence count over project_people,
// computed live -- see lib/companyProfiles.ts), recent projects, and the
// full evidence trail as an activity timeline. Every number here traces
// back to real project_people/projects rows; nothing is a stored/cached
// rollup that could drift.
export default function CompanyDetailPanel({ profile, onClose }: { profile: CompanyProfile; onClose: () => void }) {
  const { stageBreakdown } = profile;

  return (
    <div className="absolute right-3 top-3 bottom-3 z-30 w-[380px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>

      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/40">
        {PROJECT_PERSON_ROLE_LABEL[profile.role]}
      </div>
      <h2 className="mb-1 text-lg font-semibold leading-snug text-white">{profile.displayName}</h2>
      {profile.companyName && <p className="mb-4 text-sm text-white/50">{profile.companyName}</p>}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 py-4 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Known Projects/Records</dt>
          <dd className="text-white">{profile.records.length}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Estimated Volume</dt>
          <dd className="text-white">{profile.estimatedVolume != null ? formatCurrency(profile.estimatedVolume) : "Not available"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Primary Type</dt>
          <dd className="text-white">{profile.primaryType ? PROJECT_TYPE_LABEL[profile.primaryType] : "Not available"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Tracked Projects</dt>
          <dd className="text-white">{profile.projects.length}</dd>
        </div>
      </dl>

      {profile.projects.length > 0 && (
        <div className="border-t border-white/10 py-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Project Stages</p>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/80">{stageBreakdown.planning} Planning</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/80">{stageBreakdown.active} Active</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/80">{stageBreakdown.completed} Completed</span>
            {stageBreakdown.unclear > 0 && (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/50">{stageBreakdown.unclear} Stage Unclear</span>
            )}
          </div>
        </div>
      )}

      {profile.partners.length > 0 && (
        <div className="border-t border-white/10 py-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Frequent Partners</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.partners.slice(0, 5).map((partner) => (
              <span key={partner.name} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
                {PROJECT_PERSON_ROLE_LABEL[partner.role]}: {partner.name}
                {partner.sharedProjectCount > 1 && <span className="text-white/40"> ({partner.sharedProjectCount})</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.projects.length > 0 && (
        <div className="border-t border-white/10 py-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Recent Projects</p>
          <ul className="space-y-2">
            {profile.projects.slice(0, 6).map((project) => (
              <li key={project.id} className="text-sm">
                <p className="font-medium text-white">{project.title}</p>
                <p className="text-xs text-white/45">
                  {[project.stage ? PROJECT_STAGE_LABEL[project.stage] : null, project.address].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-white/10 py-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/35">Activity</p>
        <ul className="space-y-3">
          {profile.records.map((record) => (
            <li key={record.id} className="text-xs leading-relaxed text-white/70">
              <span className="font-medium text-white">{record.related_label}</span>
              {formatDate(record.event_date) && <span className="text-white/40"> · {formatDate(record.event_date)}</span>}
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-black"
                style={{ backgroundColor: CONFIDENCE_COLOR[record.confidence] }}
              >
                {PROJECT_PERSON_CONFIDENCE_LABEL[record.confidence]}
              </span>
              {record.evidence_note && <p className="mt-0.5 text-white/45">{record.evidence_note}</p>}
              {record.source && (
                <a
                  href={record.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 block text-white/45 underline decoration-white/20 underline-offset-2 hover:decoration-white/60"
                >
                  Source: {record.source.agency}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
