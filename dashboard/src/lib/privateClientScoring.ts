import type { AcquisitionProfile, Market, PrivateClient } from "./types";

// Section 2's Groundbreakable Private Client Score. Four of the five
// components (Wealth/Project Capacity, Current Development Activity,
// Early Intelligence Value, Accessibility) require a human research
// judgment call the way gbl_leads.score does -- there's no row count to
// derive them from -- so they're analyst-entered on the private_clients
// row (see the migration header). Geographic Fit is the one component
// that IS objectively derivable from data Groundbreakable already has
// (which of the client's target markets we actually track), so it's
// computed here at read time rather than stored, same as Investment
// Momentum.

export type PrivateClientScore = {
  wealth: number;
  activity: number;
  intelValue: number;
  accessibility: number;
  geoFit: number;
  total: number;
  tier: "high" | "medium" | "low";
};

export const PRIVATE_CLIENT_SCORE_TIER_LABEL: Record<PrivateClientScore["tier"], string> = {
  high: "High-Value Prospect",
  medium: "Worth Developing",
  low: "Early / Unqualified",
};

// A client with zero tracked markets in scope gets 0 -- Groundbreakable
// can't credibly monitor a footprint it doesn't cover. One tracked
// market is a real but partial fit; two or more means the client's
// whole footprint (not just one site) benefits from what Groundbreakable
// watches, which is the actual "Geographic Fit" question per spec.
export function computeGeographicFitScore(activeProfile: AcquisitionProfile | null, trackedMarkets: Market[]): number {
  if (!activeProfile) return 0;
  const trackedIds = new Set(trackedMarkets.map((m) => m.id));
  const matched = activeProfile.target_market_ids.filter((id) => trackedIds.has(id)).length;
  if (matched === 0) return 0;
  if (matched === 1) return 6;
  return 10;
}

export function computePrivateClientScore(
  client: PrivateClient,
  activeProfile: AcquisitionProfile | null,
  trackedMarkets: Market[]
): PrivateClientScore {
  const wealth = client.score_wealth ?? 0;
  const activity = client.score_activity ?? 0;
  const intelValue = client.score_intel_value ?? 0;
  const accessibility = client.score_accessibility ?? 0;
  const geoFit = computeGeographicFitScore(activeProfile, trackedMarkets);
  const total = wealth + activity + intelValue + accessibility + geoFit;
  const tier: PrivateClientScore["tier"] = total >= 75 ? "high" : total >= 45 ? "medium" : "low";
  return { wealth, activity, intelValue, accessibility, geoFit, total, tier };
}
