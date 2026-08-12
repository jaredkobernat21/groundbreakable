import type { ProjectCategory, ProjectStatus } from "./types";

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

// Opportunities marker: a standalone lightbulb (not a pin) -- per spec,
// "Pins tell you what's happening. Bulbs show you where the opportunity
// is." Anchor at the bottom tip of the base, same anchor scheme as the
// pin marker.
export function bulbMarkerSvgMarkup(opts?: { size?: number; fill?: string }): string {
  const { size = 28, fill = "#22c55e" } = opts ?? {};
  const height = Math.round((size * 32) / 24);
  return `<svg width="${size}" height="${height}" viewBox="0 0 24 32" fill="none">
    <path d="M12 2C7.58 2 4 5.58 4 10c0 3.06 1.72 5.24 3.02 6.9.78 1 1.48 1.9 1.48 2.6v1h7v-1c0-.7.7-1.6 1.48-2.6C18.28 15.24 20 13.06 20 10c0-4.42-3.58-8-8-8z" fill="${fill}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
    <path d="M10 29h4l-1.3 3h-1.4z" fill="${fill}" stroke="rgba(0,0,0,0.35)" stroke-width="0.5" />
    <g stroke="#fff" stroke-opacity="0.85" stroke-width="1" fill="none">
      <path d="M9 21.2h6M9.3 23.8h5.4M9.6 26.4h4.8" />
    </g>
    <path d="M9.3 9.5l1.4 2.6 1.3-2 1.3 2 1.4-2.6" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
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
