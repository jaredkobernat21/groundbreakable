import type { OpportunityStrength } from "./types";

// Gray -> amber -> red: same "severity gradient independent of category"
// idea as SHIFT_IMPACT_COLOR -- strength is its own dimension, not tied
// to a specific signal type.
export const OPPORTUNITY_STRENGTH_COLOR: Record<OpportunityStrength, string> = {
  low: "#94a3b8",
  medium: "#eab308",
  high: "#ef4444",
};

// The individual `signals` array on a development_opportunities row is
// free text (see schema comment -- the vocabulary will keep growing), so
// this is a best-effort label map for the values seeded so far rather
// than an exhaustive enum. Anything not listed here just falls back to a
// humanized version of the raw tag.
export const OPPORTUNITY_SIGNAL_LABEL: Record<string, string> = {
  tax_delinquent: "Tax Delinquent",
  tax_foreclosure: "Tax Foreclosure",
  pre_foreclosure: "Pre-Foreclosure",
  vacant: "Vacant",
  code_violation: "Code Violation",
  demolition: "Demolition",
  favorable_zoning: "Favorable Zoning",
  recent_rezoning: "Recent Rezoning",
  nearby_infrastructure: "Nearby Infrastructure",
  ownership_change: "Recent Ownership Change",
  parcel_assemblage: "Parcel Assemblage",
  high_momentum: "High Momentum",
  nearby_project: "Nearby Project",
  nearby_permit: "Nearby Permit",
  nearby_investment: "Nearby Investment",
};

export function opportunitySignalLabel(signal: string): string {
  return OPPORTUNITY_SIGNAL_LABEL[signal] ?? signal.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function opportunityPinMarkerSvgMarkup(strength: OpportunityStrength, opts?: { size?: number }): string {
  const { size = 30 } = opts ?? {};
  const fill = OPPORTUNITY_STRENGTH_COLOR[strength];
  const height = Math.round((size * 32) / 24);
  // A single "spark" glyph -- opportunities are one concept (a
  // multi-signal property worth watching), not a category needing its
  // own icon per type the way shifts/investments do; strength (color)
  // already carries the meaningful distinction.
  const iconPath = "M13 2L4 14h6l-1 8 9-12h-6l1-8z";
  return `<svg width="${size}" height="${height}" viewBox="0 0 24 32" fill="none">
    <path d="M12 0C6.477 0 2 4.595 2 10.263c0 7.692 10 21.737 10 21.737s10-14.045 10-21.737C22 4.595 17.523 0 12 0z" fill="${fill}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
    <g transform="translate(12,10.263) scale(0.34) translate(-12,-12)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="${iconPath}" />
    </g>
  </svg>`;
}
