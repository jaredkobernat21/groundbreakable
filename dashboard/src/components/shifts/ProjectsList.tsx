import type { ProjectWithSource } from "@/lib/types";
import { PLAN_CATEGORY_LABEL, PROJECT_STAGE_LABEL, PROJECT_TYPE_LABEL } from "@/lib/types";

const STAGE_COLOR: Record<string, string> = {
  proposed: "#94a3b8",
  review_planning: "#94a3b8",
  approved: "#f97316",
  permitting: "#f97316",
  construction: "#3b82f6",
  complete: "#22c55e",
  on_hold: "#eab308",
  cancelled: "#ef4444",
};

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  return `$${value.toLocaleString()}`;
}

// The "Projects" tab of the shift dashboard -- unlike ShiftFeed (a
// chronological change-log), this is a snapshot of what's actively in
// the pipeline right now, grouped by nothing in particular but sorted by
// most-recently-updated. See getActiveProjects/ProjectWithSource for why
// this reads `projects`, not `shifts`.
export default function ProjectsList({ projects }: { projects: ProjectWithSource[] }) {
  if (projects.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">No active projects recorded yet for this market.</p>;
  }

  return (
    <div className="divide-y divide-[#1c1c1c]/10">
      {projects.map((project) => (
        <div key={project.id} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#1c1c1c]">{project.title}</h3>
            {project.stage && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: STAGE_COLOR[project.stage] ?? "#94a3b8" }}
              >
                {PROJECT_STAGE_LABEL[project.stage]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] text-[#1c1c1c]/50">
            {project.plan_category && <span>{PLAN_CATEGORY_LABEL[project.plan_category]}</span>}
            {project.plan_category && project.project_type && <span>&middot;</span>}
            {project.project_type && <span>{PROJECT_TYPE_LABEL[project.project_type]}</span>}
          </div>

          {project.description && <p className="text-xs leading-relaxed text-[#1c1c1c]/70">{project.description}</p>}

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#1c1c1c]/50">
            {project.address && <span>{project.address}</span>}
            {project.developer && <span>Developer: {project.developer}</span>}
            {project.units != null && <span>{project.units} units</span>}
            {project.acreage != null && <span>{project.acreage} acres</span>}
            {project.project_value != null && <span>{formatUsd(project.project_value)}</span>}
          </div>

          {project.source && (
            <a
              href={project.source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-medium text-[#1c1c1c] underline decoration-[#1c1c1c]/30 underline-offset-2 hover:decoration-[#1c1c1c]"
            >
              {project.source.agency}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
