import type { Catalyst } from "@/lib/types";

// Housing Potential/Planned split (Jared, 2026-10-03) -- mirrors
// lib/catalysts/dcStage.ts's role for Housing, but deliberately simpler:
// 2 stages, not 3 (no "Possible" equivalent was asked for), and no color/
// size/icon ramp -- Jared's explicit instruction is that Housing keeps one
// map color/icon for both subcategories, unlike the Data Center stage ramp.
// This file is the single source of truth for "is this catalyst
// Housing-relevant, and at what stage" -- every map/filter/panel component
// imports from here instead of re-deriving the logic.
export type HousingStage = "potential" | "planned";

// Planned = catalyst_type already 'housing_development' -- every one of
// the 11 existing rows as of this change (a specific, identified project:
// a subdivision, a rezoning, an entitled filing). Potential = catalyst_type
// 'prospective_housing_site' -- a site/area flagged on demand/entitlement/
// infrastructure/site/economics signals, with no specific project yet (see
// lib/catalysts/housingPotentialCriteria.ts).
export function computeHousingStage(catalyst: Pick<Catalyst, "catalyst_type">): HousingStage | null {
  if (catalyst.catalyst_type === "housing_development") return "planned";
  if (catalyst.catalyst_type === "prospective_housing_site") return "potential";
  return null;
}

export const HOUSING_STAGE_LABEL: Record<HousingStage, string> = {
  potential: "Potential",
  planned: "Planned",
};

export const HOUSING_STAGE_HEADLINE: Record<HousingStage, string> = {
  potential: "Groundbreakable has identified this as a promising future housing opportunity, but no specific project exists here yet.",
  planned: "A specific housing project, filing, entitlement, or proposal exists at this location.",
};
