import type { DevelopmentOpportunity, GrowthArea, MarketIndicator, Shift } from "./types";

// Section 6's Groundbreakable Emerging Market Score. The spec is explicit:
// "do not rely only on lagging demographic statistics... give greater
// weight to forward-looking municipal commitments and decisions." So the
// weighting here deliberately inverts what a conventional market
// dashboard would do -- recent plans/infrastructure shifts and growth-area
// momentum (both forward-looking, both things a city is actively doing
// right now) carry more than double the weight of market_indicators
// (population/jobs/permits -- real, but backward-looking by definition).

export type EmergingMarketScore = {
  score: number;
  tier: "leading" | "emerging" | "watch" | "quiet";
  reasons: string[];
};

export const EMERGING_MARKET_TIER_LABEL: Record<EmergingMarketScore["tier"], string> = {
  leading: "Leading Indicator Market",
  emerging: "Emerging",
  watch: "On the Watch List",
  quiet: "Quiet",
};

export function computeEmergingMarketScore(input: {
  indicators: MarketIndicator[];
  growthAreas: GrowthArea[];
  recentShifts: Shift[]; // pre-filtered to a recent window (e.g. last 180 days) by the caller
  opportunities: DevelopmentOpportunity[];
}): EmergingMarketScore {
  const reasons: string[] = [];
  let score = 0;

  // Forward-looking municipal commitments (up to 35 -- the single
  // largest weight, by design).
  const planningInfraShifts = input.recentShifts.filter((s) => s.category === "plans" || s.category === "infrastructure");
  const planningBonus = Math.min(planningInfraShifts.length * 6, 35);
  if (planningBonus > 0) {
    score += planningBonus;
    reasons.push(`${planningInfraShifts.length} recent plan/infrastructure signal${planningInfraShifts.length === 1 ? "" : "s"} logged`);
  }

  // Growth-area momentum (up to 25).
  const accelerating = input.growthAreas.filter((g) => g.momentum_state === "accelerating").length;
  const emerging = input.growthAreas.filter((g) => g.momentum_state === "emerging").length;
  const momentumBonus = Math.min(accelerating * 8 + emerging * 4, 25);
  if (momentumBonus > 0) {
    score += momentumBonus;
    reasons.push(`${accelerating} accelerating and ${emerging} emerging growth area${accelerating + emerging === 1 ? "" : "s"}`);
  }

  // High-strength development opportunities already surfacing (up to 25).
  const highOpps = input.opportunities.filter((o) => o.strength === "high").length;
  const oppBonus = Math.min(highOpps * 5, 25);
  if (oppBonus > 0) {
    score += oppBonus;
    reasons.push(`${highOpps} high-strength development opportunit${highOpps === 1 ? "y" : "ies"} identified`);
  }

  // Lagging demographic/economic indicators -- real signal, deliberately
  // capped low relative to the above (up to 15).
  const upIndicators = input.indicators.filter((i) => i.trend === "up");
  const indicatorBonus = Math.min(upIndicators.length * 3, 15);
  if (indicatorBonus > 0) {
    score += indicatorBonus;
    reasons.push(`${upIndicators.length} tracked indicator${upIndicators.length === 1 ? "" : "s"} trending up`);
  }

  score = Math.min(100, score);
  const tier: EmergingMarketScore["tier"] = score >= 65 ? "leading" : score >= 40 ? "emerging" : score >= 20 ? "watch" : "quiet";

  return { score, tier, reasons };
}
