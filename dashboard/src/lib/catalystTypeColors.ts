import type { Catalyst, CatalystStatus, CatalystType } from "@/lib/types";
import type { CatalystIconKey, CatalystMarkerTier } from "@/lib/markerIcons";
import { computeDcStage } from "@/lib/catalysts/dcStage";

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

// Softened from Tailwind-default hexes (Jared, 2026-10-01): the original
// green/purple/yellow/blue read as bright/neon against the dark map for a
// product meant to feel like premium development intelligence. Same hues,
// desaturated and deepened -- still clearly distinct from each other at a
// glance, just restrained instead of saturated.
export const CATALYST_COLOR_GROUP_HEX: Record<CatalystColorGroup, string> = {
  infrastructure: "#3f8f63", // muted emerald
  data_center: "#8b6bb0", // muted plum/violet
  schools_civic: "#c9a227", // muted amber/gold
  housing: "#5b80a8", // muted slate blue
  other: "#8b93a3", // quiet neutral gray
};

// Data Center Refocus (2026-10-01): this grouping now drives the map's
// *secondary* "Supporting Layers" filter (FiltersPanel.tsx) rather than a
// primary peer-category legend -- lib/catalysts/dcStage.ts's Possible/
// Predicted/Planned model is primary. data_center is kept here only because
// catalystColorHex/catalystIconKey below are still called for every
// catalyst regardless of DC stage (a supporting, non-DC catalyst still
// needs a color/icon); the DC-stage components never read this label for a
// staged catalyst.
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

// Marker glyph per color group (Jared, 2026-10-01): "keep the coloring, but
// change the icons." One glyph per group, not per catalyst_type -- types
// sharing a color (e.g. institutional/public_facility both "schools_civic")
// share the same icon too.
export const CATALYST_COLOR_GROUP_ICON: Record<CatalystColorGroup, CatalystIconKey> = {
  data_center: "bolt",
  infrastructure: "road",
  schools_civic: "courthouse",
  housing: "house",
  other: "crane",
};

export function catalystIconKey(catalyst: Pick<Catalyst, "catalyst_type">): CatalystIconKey {
  return CATALYST_COLOR_GROUP_ICON[catalystColorGroup(catalyst)];
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

// Sized up across the board (2026-10-01): the marker is now an outlined
// container holding a glyph rather than a solid dot, so it needs more room
// to stay crisp -- a 14px outlined square with a glyph inside is mush. The
// spread between tiers is deliberately modest because size alone is a weak
// hierarchy signal at map scale; `catalystMarkerTier` below carries the
// real "this one is major" weight via the corner-bracket reticle.
export const CATALYST_SIZE_TIER_PX: Record<CatalystSizeTier, number> = {
  small: 22,
  medium: 26,
  large: 32,
};

// Two-step visual hierarchy on top of the three-step size scale: only the
// top tier gets the bracketed "major" treatment, so a scan of the map
// separates the handful of genuinely large catalysts from everything else
// without having to compare marker diameters against each other.
export function catalystMarkerTier(
  catalyst: Pick<Catalyst, "catalyst_score" | "estimated_value">
): CatalystMarkerTier {
  return catalystSizeTier(catalyst) === "large" ? "major" : "standard";
}

// Declutter priority: when two markers would overlap on screen, the higher
// number wins the spot and the loser collapses to a quiet dot. Score is the
// real signal; size tier breaks ties so a big unscored project outranks a
// small one. The map layer adds a large constant for the selected catalyst
// so a selection can never be the one that gets collapsed.
//
// Data Center Refocus: a Possible/Predicted/Planned catalyst gets a tier
// bonus above every ordinary score/size contribution (but below the
// selected-catalyst bonus) so a staged DC pin never loses the declutter
// contest to a supporting-layer dot once both are visible on screen.
const DC_STAGE_PRIORITY_BONUS = 100_000;

export function catalystMarkerPriority(
  catalyst: Pick<Catalyst, "catalyst_score" | "estimated_value" | "catalyst_type" | "signal_categories">
): number {
  const stageBonus = computeDcStage(catalyst) != null ? DC_STAGE_PRIORITY_BONUS : 0;
  return stageBonus + (catalyst.catalyst_score ?? 0) * 10 + CATALYST_SIZE_TIER_PX[catalystSizeTier(catalyst)];
}

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
