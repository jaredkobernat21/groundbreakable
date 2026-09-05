import type {
  Investment,
  InvestmentConfidenceLevel,
  InvestmentDevelopmentImpact,
  InvestmentGeographicScope,
  InvestmentImpactTag,
  InvestmentProjectStatus,
  InvestmentType,
  InvestmentWithSource,
} from "./types";

// --- Investment type (the 5 top-level categories, spec section 1) ---

export const INVESTMENT_TYPE_LABEL: Record<InvestmentType, string> = {
  private_development: "Private Development",
  public_capital: "Public Capital",
  infrastructure_enabling: "Infrastructure",
  incentivized_development: "Incentivized",
  institutional_corporate: "Institutional",
};

export const INVESTMENT_TYPE_COLOR: Record<InvestmentType, string> = {
  private_development: "#3b82f6", // blue -- same family as Building on the shift map
  public_capital: "#14b8a6", // teal -- same family as Infrastructure
  infrastructure_enabling: "#0d9488", // deeper teal, distinct from public_capital
  incentivized_development: "#f97316", // orange -- same family as Plans
  institutional_corporate: "#818cf8", // indigo
};

// One hand-authored glyph per type, same 24x24 stroke-path convention as
// SHIFT_CATEGORY_ICON_PATHS -- kept intentionally simple (2-3 paths) since
// color is what actually needs to carry the type distinction at map-pin
// scale (spec section 10: "users should be able to distinguish").
export const INVESTMENT_TYPE_ICON_PATHS: Record<InvestmentType, string[]> = {
  private_development: ["M4 21V9l8-6 8 6v12", "M9 21v-6h6v6"],
  public_capital: ["M4 21h16", "M6 21V10l6-5 6 5v11", "M10 21v-5h4v5"],
  infrastructure_enabling: ["M12 2v6", "M12 16v6", "M4.9 4.9l4.2 4.2", "M14.9 14.9l4.2 4.2", "M2 12h6", "M16 12h6"],
  incentivized_development: ["M12 2v20", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7"],
  institutional_corporate: ["M3 21h18", "M5 21V7l7-4 7 4v14", "M9 9h1M9 13h1M14 9h1M14 13h1M9 17h6"],
};

export function investmentIconSvgMarkup(type: InvestmentType, opts?: { size?: number; stroke?: string; strokeWidth?: number }): string {
  const { size = 14, stroke = "#fff", strokeWidth = 1.8 } = opts ?? {};
  const paths = INVESTMENT_TYPE_ICON_PATHS[type].map((d) => `<path d="${d}" />`).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

// Same teardrop pin marker convention as shiftPinMarkerSvgMarkup.
export function investmentPinMarkerSvgMarkup(type: InvestmentType, opts?: { size?: number }): string {
  const { size = 30 } = opts ?? {};
  const fill = INVESTMENT_TYPE_COLOR[type];
  const height = Math.round((size * 32) / 24);
  const iconPaths = INVESTMENT_TYPE_ICON_PATHS[type].map((d) => `<path d="${d}" />`).join("");
  return `<svg width="${size}" height="${height}" viewBox="0 0 24 32" fill="none">
    <path d="M12 0C6.477 0 2 4.595 2 10.263c0 7.692 10 21.737 10 21.737s10-14.045 10-21.737C22 4.595 17.523 0 12 0z" fill="${fill}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
    <g transform="translate(12,10.263) scale(0.34) translate(-12,-12)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${iconPaths}</g>
  </svg>`;
}

// --- Project status (spec section 2's normalized status list) ---

export const INVESTMENT_STATUS_LABEL: Record<InvestmentProjectStatus, string> = {
  early_signal: "Early Signal",
  proposed: "Proposed",
  under_review: "Under Review",
  approved: "Approved",
  funded: "Funded",
  permitted: "Permitted",
  under_construction: "Under Construction",
  complete: "Complete",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

// Gray -> amber -> green -> blue progression: uncommitted, moving,
// committed/underway, done. Delayed/cancelled break the progression
// deliberately (red family) so they never read as "on track."
export const INVESTMENT_STATUS_COLOR: Record<InvestmentProjectStatus, string> = {
  early_signal: "#94a3b8",
  proposed: "#94a3b8",
  under_review: "#eab308",
  approved: "#22c55e",
  funded: "#16a34a",
  permitted: "#16a34a",
  under_construction: "#2563eb",
  complete: "#1c1c1c",
  delayed: "#ef4444",
  cancelled: "#ef4444",
};

// Section 5: only "HIGH" confidence rows should ever read as confirmed
// fact in UI copy -- this order also backs the confidence badge's visual
// weight (solid vs. hollow vs. faint).
export const INVESTMENT_CONFIDENCE_LABEL: Record<InvestmentConfidenceLevel, string> = {
  high: "Confirmed",
  medium: "Reported",
  low: "Early Signal",
};

export const INVESTMENT_DEVELOPMENT_IMPACT_LABEL: Record<InvestmentDevelopmentImpact, string> = {
  very_high: "Very High Impact",
  high: "High Impact",
  medium: "Medium Impact",
  low: "Low Impact",
};

export const INVESTMENT_IMPACT_TAG_LABEL: Record<InvestmentImpactTag, string> = {
  unlocks_land: "Unlocks Land",
  adds_housing: "Adds Housing",
  adds_commercial: "Adds Commercial",
  adds_employment: "Adds Employment",
  improves_transportation: "Improves Transportation",
  expands_utilities: "Expands Utilities",
  raises_momentum: "Raises Momentum",
  supports_redevelopment: "Supports Redevelopment",
  improves_public_realm: "Improves Public Realm",
  adds_institutional_demand: "Adds Institutional Demand",
};

export const INVESTMENT_GEOGRAPHIC_SCOPE_LABEL: Record<InvestmentGeographicScope, string> = {
  parcel: "Parcel",
  development_site: "Development Site",
  corridor: "Corridor",
  neighborhood: "Neighborhood",
  growth_area: "Growth Area",
  citywide: "Citywide",
};

const ACTIVE_STATUSES: InvestmentProjectStatus[] = [
  "proposed", "under_review", "approved", "funded", "permitted", "under_construction",
];
const COMMITTED_STATUSES: InvestmentProjectStatus[] = ["approved", "funded", "permitted", "under_construction", "complete"];

// Section 12: Investment Momentum. Deliberately NOT a simple sum of
// dollars -- one giant project shouldn't single-handedly declare a market
// "high momentum" (spec's own explicit warning). Weights confirmed/
// funded/under-construction activity above merely-proposed activity, and
// blends in project *count* and *diversity* of type, not just amount.
export type InvestmentMomentum = {
  committedTotal: number;
  activeCount: number;
  infrastructureCount: number;
  incentivizedCount: number;
  typeDiversity: number; // how many of the 5 investment_type values are represented
  score: number;
  level: "low" | "medium" | "high";
};

export function computeInvestmentMomentum(investments: Investment[]): InvestmentMomentum {
  const active = investments.filter((i) => ACTIVE_STATUSES.includes(i.project_status));
  const committed = investments.filter((i) => COMMITTED_STATUSES.includes(i.project_status));

  const committedTotal = committed.reduce((sum, i) => sum + (i.total_investment_amount ?? 0), 0);
  const infrastructureCount = active.filter((i) => i.investment_type === "infrastructure_enabling").length;
  const incentivizedCount = active.filter((i) => i.investment_type === "incentivized_development").length;
  const typeDiversity = new Set(active.map((i) => i.investment_type)).size;

  // $1 of committed capital is worth far less than one real active
  // project in this score -- dollars alone would let a single $500M
  // project dominate every other signal, which is exactly what the spec
  // says not to do. Dollars still count (scaled down hard), just not as
  // the dominant term.
  const score =
    active.length * 10 +
    committed.length * 15 +
    infrastructureCount * 8 +
    typeDiversity * 5 +
    committedTotal / 5_000_000;

  // A handful of rows can mathematically clear the "high" score threshold
  // on a market that's barely been researched yet (4 investments is
  // enough to hit it on the per-item weights above) -- that's a real
  // false-confidence risk given section 9's "do not show misleading
  // totals" rule, so a thin sample caps out at "medium" regardless of
  // score until there's enough volume to trust a "high" read.
  const level: InvestmentMomentum["level"] =
    investments.length < 8 ? (score >= 30 ? "medium" : "low") : score >= 80 ? "high" : score >= 30 ? "medium" : "low";

  return { committedTotal, activeCount: active.length, infrastructureCount, incentivizedCount, typeDiversity, score, level };
}

// Section 9's top summary line -- "$___ active/committed investment",
// "___ active investments", "___ major infrastructure projects",
// "___ incentivized projects". Kept separate from computeInvestmentMomentum
// (that's the *scoring* function; this is what the summary card actually
// displays) so a future page can use one without the other.
export function investmentSummary(investments: InvestmentWithSource[]) {
  const momentum = computeInvestmentMomentum(investments);
  // Section 9: "Do not show misleading totals if investment amounts are
  // incomplete." -- if a meaningful share of active/committed rows have
  // no dollar figure at all, the total is a floor, not a real total, and
  // the UI needs to say so rather than presenting it as complete.
  const active = investments.filter((i) => ACTIVE_STATUSES.includes(i.project_status));
  const undisclosedCount = active.filter((i) => i.total_investment_amount == null).length;
  return {
    ...momentum,
    totalCount: investments.length,
    isPartial: active.length > 0 && undisclosedCount / active.length > 0.2,
  };
}
