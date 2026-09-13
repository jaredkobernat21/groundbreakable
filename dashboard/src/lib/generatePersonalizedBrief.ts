import type { SupabaseClient } from "@supabase/supabase-js";
import type { DevelopmentOpportunity, GrowthArea, InvestorProfile, Market, MarketIndicator, OpportunityProfile, Shift } from "./types";
import { getShifts } from "./queries/shifts";
import { getGrowthAreas } from "./queries/planIntelligence";
import { getDevelopmentOpportunities } from "./queries/developmentOpportunities";
import { getMarketIndicators } from "./queries/marketOverview";
import { shiftDateRangeToDate } from "./shiftConstants";
import { scoreCorridorMatch, scoreOpportunityMatch, scoreShiftMatch, type ClientMatch } from "./clientMatchScoring";
import { computeEmergingMarketScore, EMERGING_MARKET_TIER_LABEL, type EmergingMarketScore } from "./emergingMarketScoring";

// Intelligence tier's Personalized Opportunity Feed / weekly brief:
// assembles it from the same data every other tab in the app already
// reads -- Groundbreakable's value-add isn't new source data, it's this
// synthesis layer. Everything here is a pure function of (account,
// active Opportunity Profile, market bundles), so the exact same call
// renders the live feed/brief page and produces what gets persisted to
// personalized_briefs when the account explicitly saves one.

export type MarketBundle = {
  market: Market;
  shifts: Shift[];
  growthAreas: GrowthArea[];
  opportunities: DevelopmentOpportunity[];
  indicators: MarketIndicator[];
};

// 90 days -- wide enough to catch a slow-moving planning-commission cycle,
// tight enough that "recent" still means something (same reasoning as
// the shift dashboard's own filter bar, just fixed rather than
// user-adjustable here).
export async function gatherMarketBundles(supabase: SupabaseClient, markets: Market[]): Promise<MarketBundle[]> {
  return Promise.all(
    markets.map(async (market) => {
      const [shifts, growthAreasResult, opportunities, indicators] = await Promise.all([
        getShifts(supabase, market.id, { since: shiftDateRangeToDate("90d") }),
        getGrowthAreas(supabase, market.id),
        getDevelopmentOpportunities(supabase, market.id),
        getMarketIndicators(supabase, market.id),
      ]);
      return { market, shifts, growthAreas: growthAreasResult.data ?? [], opportunities, indicators };
    })
  );
}

// Which markets this feed/brief should cover: the profile's explicit
// target markets if it names any Groundbreakable-tracked ones,
// otherwise every tracked market (an account with no configured targets
// yet still gets a useful feed instead of an empty one).
export function resolveBriefMarkets(profile: OpportunityProfile | null, trackedMarkets: Market[]): Market[] {
  if (!profile || profile.target_market_ids.length === 0) return trackedMarkets;
  const targeted = trackedMarkets.filter((m) => profile.target_market_ids.includes(m.id));
  return targeted.length > 0 ? targeted : trackedMarkets;
}

export type ScoredOpportunity = { opportunity: DevelopmentOpportunity; market: Market; match: ClientMatch };
export type ScoredShift = { shift: Shift; market: Market; match: ClientMatch };
export type ScoredCorridor = { corridor: GrowthArea; market: Market; match: ClientMatch };
export type ScoredMarket = { market: Market; score: EmergingMarketScore };

export type PersonalizedBriefContent = {
  topOpportunities: ScoredOpportunity[];
  topShifts: ScoredShift[];
  topCorridors: ScoredCorridor[];
  emergingMarkets: ScoredMarket[];
  sections: {
    topSignalSummary: string;
    emergingMarketsSummary: string;
    corridorWatchSummary: string;
    acquisitionMatchesSummary: string;
    cityDecisionsSummary: string;
    risksSummary: string;
    groundbreakableTake: string;
  };
  matchSnapshot: { topOpportunityIds: string[]; topShiftIds: string[]; topCorridorIds: string[] };
};

export function buildPersonalizedBrief(
  account: InvestorProfile,
  profile: OpportunityProfile | null,
  bundles: MarketBundle[]
): PersonalizedBriefContent {
  const scoredOpportunities: ScoredOpportunity[] = [];
  const scoredShifts: ScoredShift[] = [];
  const scoredCorridors: ScoredCorridor[] = [];
  const emergingMarkets: ScoredMarket[] = [];

  for (const bundle of bundles) {
    if (profile) {
      for (const o of bundle.opportunities) {
        scoredOpportunities.push({ opportunity: o, market: bundle.market, match: scoreOpportunityMatch(profile, o, bundle.market) });
      }
      for (const s of bundle.shifts) {
        scoredShifts.push({ shift: s, market: bundle.market, match: scoreShiftMatch(profile, s, bundle.market) });
      }
      for (const c of bundle.growthAreas) {
        scoredCorridors.push({ corridor: c, market: bundle.market, match: scoreCorridorMatch(profile, c, bundle.market) });
      }
    }
    emergingMarkets.push({
      market: bundle.market,
      score: computeEmergingMarketScore({
        indicators: bundle.indicators,
        growthAreas: bundle.growthAreas,
        recentShifts: bundle.shifts,
        opportunities: bundle.opportunities,
      }),
    });
  }

  scoredOpportunities.sort((a, b) => b.match.score - a.match.score);
  scoredShifts.sort((a, b) => b.match.score - a.match.score);
  scoredCorridors.sort((a, b) => b.match.score - a.match.score);
  emergingMarkets.sort((a, b) => b.score.score - a.score.score);

  const topOpportunities = scoredOpportunities.slice(0, 5);
  const topShifts = scoredShifts.slice(0, 8);
  const topCorridors = scoredCorridors.slice(0, 3);

  const firstName = (account.full_name ?? "You").split(" ")[0];

  const topSignalSummary = topShifts[0]
    ? `${topShifts[0].shift.event} (${topShifts[0].market.name}) is the highest-match signal on file for ${firstName} right now — ${
        topShifts[0].match.reasons[0] ?? "a strong fit for the tracked criteria"
      }.`
    : "No signals currently on file rise to the top of your Opportunity Profile.";

  const emergingMarketsSummary = emergingMarkets.length
    ? emergingMarkets
        .slice(0, 3)
        .map((e) => `${e.market.name} (${EMERGING_MARKET_TIER_LABEL[e.score.tier]}, ${e.score.score}/100)`)
        .join("; ")
    : "No markets scored yet.";

  const corridorWatchSummary = topCorridors.length
    ? topCorridors.map((c) => `${c.corridor.name} in ${c.market.name} — ${c.match.reasons[0] ?? c.corridor.momentum_state}`).join(" | ")
    : "No corridors currently match your criteria closely enough to lead the watch list.";

  const acquisitionMatchesSummary = topOpportunities.length
    ? topOpportunities.map((o) => `${o.opportunity.address} (${o.market.name}, match ${o.match.score}/100)`).join(" | ")
    : "No specific site-level matches on file yet.";

  const cityDecisions = topShifts.filter((s) => s.shift.category === "plans" || s.shift.category === "infrastructure").slice(0, 3);
  const cityDecisionsSummary = cityDecisions.length
    ? cityDecisions.map((s) => `${s.market.name}: ${s.shift.event}`).join(" | ")
    : "No plans/infrastructure decisions logged in the last 90 days across your covered markets.";

  const risks: string[] = [];
  if (!profile) risks.push("No Opportunity Profile is configured yet — matches below default to raw signal strength, not a personalized fit.");
  else if (profile.target_market_ids.length === 0) risks.push("No target markets specified in your Opportunity Profile — this feed covers every market Groundbreakable currently tracks.");
  if (bundles.every((b) => b.opportunities.length === 0)) risks.push("No development opportunities are currently on file in the markets covered by this feed.");
  const risksSummary = risks.length ? risks.join(" ") : "No material data-coverage risks identified right now.";

  const takeParts: string[] = [];
  if (!profile) {
    takeParts.push("You don't have a configured Opportunity Profile yet — set one up on My Profile to personalize this feed beyond raw market activity.");
  } else {
    if (topOpportunities[0]) {
      takeParts.push(`The strongest current match is ${topOpportunities[0].opportunity.address} in ${topOpportunities[0].market.name} (${topOpportunities[0].match.score}/100).`);
    }
    if (topCorridors[0]) {
      takeParts.push(`${topCorridors[0].corridor.name} remains the corridor most worth tracking given its ${topCorridors[0].corridor.momentum_state} momentum.`);
    }
    if (emergingMarkets[0]) {
      takeParts.push(`${emergingMarkets[0].market.name} currently leads on forward-looking municipal activity across your covered markets.`);
    }
  }
  const groundbreakableTake = takeParts.length ? takeParts.join(" ") : "Nothing currently rises above a baseline match — worth checking back as new signals are logged.";

  return {
    topOpportunities,
    topShifts,
    topCorridors,
    emergingMarkets,
    sections: {
      topSignalSummary,
      emergingMarketsSummary,
      corridorWatchSummary,
      acquisitionMatchesSummary,
      cityDecisionsSummary,
      risksSummary,
      groundbreakableTake,
    },
    matchSnapshot: {
      topOpportunityIds: topOpportunities.map((o) => o.opportunity.id),
      topShiftIds: topShifts.map((s) => s.shift.id),
      topCorridorIds: topCorridors.map((c) => c.corridor.id),
    },
  };
}
