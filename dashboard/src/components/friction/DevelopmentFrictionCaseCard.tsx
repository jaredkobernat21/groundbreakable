import type { DevelopmentFrictionCaseWithSource } from "@/lib/types";
import { FRICTION_CASE_OUTCOME_COLOR, FRICTION_CASE_OUTCOME_LABEL, FRICTION_TYPE_LABEL, PROJECT_TYPE_LABEL } from "@/lib/types";
import { SHIFT_IMPACT_COLOR, SHIFT_IMPACT_LABEL } from "@/lib/shiftConstants";
import { formatCurrency, formatDate } from "@/lib/format";

// Impact sub-fields are each nullable/empty (only ever captured "when
// documented", per spec) -- this renders only the ones actually on file
// rather than a fixed row of blanks.
function ImpactChips({ frictionCase }: { frictionCase: DevelopmentFrictionCaseWithSource }) {
  const chips: string[] = [];
  if (frictionCase.impact_units_lost != null) chips.push(`${frictionCase.impact_units_lost} units lost`);
  if (frictionCase.impact_density_reduction) chips.push(frictionCase.impact_density_reduction);
  if (frictionCase.impact_time_delay) chips.push(`${frictionCase.impact_time_delay} delay`);
  if (frictionCase.impact_added_cost_usd != null) chips.push(`+${formatCurrency(frictionCase.impact_added_cost_usd)} added cost`);
  if (frictionCase.impact_project_failed) chips.push("Project failed");
  for (const condition of frictionCase.impact_added_conditions) chips.push(condition);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip, i) => (
        <span key={i} className="rounded-full bg-[#1c1c1c]/5 px-2 py-0.5 text-[11px] text-[#1c1c1c]/70">
          {chip}
        </span>
      ))}
    </div>
  );
}

// Extends DevelopmentFrictionCard/EntitlementCaseCard's card anatomy
// (title+badge header, summary body, confidence+source footer) into 5
// clearly labeled sections for the Original Plan -> Friction -> Response
// -> Outcome -> Insight framework.
export default function DevelopmentFrictionCaseCard({ frictionCase }: { frictionCase: DevelopmentFrictionCaseWithSource }) {
  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-snug text-[#1c1c1c]">{frictionCase.project_name}</p>
          <p className="mt-0.5 truncate text-xs text-[#1c1c1c]/50">
            {frictionCase.market.name}, {frictionCase.market.state}
            {frictionCase.address ? ` · ${frictionCase.address}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
            style={{ backgroundColor: FRICTION_CASE_OUTCOME_COLOR[frictionCase.outcome] }}
          >
            {FRICTION_CASE_OUTCOME_LABEL[frictionCase.outcome]}
          </span>
          {frictionCase.severity && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
              style={{ backgroundColor: SHIFT_IMPACT_COLOR[frictionCase.severity] }}
            >
              {SHIFT_IMPACT_LABEL[frictionCase.severity]}
            </span>
          )}
        </div>
      </div>

      <p className="mt-1 text-xs text-[#1c1c1c]/50">
        {frictionCase.developer_name}
        {frictionCase.project_type ? `${frictionCase.developer_name ? " · " : ""}${PROJECT_TYPE_LABEL[frictionCase.project_type]}` : ""}
        {` · ${FRICTION_TYPE_LABEL[frictionCase.friction_type]}`}
      </p>

      <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#1c1c1c]/70">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">Original Plan</p>
          <p>{frictionCase.original_plan_summary}</p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">Friction</p>
          {frictionCase.concerns.map((concern, i) => (
            <p key={i}>{concern}</p>
          ))}
          {frictionCase.decision_makers.length > 0 && (
            <p className="mt-0.5 text-xs text-[#1c1c1c]/50">Decision-makers: {frictionCase.decision_makers.join(", ")}</p>
          )}
        </div>

        {frictionCase.response_summary && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">Response</p>
            <p>{frictionCase.response_summary}</p>
          </div>
        )}

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">Outcome</p>
          <p>{frictionCase.final_plan_summary ?? "Not yet known."}</p>
          <div className="mt-1">
            <ImpactChips frictionCase={frictionCase} />
          </div>
        </div>

        {frictionCase.ai_insight && (
          <div className="rounded-lg bg-[#1c1c1c]/[0.03] p-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">Insight</p>
            <p>{frictionCase.ai_insight}</p>
          </div>
        )}
      </div>

      {frictionCase.timeline_events.length > 0 && (
        <div className="mt-3 border-t border-[#1c1c1c]/10 pt-2">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#1c1c1c]/40">Timeline</p>
          <div className="space-y-1">
            {[...frictionCase.timeline_events]
              .sort((a, b) => a.event_date.localeCompare(b.event_date))
              .map((event) => (
                <p key={event.id} className="text-xs text-[#1c1c1c]/60">
                  <span className="font-medium text-[#1c1c1c]/80">{formatDate(event.event_date)}</span> — {event.description}
                </p>
              ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#1c1c1c]/10 pt-2 text-[10px] text-[#1c1c1c]/40">
        <span>
          {frictionCase.confidence === "verified" ? "Verified" : frictionCase.confidence === "reported" ? "Reported" : "Unconfirmed"}
        </span>
        {frictionCase.source && (
          <a
            href={frictionCase.source.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 truncate underline decoration-[#1c1c1c]/30 underline-offset-2 hover:decoration-[#1c1c1c]"
          >
            {frictionCase.source.agency}
          </a>
        )}
      </div>
    </div>
  );
}
