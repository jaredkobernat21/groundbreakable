import type { PlanItem } from "./planItems";

// Plans sidebar subcategory (Jared, 2026-09-29): consolidates the same raw
// case-number prefixes CASE_PREFIX_LABEL (planNarrative.ts) already knows
// about into a small, sidebar-sized set of real request types, rather than
// listing all 16 raw prefixes as separate dropdown items. A bare shift (no
// formal case filed yet) only ever lands in "infrastructure" or "other" --
// there's no case number to read a type from.
export type PlanSubcategory = "rezoning" | "plat" | "conditional_use_permit" | "annexation" | "site_plan" | "infrastructure" | "other";

export const PLAN_SUBCATEGORY_LABEL: Record<PlanSubcategory, string> = {
  rezoning: "Rezoning",
  plat: "Plat",
  conditional_use_permit: "Conditional Use Permit",
  annexation: "Annexation",
  site_plan: "Site Plan",
  infrastructure: "Infrastructure",
  other: "Other",
};

const PREFIX_TO_SUBCATEGORY: Record<string, PlanSubcategory> = {
  Z: "rezoning",
  PLAT: "plat",
  PP: "plat", // Preliminary Plat
  PF: "plat", // Final Plat
  MS: "plat", // Minor Subdivision
  SUP: "conditional_use_permit", // Special Use Permit
  CUP: "conditional_use_permit",
  UP: "conditional_use_permit", // Use Permit
  A: "annexation",
  SP: "site_plan",
  DP: "site_plan", // Development Plan
  PDP: "site_plan", // Planned Development Plan
};

export function derivePlanSubcategory(item: PlanItem): PlanSubcategory {
  if (item.kind === "shift") {
    return item.shift.category === "infrastructure" ? "infrastructure" : "other";
  }
  const prefix = item.case.case_number?.match(/^[A-Za-z]+/)?.[0]?.toUpperCase();
  if (prefix && PREFIX_TO_SUBCATEGORY[prefix]) return PREFIX_TO_SUBCATEGORY[prefix];
  return "other";
}
