import type { GrowthArea, ProjectWithSource, ShiftCategory, ShiftWithSource } from "@/lib/types";
import { GROWTH_AREA_MOMENTUM_LABEL, PROJECT_STAGE_LABEL } from "@/lib/types";
import { SHIFT_CATEGORY_COLOR, SHIFT_CATEGORY_LABEL } from "@/lib/shiftConstants";
import { formatDate } from "@/lib/format";

// Shown when a Momentum Area (a polygon on the Momentum tab's map,
// clustering shifts + projects that read as one growth story -- see
// growth_areas/pointInPolygon) is selected, either by clicking the
// polygon on the map or by clicking the Momentum rail tab (which
// auto-selects the market's most active area). Explains *why* this
// patch of the map is a momentum area: the narrative, then every real
// shift/project that falls inside it, grouped by category.
export default function MomentumAreaDetailPanel({
  area,
  shiftsByCategory,
  projects,
  selectedShiftId,
  onSelectShift,
  onClose,
}: {
  area: GrowthArea;
  shiftsByCategory: Partial<Record<ShiftCategory, ShiftWithSource[]>>;
  projects: ProjectWithSource[];
  selectedShiftId: string | null;
  onSelectShift: (id: string | null) => void;
  onClose: () => void;
}) {
  const categoryEntries = Object.entries(shiftsByCategory) as [ShiftCategory, ShiftWithSource[]][];
  const totalCount = categoryEntries.reduce((sum, [, items]) => sum + items.length, 0) + projects.length;

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1c1c1c]">{area.name}</h3>
            <span className="shrink-0 rounded-full bg-[#818cf8]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#818cf8]">
              {GROWTH_AREA_MOMENTUM_LABEL[area.momentum_state]}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#1c1c1c]/40">{totalCount} signal{totalCount === 1 ? "" : "s"} in this area</p>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 text-xs text-[#1c1c1c]/40 hover:text-[#1c1c1c]">
          ✕
        </button>
      </div>

      {area.narrative && <p className="text-xs leading-relaxed text-[#1c1c1c]/70">{area.narrative}</p>}

      {projects.length > 0 && (
        <div className="space-y-1.5 border-t border-[#1c1c1c]/10 pt-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1c1c1c]/40">Projects ({projects.length})</p>
          <ul className="space-y-1">
            {projects.map((project) => (
              <li key={project.id} className="text-xs leading-relaxed text-[#1c1c1c]/70">
                <span className="font-medium text-[#1c1c1c]">{project.title}</span>
                {project.stage && ` — ${PROJECT_STAGE_LABEL[project.stage]}`}
                {project.developer && <span className="text-[#1c1c1c]/45"> · {project.developer}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {categoryEntries.map(([category, items]) => (
        <div key={category} className="space-y-1.5 border-t border-[#1c1c1c]/10 pt-2.5">
          <p
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: SHIFT_CATEGORY_COLOR[category] }}
          >
            {SHIFT_CATEGORY_LABEL[category]} ({items.length})
          </p>
          <ul className="space-y-1">
            {items.map((shift) => (
              <li key={shift.id}>
                <button
                  type="button"
                  onClick={() => onSelectShift(shift.id === selectedShiftId ? null : shift.id)}
                  className={`text-left text-xs leading-relaxed hover:text-[#1c1c1c] ${
                    shift.id === selectedShiftId ? "font-medium text-[#1c1c1c]" : "text-[#1c1c1c]/70"
                  }`}
                >
                  {shift.event}
                  {formatDate(shift.event_date) && <span className="text-[#1c1c1c]/45"> — {formatDate(shift.event_date)}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
