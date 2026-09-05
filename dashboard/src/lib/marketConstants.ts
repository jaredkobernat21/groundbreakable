import type { MarketIndicatorTrend } from "./types";

// Gray for flat, green for up, red for down -- deliberately NOT tied to
// "up is always good" (a rising unemployment rate would be bad-up), so
// this is just a neutral direction color; each card's own label makes
// clear whether the direction is welcome.
export const MARKET_TREND_COLOR: Record<MarketIndicatorTrend, string> = {
  up: "#22c55e",
  down: "#ef4444",
  flat: "#94a3b8",
};

export const MARKET_TREND_ARROW: Record<MarketIndicatorTrend, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

// market_indicators.unit is free text (see schema comment), so this is a
// best-effort formatter for the units seeded so far rather than an
// exhaustive switch -- anything unrecognized falls back to a plain
// locale-formatted number.
export function formatIndicatorValue(value: number, unit: string): string {
  switch (unit) {
    case "usd":
      return `$${Math.round(value).toLocaleString()}`;
    case "percent":
      return `${value}%`;
    case "thousands_of_jobs":
      return `${value.toLocaleString()}k jobs`;
    case "people":
      return value.toLocaleString();
    case "permits":
      return `${value.toLocaleString()} permits`;
    default:
      return value.toLocaleString();
  }
}

export function formatIndicatorChange(changeAbsolute: number | null, changePercent: number | null, unit: string): string | null {
  if (changeAbsolute == null) return null;
  const sign = changeAbsolute > 0 ? "+" : "";
  const pct = changePercent != null ? ` (${changePercent > 0 ? "+" : ""}${(changePercent * 100).toFixed(1)}%)` : "";
  if (unit === "usd") return `${sign}$${Math.round(changeAbsolute).toLocaleString()}${pct}`;
  if (unit === "percent") return `${sign}${changeAbsolute} pt${pct}`;
  return `${sign}${changeAbsolute.toLocaleString()}${pct}`;
}
