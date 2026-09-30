import type { Catalyst, CatalystStatus, CatalystType } from "@/lib/types";

// National map redesign (Jared, 2026-09-30): "use color primarily to
// identify the type of development activity... intentionally limited and
// visually clean." 11 CatalystType values don't map 1:1 onto the 4 colors
// Jared specified -- 6 types genuinely have no honest home in
// infrastructure/data-center/schools/housing yet (industrial_logistics is
// explicitly one of his own "may add later" categories). Rather than
// force-fit one of those into an unrelated color, they get a 5th neutral
// "Other" bucket, called out to Jared directly rather than silently
// mis-colored.
export type CatalystColorGroup = "infrastructure" | "data_center" | "schools_civic" | "housing" | "other";

export const CATALYST_TYPE_COLOR_GROUP: Record<CatalystType, CatalystColorGroup> = {
  infrastructure_project: "infrastructure",
  data_center: "data_center",
  potential_data_center: "data_center",
  institutional: "schools_civic",
  public_facility: "schools_civic",
  housing_development: "housing",
  major_employer: "other",
  mixed_use_anchor: "other",
  industrial_logistics: "other",
  incentive_district: "other",
  annexation_rezoning: "other",
  other: "other",
};

export const CATALYST_COLOR_GROUP_HEX: Record<CatalystColorGroup, string> = {
  infrastructure: "#22c55e", // green
  data_center: "#a855f7", // purple
  schools_civic: "#eab308", // yellow
  housing: "#3b82f6", // blue
  other: "#94a3b8", // neutral gray -- not one of "the 4 categories," an honest catch-all
};

export const CATALYST_COLOR_GROUP_LABEL: Record<CatalystColorGroup, string> = {
  infrastructure: "Infrastructure",
  data_center: "Data Centers",
  schools_civic: "Schools / Civic",
  housing: "Housing",
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
