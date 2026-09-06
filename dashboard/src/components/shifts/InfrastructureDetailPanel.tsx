import type { GrowthArea, ProjectWithSource, ShiftWithSource } from "@/lib/types";
import { SHIFT_IMPACT_COLOR, SHIFT_IMPACT_LABEL } from "@/lib/shiftConstants";
import {
  INFRASTRUCTURE_TYPE_COLOR,
  INFRASTRUCTURE_TYPE_LABEL,
  extractInfrastructureCost,
  extractInfrastructureField,
  inferInfrastructureType,
} from "@/lib/infrastructureConstants";
import { formatCurrency, formatDate } from "@/lib/format";

// Same right-anchored overlay convention as ShiftDetailPanel/
// OpportunityDetailPanel, but adds the fields the Development
// Intelligence spec asks for that ShiftDetailPanel doesn't carry:
// estimated cost, contractor/funding source (opportunistically pulled
// from raw_data -- see infrastructureConstants.ts for why these are
// "Not available" rather than fabricated when a source didn't report
// them), and a Development Impact line computed from the same Momentum
// Area polygon test the Momentum/Opportunities views already use --
// never a fabricated conclusion, just whatever the geography actually
// shows.
export default function InfrastructureDetailPanel({
  shift,
  momentumBreakdown,
  onClose,
}: {
  shift: ShiftWithSource;
  momentumBreakdown: { area: GrowthArea; projects: ProjectWithSource[] } | null;
  onClose: () => void;
}) {
  const type = inferInfrastructureType(shift.shift_type);
  const color = INFRASTRUCTURE_TYPE_COLOR[type];
  const cost = extractInfrastructureCost(shift.raw_data);
  const contractor = extractInfrastructureField(shift.raw_data, "contractor");
  const funder = extractInfrastructureField(shift.raw_data, "funder") ?? extractInfrastructureField(shift.raw_data, "funding_source");
  const projectId = extractInfrastructureField(shift.raw_data, "project_id");
  const started = extractInfrastructureField(shift.raw_data, "started");

  return (
    <div className="absolute right-3 top-16 bottom-3 z-30 w-[340px] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:top-3">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-white/40 hover:text-white">
        ✕
      </button>

      <div
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
        style={{ borderColor: `${color}55`, color }}
      >
        {INFRASTRUCTURE_TYPE_LABEL[type]}
      </div>

      <h2 className="mb-1 text-base font-semibold leading-snug text-white">{shift.event}</h2>
      {shift.address && <p className="mb-4 text-sm text-white/50">{shift.address}</p>}
      {shift.description && <p className="mb-4 text-sm text-white/70">{shift.description}</p>}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Reported</dt>
          <dd className="text-white">{formatDate(shift.event_date) ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Status</dt>
          <dd className="text-white">{shift.stage ?? "Not available"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Estimated Cost</dt>
          <dd className="text-white">{cost != null ? formatCurrency(cost) : "Not available"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Agency</dt>
          <dd className="text-white">{shift.source?.agency ?? "Not available"}</dd>
        </div>
        {started && (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Started</dt>
            <dd className="text-white">{formatDate(started) ?? started}</dd>
          </div>
        )}
        {contractor && (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Contractor</dt>
            <dd className="text-white">{contractor}</dd>
          </div>
        )}
        {funder && (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Funding Source</dt>
            <dd className="text-white">{funder}</dd>
          </div>
        )}
        {projectId && (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-white/35">Project #</dt>
            <dd className="text-white">{projectId}</dd>
          </div>
        )}
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-white/35">Impact</dt>
          <dd style={{ color: SHIFT_IMPACT_COLOR[shift.impact] }}>{SHIFT_IMPACT_LABEL[shift.impact]}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Development Impact</p>
        <p className="text-sm text-white/70">
          {momentumBreakdown
            ? `Sits inside the ${momentumBreakdown.area.name} momentum area, alongside ${momentumBreakdown.projects.length} tracked project${
                momentumBreakdown.projects.length === 1 ? "" : "s"
              } nearby.`
            : "Not currently mapped to a tracked momentum area — no nearby-development relationship to report."}
        </p>
      </div>

      {shift.source && (
        <a
          href={shift.source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block border-t border-white/10 pt-4 text-xs text-white/45 hover:text-white/80"
        >
          Source: {shift.source.agency}
          {shift.source.title ? ` — ${shift.source.title}` : ""} ↗
        </a>
      )}
    </div>
  );
}
