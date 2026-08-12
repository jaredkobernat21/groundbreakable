import {
  ACTIVITY_PHASE_COLOR,
  ACTIVITY_PHASE_LABEL,
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  type ProjectWithSource,
} from "@/lib/types";
import { resolveActivityPhase } from "@/lib/activityPhase";
import { formatCurrency, formatDate, formatRelativeVerified } from "@/lib/format";
import { projectIconSvgMarkup, resolveProjectIcon } from "@/lib/markerIcons";

const CONFIDENCE_LABEL: Record<ProjectWithSource["confidence"], string> = {
  verified: "Verified against primary source",
  reported: "Reported by named source",
  unconfirmed: "Unconfirmed — treat as preliminary",
};

export default function ProjectDetailPanel({
  project,
  onClose,
}: {
  project: ProjectWithSource;
  onClose: () => void;
}) {
  const phase = resolveActivityPhase(project.status, project.date_updated);
  const color = phase ? ACTIVITY_PHASE_COLOR[phase] : ACTIVITY_PHASE_COLOR.completed;
  const facts = [
    project.project_value != null && { label: "Project Value", value: formatCurrency(project.project_value) },
    project.units != null && { label: "Units", value: project.units.toLocaleString() },
    project.acreage != null && { label: "Acreage", value: `${project.acreage} ac` },
    project.developer && { label: "Developer", value: project.developer },
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

      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${color}55`, color, backgroundColor: `${color}1a` }}
      >
        <span
          className="flex h-3 w-3 items-center justify-center"
          dangerouslySetInnerHTML={{
            __html: projectIconSvgMarkup(resolveProjectIcon(project.category, project.status), {
              size: 12,
              stroke: color,
              strokeWidth: 2,
            }),
          }}
        />
        {PROJECT_CATEGORY_LABEL[project.category]}
        {phase && <span className="text-white/40">· {ACTIVITY_PHASE_LABEL[phase]}</span>}
      </div>

      <h2 className="pr-6 text-lg font-semibold leading-snug text-white">{project.title}</h2>
      <div className="mt-1 text-sm text-white/50">{PROJECT_STATUS_LABEL[project.status]}</div>
      {project.address && <div className="mt-1 text-sm text-white/40">{project.address}</div>}

      {project.description && (
        <p className="mt-4 text-sm leading-relaxed text-white/70">{project.description}</p>
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

      {project.date_announced && (
        <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/60">
          Announced {formatDate(project.date_announced)}
        </div>
      )}

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-white/40">
        <div>{CONFIDENCE_LABEL[project.confidence]}</div>
        {project.source && (
          <div>
            Source:{" "}
            <a
              href={project.source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/70 underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              {project.source.agency}
            </a>
          </div>
        )}
        <div>Last verified {formatRelativeVerified(project.last_verified_at)}</div>
      </div>
    </div>
  );
}
