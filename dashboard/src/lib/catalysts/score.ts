import type { CatalystType } from "@/lib/types";

// Catalyst Score (docs/DATA_INTELLIGENCE_PIPELINE.md §6.6/§9): same
// explainable-component shape as computeEntitlementRealityScore
// (lib/entitlement/score.ts) -- never an opaque number. Computed at
// admin-entry time as a pre-filled, editable suggestion (same
// human-curated-decision-with-a-computed-starting-point convention as
// is_spotlight), not a fully automated classifier.
//
// Scored only against fields that actually exist on a catalyst today --
// no jobs_created/geographic_scope columns exist, so those parts of Jared's
// original weighting (docs §9) are approximated from the closest real
// field (estimated_value for investment scale, influence_radius_meters/
// boundary for regional reach, related_context length for reinforcing
// signals) rather than invented as new required fields.

export type CatalystScoreInput = {
  catalyst_type: CatalystType;
  estimated_value: number | null;
  influence_radius_meters: number;
  boundary: unknown;
  related_context: string[];
  signal_categories: string[];
};

export type CatalystScoreComponent = {
  key: string;
  label: string;
  maxPoints: number;
  points: number;
  evidence: string[];
};

export type CatalystScoreResult = {
  score: number;
  confidence: "low" | "medium" | "high";
  components: CatalystScoreComponent[];
  missingInformation: string[];
};

// Highest-weight catalyst types per Jared's "Suggested Weighting" --
// unexplained large power load, major employer, data-center-scale industrial.
const HIGH_IMPACT_TYPES: CatalystType[] = ["major_employer", "data_center", "potential_data_center", "industrial_logistics"];
// Medium weight per the same list: rezoning/annexation/infrastructure-adjacent.
const MEDIUM_IMPACT_TYPES: CatalystType[] = ["infrastructure_project", "annexation_rezoning", "incentive_district"];

export function computeCatalystScore(input: CatalystScoreInput): CatalystScoreResult {
  const components: CatalystScoreComponent[] = [];
  const missingInformation: string[] = [];

  // 1. Catalyst type weight (max 3)
  if (HIGH_IMPACT_TYPES.includes(input.catalyst_type)) {
    components.push({ key: "type_weight", label: "Catalyst Type", maxPoints: 3, points: 3, evidence: [`${input.catalyst_type} is a high-impact type (major employer / data center / industrial-logistics scale).`] });
  } else if (MEDIUM_IMPACT_TYPES.includes(input.catalyst_type)) {
    components.push({ key: "type_weight", label: "Catalyst Type", maxPoints: 3, points: 2, evidence: [`${input.catalyst_type} is a medium-impact type.`] });
  } else {
    components.push({ key: "type_weight", label: "Catalyst Type", maxPoints: 3, points: 1, evidence: [] });
  }

  // 2. Investment scale (max 3) -- $100M+ is Jared's stated threshold; this
  // is a fixed constant here rather than per-market config, matching doc
  // §9's note that this should eventually be configurable per market size.
  if (input.estimated_value != null && input.estimated_value >= 100_000_000) {
    components.push({ key: "investment_scale", label: "Investment Scale", maxPoints: 3, points: 3, evidence: [`Estimated value $${input.estimated_value.toLocaleString()} clears the $100M catalyst-scale threshold.`] });
  } else if (input.estimated_value != null && input.estimated_value >= 10_000_000) {
    components.push({ key: "investment_scale", label: "Investment Scale", maxPoints: 3, points: 1, evidence: [`Estimated value $${input.estimated_value.toLocaleString()}.`] });
  } else {
    components.push({ key: "investment_scale", label: "Investment Scale", maxPoints: 3, points: 0, evidence: [] });
    missingInformation.push("No estimated_value on file, or below $10M -- investment-scale component defaulted to 0, not assumed.");
  }

  // 3. Reinforcing signals (max 2) -- number of distinct cited context
  // bullets (related_context) or, for a potential-data-center catalyst,
  // distinct signal categories -- either way, "how much independent
  // evidence backs this" per Jared's compound-signal philosophy.
  const reinforcingCount = Math.max(input.related_context.length, input.signal_categories.length);
  if (reinforcingCount >= 3) {
    components.push({ key: "reinforcing_signals", label: "Reinforcing Signals", maxPoints: 2, points: 2, evidence: [`${reinforcingCount} independent cited signals/context items.`] });
  } else if (reinforcingCount >= 1) {
    components.push({ key: "reinforcing_signals", label: "Reinforcing Signals", maxPoints: 2, points: 1, evidence: [`${reinforcingCount} cited signal/context item.`] });
  } else {
    components.push({ key: "reinforcing_signals", label: "Reinforcing Signals", maxPoints: 2, points: 0, evidence: [] });
    missingInformation.push("No related_context bullets or signal_categories recorded -- reinforcing-signal component defaulted to 0.");
  }

  // 4. Regional reach (max 2) -- an admin-traced boundary or a wide watch
  // radius is the closest real-field proxy for Jared's "regional-scale
  // (geographic_scope = citywide)" component; no geographic_scope column
  // exists on catalysts today.
  if (input.boundary != null) {
    components.push({ key: "regional_reach", label: "Regional Reach", maxPoints: 2, points: 2, evidence: ["Traced watch-zone boundary on file (not a generic radius circle)."] });
  } else if (input.influence_radius_meters >= 3218) {
    components.push({ key: "regional_reach", label: "Regional Reach", maxPoints: 2, points: 1, evidence: [`Influence radius ${(input.influence_radius_meters / 1609.34).toFixed(1)} mi.`] });
  } else {
    components.push({ key: "regional_reach", label: "Regional Reach", maxPoints: 2, points: 0, evidence: [] });
  }

  const score = Math.round(components.reduce((sum, c) => sum + c.points, 0));
  const populatedComponents = components.filter((c) => c.evidence.length > 0).length;
  const confidence: CatalystScoreResult["confidence"] = populatedComponents >= 3 ? "high" : populatedComponents >= 2 ? "medium" : "low";

  return { score, confidence, components, missingInformation };
}
