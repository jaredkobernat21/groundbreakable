import type { SupabaseClient } from "@supabase/supabase-js";
import { getDevelopmentFrictionSignals } from "@/lib/queries/developmentFriction";
import { getEntitlementApprovalTypes, getEntitlementCaseDetail } from "@/lib/queries/entitlementCases";
import { findEntitlementPrecedent, type EntitlementPrecedentCriteria } from "@/lib/entitlement/precedent";

// Entitlement Reality Score (spec §9): a 0-100 decision-support index, NOT
// a probability of approval. Every point awarded traces to real evidence
// (existing entitlement_cases/entitlement_approval_types/development_
// friction_signals rows) -- where evidence is currently too thin to
// support a component, that component gets a neutral half-credit and an
// entry in missingInformation, never a fabricated confident score.
//
// With only a handful of Lawrence cases on file today (see the 2026-09-16
// backfill), most components will read "low" confidence and lean on their
// neutral default -- that's the correct, honest behavior. This scaffold
// gets more decisive as entitlement_cases grows toward the spec's ~50-case
// target, without any change to this scoring logic.

export type EntitlementRealityScoreInput = EntitlementPrecedentCriteria & {
  approvalTypeKey?: string | null;
  // Set this to the case's own id when scoring an existing entitlement_
  // cases row using its own fields as the query -- otherwise the case
  // matches itself as "precedent" with perfect similarity, inflating
  // every precedent-derived component.
  excludeCaseId?: string;
};

export type EntitlementRealityScoreComponent = {
  key: string;
  label: string;
  maxPoints: number;
  points: number;
  evidence: string[];
};

export type EntitlementRealityScoreResult = {
  score: number;
  confidence: "low" | "medium" | "high";
  components: EntitlementRealityScoreComponent[];
  missingInformation: string[];
};

const APPROVAL_PATH_POINTS: Record<string, number> = {
  by_right: 20,
  administrative: 16,
  discretionary: 10,
  rezoning: 8,
  other: 5,
};

function includesAny(text: string, keywords: string[]): boolean {
  // Word-boundary match, not substring -- a plain .includes("road") would
  // false-positive on "Queens Road" and misclassify an unrelated signal.
  return keywords.some((k) => new RegExp(`\\b${k}\\b`, "i").test(text));
}

export async function computeEntitlementRealityScore(
  supabase: SupabaseClient,
  marketId: string,
  input: EntitlementRealityScoreInput
): Promise<EntitlementRealityScoreResult> {
  const components: EntitlementRealityScoreComponent[] = [];
  const missingInformation: string[] = [];

  // 1. Approval path (20)
  const approvalTypes = await getEntitlementApprovalTypes(supabase, marketId);
  const approvalType = input.approvalTypeKey ? approvalTypes.find((t) => t.key === input.approvalTypeKey) : null;
  if (approvalType) {
    components.push({
      key: "approval_path",
      label: "Approval Path",
      maxPoints: 20,
      points: APPROVAL_PATH_POINTS[approvalType.approval_path] ?? 10,
      evidence: [`${approvalType.label}: ${approvalType.approval_path}, approved by ${approvalType.approving_authority}${approvalType.recommending_authority ? `, recommended by ${approvalType.recommending_authority}` : ""}.`],
    });
  } else {
    components.push({ key: "approval_path", label: "Approval Path", maxPoints: 20, points: 10, evidence: [] });
    missingInformation.push("No approval type specified -- pass approvalTypeKey to score against Lawrence's actual process map (entitlement_approval_types).");
  }

  // 2. Comprehensive-plan alignment (15) -- not yet wired to the zoning_land_use
  // future_land_use GIS overlay; neutral half-credit until that spatial check exists.
  components.push({ key: "plan_alignment", label: "Comprehensive-Plan Alignment", maxPoints: 15, points: 7.5, evidence: [] });
  missingInformation.push("Comprehensive-plan alignment is not yet computed from the zoning_land_use future_land_use GIS layer -- this component is a neutral placeholder.");

  // 3. Comparable precedent (15)
  const precedent = await findEntitlementPrecedent(supabase, marketId, input, { limit: 5, excludeCaseId: input.excludeCaseId });
  if (precedent.length > 0) {
    const avgSimilarity = precedent.reduce((sum, p) => sum + p.similarity, 0) / precedent.length;
    components.push({
      key: "comparable_precedent",
      label: "Comparable Precedent",
      maxPoints: 15,
      points: Math.round(15 * avgSimilarity * 10) / 10,
      evidence: precedent.slice(0, 3).map((p) => `${p.case.case_number ?? p.case.address ?? p.case.id} (similarity ${(p.similarity * 100).toFixed(0)}%)`),
    });
  } else {
    components.push({ key: "comparable_precedent", label: "Comparable Precedent", maxPoints: 15, points: 0, evidence: [] });
    missingInformation.push("No comparable entitlement_cases found for this scenario -- precedent evidence is empty.");
  }

  // 4. Staff precedent (10) -- how often staff_recommendation on comparable
  // cases reads as approval-leaning.
  const withStaffRec = precedent.filter((p) => p.case.staff_recommendation);
  if (withStaffRec.length > 0) {
    const approvalLeaning = withStaffRec.filter((p) => includesAny(p.case.staff_recommendation!, ["approv"])).length;
    components.push({
      key: "staff_precedent",
      label: "Staff History",
      maxPoints: 10,
      points: Math.round((10 * approvalLeaning) / withStaffRec.length * 10) / 10,
      evidence: [`${approvalLeaning} of ${withStaffRec.length} comparable cases with a recorded staff recommendation leaned toward approval.`],
    });
  } else {
    components.push({ key: "staff_precedent", label: "Staff History", maxPoints: 10, points: 5, evidence: [] });
    missingInformation.push("No comparable case has a recorded staff_recommendation yet -- staff-history component is a neutral placeholder.");
  }

  // 5 & 6. Infrastructure readiness / transportation constraints (10 each) --
  // scan development_friction_signals for risk-kind rows whose text
  // mentions the relevant keywords.
  const friction = await getDevelopmentFrictionSignals(supabase, marketId);
  const riskSignals = friction.filter((f) => f.kind === "risk");

  const infraSignals = riskSignals.filter((f) => includesAny(`${f.title} ${f.summary}`, ["sewer", "utility", "utilities", "water", "infrastructure", "stormwater"]));
  if (infraSignals.length > 0) {
    const highSeverity = infraSignals.filter((f) => f.severity === "high").length;
    components.push({
      key: "infrastructure_readiness",
      label: "Infrastructure Readiness",
      maxPoints: 10,
      points: highSeverity > 0 ? 3 : 6,
      evidence: infraSignals.map((f) => f.title),
    });
  } else {
    components.push({ key: "infrastructure_readiness", label: "Infrastructure Readiness", maxPoints: 10, points: 8, evidence: [] });
    missingInformation.push("No infrastructure-flavored friction signal found for this market -- treated as no known constraint, not confirmed readiness.");
  }

  // Deliberately excludes generic terms like "road"/"trafficway" -- Kansas
  // road and place names ("South Lawrence Trafficway") collide with them
  // constantly as geographic locators, not actual transportation concerns.
  const transitSignals = riskSignals.filter((f) => includesAny(`${f.title} ${f.summary}`, ["traffic", "transportation", "transit"]));
  if (transitSignals.length > 0) {
    const highSeverity = transitSignals.filter((f) => f.severity === "high").length;
    components.push({
      key: "transportation_constraints",
      label: "Transportation Constraints",
      maxPoints: 10,
      points: highSeverity > 0 ? 3 : 6,
      evidence: transitSignals.map((f) => f.title),
    });
  } else {
    components.push({ key: "transportation_constraints", label: "Transportation Constraints", maxPoints: 10, points: 8, evidence: [] });
    missingInformation.push("No transportation-flavored friction signal found for this market -- treated as no known constraint, not confirmed readiness.");
  }

  // 7. Historical entitlement friction (10) -- how often comparable cases
  // required a requested-vs-approved change.
  const precedentDetails = await Promise.all(precedent.map((p) => getEntitlementCaseDetail(supabase, p.case.id)));
  const withChangeData = precedentDetails.filter((d) => d.data);
  if (withChangeData.length > 0) {
    const changedCount = withChangeData.filter((d) => (d.data!.changes?.length ?? 0) > 0).length;
    components.push({
      key: "historical_friction",
      label: "Historical Entitlement Friction",
      maxPoints: 10,
      points: Math.round((10 * (withChangeData.length - changedCount)) / withChangeData.length * 10) / 10,
      evidence: [`${changedCount} of ${withChangeData.length} comparable cases required at least one recorded requested-vs-approved change.`],
    });
  } else {
    components.push({ key: "historical_friction", label: "Historical Entitlement Friction", maxPoints: 10, points: 5, evidence: [] });
    missingInformation.push("No comparable case has recorded change data yet -- historical-friction component is a neutral placeholder.");
  }

  // 8. Timeline predictability (10) -- variance of days_to_decision among
  // comparable cases that actually have both an application_date and a
  // final_decision_date on file.
  const timedCases = precedent.map((p) => p.case.days_to_decision).filter((d): d is number => d != null);
  if (timedCases.length >= 2) {
    const mean = timedCases.reduce((s, d) => s + d, 0) / timedCases.length;
    const variance = timedCases.reduce((s, d) => s + (d - mean) ** 2, 0) / timedCases.length;
    const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1;
    components.push({
      key: "timeline_predictability",
      label: "Timeline Predictability",
      maxPoints: 10,
      points: Math.round(10 * Math.max(0, 1 - coefficientOfVariation) * 10) / 10,
      evidence: [`${timedCases.length} comparable cases with a known elapsed time, averaging ${Math.round(mean)} days.`],
    });
  } else {
    components.push({ key: "timeline_predictability", label: "Timeline Predictability", maxPoints: 10, points: 5, evidence: [] });
    missingInformation.push("Fewer than 2 comparable cases have both an application_date and a final_decision_date on file -- timeline predictability can't be calculated yet.");
  }

  const score = Math.round(components.reduce((sum, c) => sum + c.points, 0));
  const dataPoints = precedent.length + (approvalType ? 1 : 0) + timedCases.length;
  const confidence: EntitlementRealityScoreResult["confidence"] = dataPoints >= 8 ? "high" : dataPoints >= 3 ? "medium" : "low";

  return { score, confidence, components, missingInformation };
}
