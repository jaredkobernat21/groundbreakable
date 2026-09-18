import type { GrowthArea, ProjectPersonWithSource, ProjectWithSource, ShiftCategory, ShiftWithSource } from "@/lib/types";
import { GROWTH_AREA_MOMENTUM_LABEL, PROJECT_PERSON_ROLE_LABEL, PROJECT_STAGE_LABEL } from "@/lib/types";
import { SHIFT_CATEGORY_COLOR, SHIFT_CATEGORY_LABEL } from "@/lib/shiftConstants";
import { formatDate } from "@/lib/format";

function linkedPeopleLabel(people: ProjectPersonWithSource[]): string | null {
  if (people.length === 0) return null;
  return people.map((p) => `${PROJECT_PERSON_ROLE_LABEL[p.role]}: ${p.person_name ?? p.company_name}`).join(", ");
}

// Shown when a Momentum Area (a polygon on the Momentum tab's map,
// clustering shifts + projects that read as one growth story -- see
// growth_areas/pointInPolygon) is selected, either by clicking the
// polygon on the map or by clicking the Momentum rail tab (which
// auto-selects the market's most active area). Explains *why* this
// patch of the map is a momentum area: the narrative, then every real
// shift/project that falls inside it, grouped by category. Same
// right-anchored dark-glass overlay convention as ShiftDetailPanel, so
// the Momentum map's two possible detail panels read as one consistent
// "selected thing" surface rather than two different card styles.
export default function MomentumAreaDetailPanel({
  area,
  shiftsByCategory,
  projects,
  projectPeople,
  selectedShiftId,
  onSelectShift,
  onClose,
}: {
  area: GrowthArea;
  shiftsByCategory: Partial<Record<ShiftCategory, ShiftWithSource[]>>;
  projects: ProjectWithSource[];
  projectPeople: ProjectPersonWithSource[];
  selectedShiftId: string | null;
  onSelectShift: (id: string | null) => void;
  onClose: () => void;
}) {
  const categoryEntries = Object.entries(shiftsByCategory) as [ShiftCategory, ShiftWithSource[]][];
  const totalCount = categoryEntries.reduce((sum, [, items]) => sum + items.length, 0) + projects.length;

  return (
    <div className="absolute right-3 top-16 bottom-3 z-30 w-[340px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:top-3">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>

      <div className="flex items-center gap-2 pr-6">
        <h3 className="text-base font-semibold leading-snug text-white">{area.name}</h3>
        <span className="shrink-0 rounded-full bg-[#818cf8]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#a5b4fc]">
          {GROWTH_AREA_MOMENTUM_LABEL[area.momentum_state]}
        </span>
      </div>
      <p className="mt-0.5 text-sm text-white/50">
        {totalCount} signal{totalCount === 1 ? "" : "s"} in this area
      </p>

      {area.narrative && <p className="mt-4 text-sm leading-relaxed text-white/70">{area.narrative}</p>}

      {projects.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/35">Projects ({projects.length})</p>
          <ul className="space-y-1.5">
            {projects.map((project) => {
              const people = projectPeople.filter((p) => p.related_record_type === "project" && p.related_record_id === project.id);
              const peopleLabel = linkedPeopleLabel(people);
              return (
                <li key={project.id} className="text-sm leading-relaxed text-white/70">
                  <span className="font-medium text-white">{project.title}</span>
                  {project.stage && ` — ${PROJECT_STAGE_LABEL[project.stage]}`}
                  <span className="text-white/40"> · {peopleLabel ?? project.developer ?? "—"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {categoryEntries.map(([category, items]) => (
        <div key={category} className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: SHIFT_CATEGORY_COLOR[category] }}>
            {SHIFT_CATEGORY_LABEL[category]} ({items.length})
          </p>
          <ul className="space-y-1.5">
            {items.map((shift) => {
              const people = projectPeople.filter((p) => p.related_record_type === "shift" && p.related_record_id === shift.id);
              const peopleLabel = linkedPeopleLabel(people);
              return (
                <li key={shift.id}>
                  <button
                    type="button"
                    onClick={() => onSelectShift(shift.id === selectedShiftId ? null : shift.id)}
                    className={`text-left text-sm leading-relaxed hover:text-white ${
                      shift.id === selectedShiftId ? "font-medium text-white" : "text-white/70"
                    }`}
                  >
                    {shift.event}
                    {formatDate(shift.event_date) && <span className="text-white/40"> — {formatDate(shift.event_date)}</span>}
                    {peopleLabel && <span className="text-white/40"> · {peopleLabel}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
