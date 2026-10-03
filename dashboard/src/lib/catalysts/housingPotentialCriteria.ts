// Potential Housing Site criteria (Jared's brief, 2026-10-03). Mirrors
// lib/catalysts/potentialSiteCriteria.ts's role for the Data Center
// Potential tier, but deliberately leaner: Housing has no weighted-factor
// score (no potential_score/potential_score_components equivalent) -- the
// brief never asked for a numeric rubric, and the People/Readiness/Next
// Steps/Why This Site concepts are already generic and reused directly
// from potentialSiteCriteria.ts / lib/types.ts rather than duplicated here.

export type HousingType = "large_single_family" | "multifamily" | "build_to_rent" | "townhome_attached" | "infill_redevelopment" | "mixed_residential";

export const HOUSING_TYPE_LABEL: Record<HousingType, string> = {
  large_single_family: "Large Single-Family",
  multifamily: "Multifamily",
  build_to_rent: "Build-to-Rent",
  townhome_attached: "Townhome / Attached",
  infill_redevelopment: "Infill / Redevelopment",
  mixed_residential: "Mixed Residential",
};

// The brief's explicit 3-way entitlement classification, plus 'unknown' as
// the honest default -- distinct from prospective_data_center_site's
// strong/moderate/weak pillar vocabulary because Housing's brief asked for
// these specific, more decision-oriented category names. Never predict
// which bucket applies without evidence; report known requirements/
// precedent/risk instead (see entitlement_notes).
export type EntitlementStatus = "by_right" | "entitlement_required" | "high_entitlement_risk" | "unknown";

export const ENTITLEMENT_STATUS_LABEL: Record<EntitlementStatus, string> = {
  by_right: "By-Right",
  entitlement_required: "Entitlement Required",
  high_entitlement_risk: "High Entitlement Risk",
  unknown: "Unknown",
};

export const ENTITLEMENT_STATUS_DESCRIPTION: Record<EntitlementStatus, string> = {
  by_right: "The desired housing type is already permitted under current zoning.",
  entitlement_required: "Rezoning, subdivision, conditional use, or another approval is required but appears reasonably plausible.",
  high_entitlement_risk: "Significant policy, zoning, political, environmental, or approval uncertainty exists.",
  unknown: "Entitlement requirements for this site have not yet been confirmed.",
};

// WHY THIS SITE (Housing's own tier of the same brief): mirrors
// lib/catalysts/potentialSiteCriteria.ts's computeWhySiteSummary, but
// synthesizes from Housing's own fields -- opportunity_catalyst (the
// short "what changed" callout) is the natural opening sentence, parallel
// to Data Center's opportunity_area; entitlement_status is the one
// categorical judgment Housing has, parallel to power_pillar_label.
// Existing rows predate why_this_site -- never fabricates a fact that
// isn't already stored on the row; falls back to why_it_matters, then to
// null, exactly like the Data Center version.
export function computeWhyHousingSiteSummary(catalyst: {
  why_this_site: string | null;
  why_it_matters: string | null;
  opportunity_catalyst: string | null;
  entitlement_status: EntitlementStatus | null;
}): string | null {
  if (catalyst.why_this_site) return catalyst.why_this_site;

  const parts: string[] = [];
  if (catalyst.opportunity_catalyst) parts.push(catalyst.opportunity_catalyst);
  if (catalyst.entitlement_status && catalyst.entitlement_status !== "unknown") {
    parts.push(`Entitlement status is assessed as ${ENTITLEMENT_STATUS_LABEL[catalyst.entitlement_status].toLowerCase()}`);
  }
  if (parts.length > 0) return `${parts.join(". ")}.`;

  return catalyst.why_it_matters;
}
