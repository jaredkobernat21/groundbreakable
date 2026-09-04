import type { ShiftAudience, ShiftCategory, ShiftImpact } from "./types";

// --- Category metadata ---
// One hand-authored 24x24 stroke-based glyph per category, same convention
// as PROJECT_ICON_PATHS/SIGNAL_ICON_PATHS in markerIcons.ts (paths reused
// where the concept lines up -- e.g. distress's triangle is the same glyph
// as the old Opportunities "alertTriangle").

export const SHIFT_CATEGORY_LABEL: Record<ShiftCategory, string> = {
  ownership: "Ownership",
  distress: "Distress",
  compliance: "Compliance",
  development: "Development",
  construction: "Construction",
  infrastructure: "Infrastructure",
};

export const SHIFT_CATEGORY_COLOR: Record<ShiftCategory, string> = {
  ownership: "#818cf8", // indigo
  distress: "#ef4444", // red
  compliance: "#eab308", // amber
  development: "#f97316", // orange
  construction: "#3b82f6", // blue
  infrastructure: "#14b8a6", // teal
};

export const SHIFT_CATEGORY_ICON_PATHS: Record<ShiftCategory, string[]> = {
  ownership: ["M4 10h16v10H4z", "M9 5l3-3 3 3", "M12 2v6"],
  distress: [
    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01",
  ],
  compliance: ["M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z", "M6 5h12v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z", "M9 11h6M9 15h6"],
  development: ["M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", "M14 3v4h4", "M9 12h6M9 15.5h6M9 8.5h3"],
  construction: ["M13 3l8 8-3 3-8-8z", "M10.5 8.5L3 16l3 3 7.5-7.5"],
  infrastructure: ["M8 21L10 3", "M16 21L14 3", "M12 4v4M12 11v4M12 18v3"],
};

export function shiftIconSvgMarkup(category: ShiftCategory, opts?: { size?: number; stroke?: string; strokeWidth?: number }): string {
  const { size = 14, stroke = "#fff", strokeWidth = 1.8 } = opts ?? {};
  const paths = SHIFT_CATEGORY_ICON_PATHS[category].map((d) => `<path d="${d}" />`).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

// Self-contained map-pin marker (teardrop body + centered glyph), same
// shape/anchor convention as pinMarkerSvgMarkup in markerIcons.ts -- anchor
// at the tip (bottom center) so it sits exactly on the shift's lat/lng.
export function shiftPinMarkerSvgMarkup(category: ShiftCategory, opts?: { size?: number }): string {
  const { size = 30 } = opts ?? {};
  const fill = SHIFT_CATEGORY_COLOR[category];
  const height = Math.round((size * 32) / 24);
  const iconPaths = SHIFT_CATEGORY_ICON_PATHS[category].map((d) => `<path d="${d}" />`).join("");
  return `<svg width="${size}" height="${height}" viewBox="0 0 24 32" fill="none">
    <path d="M12 0C6.477 0 2 4.595 2 10.263c0 7.692 10 21.737 10 21.737s10-14.045 10-21.737C22 4.595 17.523 0 12 0z" fill="${fill}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
    <g transform="translate(12,10.263) scale(0.34) translate(-12,-12)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${iconPaths}</g>
  </svg>`;
}

// --- Impact ---

export const SHIFT_IMPACT_LABEL: Record<ShiftImpact, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

// Same-hue-family scale (gray -> amber -> red) so "impact" reads as a
// severity gradient independent of the category color it's paired with.
export const SHIFT_IMPACT_COLOR: Record<ShiftImpact, string> = {
  low: "#94a3b8",
  medium: "#eab308",
  high: "#ef4444",
};

// --- Audience ---

export const SHIFT_AUDIENCE_LABEL: Record<ShiftAudience, string> = {
  agent: "Agent",
  broker: "Broker",
  investor: "Investor",
  contractor: "Contractor",
  developer: "Developer",
  lender: "Lender",
};

// --- Date range filter ---
// Same shape as purchaseWindowToDate() in lib/leads/constants.ts, scoped
// down to the two windows ROQ Shift actually offers.

export type ShiftDateRange = "7d" | "30d";

export const SHIFT_DATE_RANGES: { value: ShiftDateRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

export function shiftDateRangeToDate(range: ShiftDateRange): string {
  const days = range === "7d" ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
