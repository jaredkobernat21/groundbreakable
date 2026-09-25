import type { DevelopmentFrictionCaseWithSource, DevelopmentOpportunityWithSources } from "./types";
import { FRICTION_CASE_OUTCOME_LABEL } from "./types";

// Outcomes where a real project stopped moving forward -- the site itself
// is still sitting there, unbuilt, which is exactly Jared's "stalled or
// abandoned development sites" Opportunity type. "delayed"/"modified"/
// "resolved"/"pending" cases are still live processes, not yet a site a
// developer could step into -- those stay as friction context on the
// related Plan's detail panel instead (see PlanDetailPanel).
const STALLED_OUTCOMES = new Set(["denied", "withdrawn", "abandoned"]);

// Live rule engine for turning a stopped development_friction_cases row
// into a site Opportunity -- returns opportunities shaped like
// DevelopmentOpportunityWithSources so they render through the existing
// Opportunity map/feed/detail panel unchanged. Replaces the old
// computeProjectOpportunities (Builder/Contractor "no GC yet" leads,
// dropped 2026-09-25 -- a different audience than "sites a developer
// could act on").
export function computeFrictionOpportunities(
  frictionCases: DevelopmentFrictionCaseWithSource[]
): DevelopmentOpportunityWithSources[] {
  const results: DevelopmentOpportunityWithSources[] = [];

  for (const frictionCase of frictionCases) {
    if (!STALLED_OUTCOMES.has(frictionCase.outcome)) continue;
    if (frictionCase.latitude == null || frictionCase.longitude == null) continue;

    const strength = frictionCase.severity === "high" ? "high" : frictionCase.severity === "medium" ? "medium" : "low";

    const reasons = [
      `Original plan: ${frictionCase.original_plan_summary}`,
      frictionCase.final_plan_summary ?? `Outcome: ${FRICTION_CASE_OUTCOME_LABEL[frictionCase.outcome]}.`,
      frictionCase.impact_project_failed ? "The project failed to move forward -- the site remains undeveloped." : null,
    ].filter((r): r is string => r != null);

    results.push({
      id: `friction-opportunity-${frictionCase.id}`,
      market_id: frictionCase.market_id,
      address: frictionCase.address ?? frictionCase.project_name,
      latitude: frictionCase.latitude,
      longitude: frictionCase.longitude,
      opportunity_type: "Stalled/Abandoned Site",
      strength,
      category: "distress",
      opportunity_group: "development",
      status: `${FRICTION_CASE_OUTCOME_LABEL[frictionCase.outcome]} -- previously proposed by ${frictionCase.developer_name ?? "an unnamed developer"}`,
      related_developer: frictionCase.developer_name,
      related_contractor: null,
      signals: ["stalled_project"],
      reasons,
      source_ids: frictionCase.source_id ? [frictionCase.source_id] : [],
      date_identified: frictionCase.created_at,
      created_at: frictionCase.created_at,
      sources: frictionCase.source ? [frictionCase.source] : [],
    });
  }

  return results;
}
