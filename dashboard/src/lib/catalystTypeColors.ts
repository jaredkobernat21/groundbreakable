import type { Catalyst, CatalystStatus, CatalystType } from "@/lib/types";

// Institutional redesign (Jared, 2026-09-30): "richer, muted tones... use
// as accents, not dominant fills." No CatalystType distinguishes
// transportation from general infrastructure (I-49 corridor, I-70
// interchange, PSO transmission lines, and sewer/water projects all share
// `infrastructure_project`) -- confirmed with Jared to keep these one
// emerald color rather than adding a schema value and retroactively
// reclassifying the ~80 catalysts already logged. incentive_district/
// annexation_rezoning DO already exist as distinct types though, so they
// get their own "Government / Incentives" group for free -- previously
// lumped into the generic "other" bucket. major_employer/mixed_use_anchor/
// industrial_logistics/other remain the honest neutral catch-all.
export type CatalystColorGroup = "infrastructure" | "data_center" | "schools_civic" | "housing" | "government_incentives" | "other";

export const CATALYST_TYPE_COLOR_GROUP: Record<CatalystType, CatalystColorGroup> = {
  infrastructure_project: "infrastructure",
  data_center: "data_center",
  potential_data_center: "data_center",
  institutional: "schools_civic",
  public_facility: "schools_civic",
  housing_development: "housing",
  incentive_district: "government_incentives",
  annexation_rezoning: "government_incentives",
  major_employer: "other",
  mixed_use_anchor: "other",
  industrial_logistics: "other",
  other: "other",
};

// Hand-picked deep/desaturated jewel tones rather than raw Tailwind
// defaults -- the brief explicitly asked for "muted," "restrained,"
// institutional color, not bright SaaS accent colors.
export const CATALYST_COLOR_GROUP_HEX: Record<CatalystColorGroup, string> = {
  infrastructure: "#3E7B5F", // deep muted emerald
  data_center: "#6B4C8A", // deep violet / plum
  schools_civic: "#B8863B", // warm muted amber
  housing: "#5A72A0", // slate blue
  government_incentives: "#3F7A78", // muted teal
  other: "#7A7E87", // quiet neutral gray -- not one of the named categories, an honest catch-all
};

export const CATALYST_COLOR_GROUP_LABEL: Record<CatalystColorGroup, string> = {
  infrastructure: "Infrastructure",
  data_center: "Data Centers",
  schools_civic: "Schools / Institutions",
  housing: "Housing",
  government_incentives: "Government / Incentives",
  other: "Other",
};

export function catalystColorGroup(catalyst: Pick<Catalyst, "catalyst_type">): CatalystColorGroup {
  return CATALYST_TYPE_COLOR_GROUP[catalyst.catalyst_type];
}

export function catalystColorHex(catalyst: Pick<Catalyst, "catalyst_type">): string {
  return CATALYST_COLOR_GROUP_HEX[catalystColorGroup(catalyst)];
}

// Marker size = potential geographic impact. catalyst_score (lib/catalysts/
// score.ts, max ~10 given its own weight table) is the primary signal;
// estimated_value is the fallback for the -- currently common -- case of a
// catalyst nobody has scored yet, so an unscored $200M project doesn't
// render identically to an unscored $2M one.
export type CatalystSizeTier = "small" | "medium" | "large";

export function catalystSizeTier(catalyst: Pick<Catalyst, "catalyst_score" | "estimated_value">): CatalystSizeTier {
  if (catalyst.catalyst_score != null) {
    if (catalyst.catalyst_score >= 7) return "large";
    if (catalyst.catalyst_score >= 4) return "medium";
    return "small";
  }
  if (catalyst.estimated_value != null) {
    if (catalyst.estimated_value >= 50_000_000) return "large";
    if (catalyst.estimated_value >= 5_000_000) return "medium";
  }
  return "small";
}

export const CATALYST_SIZE_TIER_PX: Record<CatalystSizeTier, number> = {
  small: 14,
  medium: 20,
  large: 28,
};

// Impact Radius filter (institutional redesign, 2026-09-30) -- buckets
// influence_radius_meters into the same Local/Submarket/Regional framing
// the marker-size legend already uses, so "impact" reads consistently
// whether a viewer is looking at marker size or filtering by it.
export type ImpactRadiusTier = "local" | "submarket" | "regional";

export function catalystImpactRadiusTier(catalyst: Pick<Catalyst, "influence_radius_meters">): ImpactRadiusTier {
  if (catalyst.influence_radius_meters >= 8000) return "regional";
  if (catalyst.influence_radius_meters >= 1600) return "submarket";
  return "local";
}

export const IMPACT_RADIUS_TIER_LABEL: Record<ImpactRadiusTier, string> = {
  local: "Local",
  submarket: "Submarket",
  regional: "Regional",
};

// Stage filter (Jared's spec: Proposed/Approved/Funded/Under Construction/
// Completed) grouping the 12-value pre-permit pipeline (types.ts
// CatalystStatus) into 5 display buckets. `cancelled` deliberately has no
// bucket -- excluded from the default filtered view, shown only if a future
// UI explicitly opts into it, consistent with the "detect-before-permits"
// philosophy already stated in the Catalysts migration's own comments.
export type CatalystStageGroup = "proposed" | "approved" | "funded" | "under_construction" | "completed";

export const CATALYST_STAGE_GROUP: Partial<Record<CatalystStatus, CatalystStageGroup>> = {
  rumored: "proposed",
  under_study: "proposed",
  site_selection: "proposed",
  approved: "approved",
  funding_incentives: "funded",
  land_acquired: "funded",
  construction_pending: "under_construction",
  under_construction: "under_construction",
  operating: "completed",
  completed: "completed",
  // planning_entitlement and cancelled are intentionally omitted --
  // planning_entitlement doesn't cleanly fit Jared's 5-bucket list (it's
  // past "proposed" but not yet "approved"); grouped with "proposed" here
  // since that's the closer neighbor and keeps every non-cancelled stage
  // visible in the default filter.
  planning_entitlement: "proposed",
};

export const CATALYST_STAGE_GROUP_LABEL: Record<CatalystStageGroup, string> = {
  proposed: "Proposed",
  approved: "Approved",
  funded: "Funded",
  under_construction: "Under Construction",
  completed: "Completed",
};
