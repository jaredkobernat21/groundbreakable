import { OPPORTUNITY_SIGNAL_PRIORITY, STACKED_OPPORTUNITY_GLOW_COLOR, type OpportunityType, type ProjectCategory, type ProjectStatus } from "./types";

// Small hand-authored line-icon set (24x24 viewBox, stroke-based) shared by
// the map's DOM markers, the legend, and the filter bar -- one glyph per
// sub-category so markers can stay a single Pipeline color (orange) while
// still being visually distinguishable, per the spec's strict per-layer
// color system.
export type ProjectIconKey =
  | "document"
  | "hammer"
  | "grid"
  | "road"
  | "clipboard"
  | "building"
  | "landTransfer"
  | "briefcase";

export const PROJECT_ICON_PATHS: Record<ProjectIconKey, string[]> = {
  document: [
    "M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z",
    "M14 3v4h4",
    "M9 12h6M9 15.5h6M9 8.5h3",
  ],
  hammer: ["M13 3l8 8-3 3-8-8z", "M10.5 8.5L3 16l3 3 7.5-7.5"],
  grid: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
  road: ["M8 21L10 3", "M16 21L14 3", "M12 4v4M12 11v4M12 18v3"],
  clipboard: [
    "M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z",
    "M6 5h12v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z",
    "M9 11h6M9 15h6",
  ],
  building: ["M6 21V6l6-3 6 3v15", "M3 21h18", "M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"],
  landTransfer: ["M4 10h16v10H4z", "M9 5l3-3 3 3", "M12 2v6"],
  briefcase: ["M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z", "M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2", "M4 13h16"],
};

// status takes priority for the two states the spec calls out explicitly
// (a permit issued, active construction); category decides the rest.
export function resolveProjectIcon(category: ProjectCategory, status: ProjectStatus): ProjectIconKey {
  if (status === "permitted") return "document";
  if (status === "under_construction") return "hammer";
  switch (category) {
    case "zoning":
      return "grid";
    case "infrastructure":
      return "road";
    case "planning_entitlement":
      return "clipboard";
    case "land_transaction":
      return "landTransfer";
    case "business_announcement":
      return "briefcase";
    case "active_development":
    default:
      return "building";
  }
}

export function projectIconSvgMarkup(
  key: ProjectIconKey,
  opts?: { size?: number; stroke?: string; strokeWidth?: number }
): string {
  const { size = 14, stroke = "#fff", strokeWidth = 1.8 } = opts ?? {};
  const paths = PROJECT_ICON_PATHS[key].map((d) => `<path d="${d}" />`).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

// Self-contained map-pin marker: teardrop body (single Pipeline orange) with
// the sub-category glyph centered in the head. Anchor at the tip (bottom
// center) so it sits exactly on the signal's lat/lng.
export function pinMarkerSvgMarkup(
  key: ProjectIconKey,
  opts?: { size?: number; fill?: string; iconStroke?: string }
): string {
  const { size = 30, fill = "#f97316", iconStroke = "#fff" } = opts ?? {};
  const height = Math.round((size * 32) / 24);
  const iconPaths = PROJECT_ICON_PATHS[key].map((d) => `<path d="${d}" />`).join("");
  return `<svg width="${size}" height="${height}" viewBox="0 0 24 32" fill="none">
    <path d="M12 0C6.477 0 2 4.595 2 10.263c0 7.692 10 21.737 10 21.737s10-14.045 10-21.737C22 4.595 17.523 0 12 0z" fill="${fill}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
    <g transform="translate(12,10.263) scale(0.34) translate(-12,-12)" fill="none" stroke="${iconStroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${iconPaths}</g>
  </svg>`;
}

// One glyph per Opportunity signal type, same hand-authored line-icon
// convention as PROJECT_ICON_PATHS (24x24 viewBox, stroke-based) so a
// signal reads clearly at the small size it renders inside a bulb's head.
// pre_foreclosure/tax_lien/tax_delinquent intentionally reuse the Pipeline
// document/hammer glyphs -- a gavel and a tax notice are the same concept
// on a bulb as they are on a pin, and duplicating proven, legible paths
// beats freehand-drawing new ones for closely related ideas.
export type OpportunityIconKey =
  | "gavel"
  | "document"
  | "clipboard"
  | "envelope"
  | "trendingUp"
  | "trendingDown"
  | "home"
  | "alertTriangle"
  | "tag"
  | "map"
  | "barChart";

export const SIGNAL_ICON_PATHS: Record<OpportunityIconKey, string[]> = {
  gavel: ["M13 3l8 8-3 3-8-8z", "M10.5 8.5L3 16l3 3 7.5-7.5"],
  document: ["M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", "M14 3v4h4", "M9 12h6M9 15.5h6M9 8.5h3"],
  clipboard: ["M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z", "M6 5h12v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z", "M9 11h6M9 15h6"],
  envelope: ["M3 5h18v14H3z", "M3 5l9 7 9-7"],
  trendingUp: ["M3 17l6-6 4 4 8-8", "M15 6h6v6"],
  trendingDown: ["M23 18l-9.5-9.5-5 5L1 6", "M17 18h6v-6"],
  home: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10", "M9.5 14.5l5 5M14.5 14.5l-5 5"],
  alertTriangle: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  tag: ["M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z", "M7 7h.01"],
  map: ["M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z", "M8 2v16", "M16 6v16"],
  barChart: ["M18 20V10", "M12 20V4", "M6 20v-6"],
};

export const OPPORTUNITY_SIGNAL_ICON: Record<OpportunityType, OpportunityIconKey> = {
  pre_foreclosure: "gavel",
  tax_lien: "document",
  tax_delinquent: "clipboard",
  absentee_owner: "envelope",
  high_equity_owner: "trendingUp",
  vacant: "home",
  code_violation: "alertTriangle",
  listing: "tag",
  price_drop: "trendingDown",
  underutilized_land: "map",
  zoning_upside: "barChart",
};

// Picks one icon to represent a (possibly multi-signal) property -- the
// highest-priority signal present, same ordering as OPPORTUNITY_SIGNAL_PRIORITY.
export function resolveOpportunityIcon(signals: OpportunityType[]): OpportunityIconKey {
  const primary = OPPORTUNITY_SIGNAL_PRIORITY.find((type) => signals.includes(type)) ?? signals[0];
  return OPPORTUNITY_SIGNAL_ICON[primary];
}

// Bare glyph, no bulb chrome -- for the Opportunities legend, same pattern
// as projectIconSvgMarkup for the Activity legend.
export function opportunityIconSvgMarkup(
  key: OpportunityIconKey,
  opts?: { size?: number; stroke?: string; strokeWidth?: number }
): string {
  const { size = 14, stroke = "#fff", strokeWidth = 1.8 } = opts ?? {};
  const paths = SIGNAL_ICON_PATHS[key].map((d) => `<path d="${d}" />`).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

// Opportunities marker: a standalone lightbulb (not a pin) -- per spec,
// "Pins tell you what's happening. Bulbs show you where the opportunity
// is." Anchor at the bottom tip of the base, same anchor scheme as the
// pin marker -- the glow padding added for `stacked` only extends the
// canvas upward/sideways so the tip stays glued to the real lat/lng.
export function bulbMarkerSvgMarkup(opts?: {
  size?: number;
  fill?: string;
  icon?: OpportunityIconKey;
  stacked?: boolean;
}): string {
  const { size = 28, fill = "#22c55e", icon, stacked = false } = opts ?? {};
  const pad = stacked ? 7 : 0;
  const viewWidth = 24 + pad * 2;
  const viewHeight = 32 + pad;
  const width = Math.round((size * viewWidth) / 24);
  const height = Math.round((width * viewHeight) / viewWidth);

  const iconMarkup = icon
    ? `<g transform="translate(12,10) scale(0.34) translate(-12,-12)" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${SIGNAL_ICON_PATHS[icon]
        .map((d) => `<path d="${d}" />`)
        .join("")}</g>`
    : `<g stroke="#fff" stroke-opacity="0.85" stroke-width="1" fill="none">
      <path d="M9 21.2h6M9.3 23.8h5.4M9.6 26.4h4.8" />
    </g>
    <path d="M9.3 9.5l1.4 2.6 1.3-2 1.3 2 1.4-2.6" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />`;

  const glowMarkup = stacked
    ? `<circle cx="12" cy="9" r="15" fill="${STACKED_OPPORTUNITY_GLOW_COLOR}" opacity="0.35" filter="blur(4px)" />`
    : "";

  return `<svg width="${width}" height="${height}" viewBox="${-pad} ${-pad} ${viewWidth} ${viewHeight}" fill="none">
    ${glowMarkup}
    <path d="M12 2C7.58 2 4 5.58 4 10c0 3.06 1.72 5.24 3.02 6.9.78 1 1.48 1.9 1.48 2.6v1h7v-1c0-.7.7-1.6 1.48-2.6C18.28 15.24 20 13.06 20 10c0-4.42-3.58-8-8-8z" fill="${fill}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
    <path d="M10 29h4l-1.3 3h-1.4z" fill="${fill}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
    ${iconMarkup}
  </svg>`;
}

// Catalysts marker: a plain circle (not a pin or a bulb) -- deliberately a
// third, distinct shape so a catalyst reads as "a point of influence,"
// not "a thing happening" or "an opportunity." Center-anchored, since a
// circle has no natural tip the way a pin does. No animation by default;
// the influence-radius ripple only appears on selection (see DevelopmentMap).
export function catalystMarkerSvgMarkup(opts?: { size?: number; fill?: string }): string {
  const { size = 26, fill = "#a855f7" } = opts ?? {};
  return `<svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke="${fill}" stroke-width="1.5" opacity="0.4" />
    <circle cx="14" cy="14" r="8.5" fill="${fill}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
    <circle cx="14" cy="14" r="3" fill="#fff" opacity="0.9" />
  </svg>`;
}
