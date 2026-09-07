import type {
  DevelopmentOpportunity,
  GrowthArea,
  Market,
  OpportunityProfile,
  Shift,
} from "./types";

// Section 2/4 (Intelligence tier)'s Match Score: "how closely does this
// signal / opportunity / corridor fit this specific account's Opportunity
// Profile?" Deliberately a transparent, explainable heuristic (same
// philosophy as Investment Momentum -- weighted counts, not a black box)
// rather than a learned model: every point traces back to a `reasons`
// line, since "why it matches" is an explicit part of the spec's match
// card.
//
// Shared 100-point budget across all matchable shapes: up to 40 for
// geography, up to 30 for growth-signal keyword relevance against the
// investor/developer profile's `watches_*` flags, up to 15-25 for
// strength/impact/momentum, and a smaller remainder for shape-specific
// fit (size range, GC-unidentified, explicit watchlist membership).
//
// Two distinct scoring paths for opportunities, dispatched by
// `profile.profile_type`: investor/developer profiles score on
// geography + growth signals + strength (unchanged from before);
// contractor profiles score on geography + trade/project-type fit +
// the "no GC identified yet" signal specifically called out in the
// spec's contractor match example -- growth-signal keywords don't apply
// to a contractor's day-to-day trade work the way they do to a land
// strategy, so that function doesn't reuse keywordBonus.

export type ClientMatch = {
  score: number;
  reasons: string[];
};

function geographyBonus(profile: OpportunityProfile, market: Market): { points: number; reasons: string[] } {
  if (profile.target_market_ids.includes(market.id)) {
    return { points: 40, reasons: [`${market.name} is one of your target markets`] };
  }
  const stateHit = profile.target_states.some((s) => s.trim().toLowerCase() === market.state.trim().toLowerCase());
  const metroHit = profile.target_metros.some((m) => market.name.toLowerCase().includes(m.trim().toLowerCase()));
  if (stateHit || metroHit) {
    return { points: 15, reasons: [stateHit ? `${market.state} matches your target states` : `${market.name} matches a target metro`] };
  }
  return { points: 0, reasons: [] };
}

// Free-text keyword -> `watches_*` flag mapping. The underlying tables
// (shifts.shift_type, development_opportunities.signals/opportunity_type,
// growth_areas.name/narrative) are all open-vocabulary text on purpose
// (see the investments migration's rationale) -- this is the necessary
// counterpart on the reading side: a loose keyword match rather than a
// brittle exact-value lookup.
const KEYWORD_WATCH_MAP: { pattern: RegExp; flag: keyof OpportunityProfile; label: string }[] = [
  { pattern: /annex/i, flag: "watches_annexation", label: "Annexation activity" },
  { pattern: /sewer|water|utilit/i, flag: "watches_utility_expansion", label: "Utility expansion" },
  { pattern: /road|highway|interchange|arterial|transportation/i, flag: "watches_road_investment", label: "Road / transportation investment" },
  { pattern: /school/i, flag: "watches_new_schools", label: "New school investment" },
  { pattern: /incentive|tif\b|\bcid\b|star_bond|economic_development/i, flag: "watches_municipal_incentives", label: "Municipal incentive activity" },
  { pattern: /employer|job|industrial_park|manufacturing/i, flag: "watches_employer_announcements", label: "Employer / job growth signal" },
  { pattern: /capital_improvement|\bcip\b|public_investment/i, flag: "watches_capital_improvements", label: "Capital improvement plan activity" },
  { pattern: /housing/i, flag: "watches_housing_shortage", label: "Housing shortage signal" },
];

function keywordBonus(profile: OpportunityProfile, keywords: string[]): { points: number; reasons: string[] } {
  const joined = keywords.filter(Boolean).join(" ").toLowerCase();
  let points = 0;
  const reasons: string[] = [];
  for (const { pattern, flag, label } of KEYWORD_WATCH_MAP) {
    if (pattern.test(joined) && profile[flag]) {
      points += 8;
      reasons.push(`${label} matches a growth signal you track`);
    }
  }
  return { points: Math.min(points, 30), reasons };
}

function sizeFitBonus(profile: OpportunityProfile, acres: number | null | undefined, units: number | null | undefined): { points: number; reasons: string[] } {
  if (acres != null && (profile.min_acres != null || profile.max_acres != null)) {
    const min = profile.min_acres ?? 0;
    const max = profile.max_acres ?? Infinity;
    if (acres >= min && acres <= max) {
      return { points: 15, reasons: [`${acres} acres falls within your ${profile.min_acres ?? "0"}–${profile.max_acres ?? "∞"} acre target`] };
    }
    return { points: 0, reasons: [] };
  }
  if (units != null && (profile.min_units != null || profile.max_units != null)) {
    const min = profile.min_units ?? 0;
    const max = profile.max_units ?? Infinity;
    if (units >= min && units <= max) {
      return { points: 15, reasons: [`${units} units falls within your ${profile.min_units ?? 0}–${profile.max_units ?? "∞"} unit target`] };
    }
    return { points: 0, reasons: [] };
  }
  return { points: 0, reasons: [] };
}

function scoreInvestorDeveloperOpportunityMatch(profile: OpportunityProfile, opportunity: DevelopmentOpportunity, market: Market): ClientMatch {
  const geo = geographyBonus(profile, market);
  const kw = keywordBonus(profile, [opportunity.opportunity_type, ...opportunity.signals]);
  const strengthPoints = opportunity.strength === "high" ? 15 : opportunity.strength === "medium" ? 8 : 3;
  const reasons = [...geo.reasons, ...kw.reasons];
  if (opportunity.strength === "high") reasons.push("Flagged as a high-strength opportunity");
  const score = Math.min(100, geo.points + kw.points + strengthPoints);
  return { score, reasons };
}

// Section 2's contractor match example: trade/project-type fit and
// whether a GC has been publicly identified yet are the signals that
// actually matter to a contractor, not growth-corridor keywords.
// `opportunity_group === "contractor"` (or "builder") is the strongest
// available signal -- it's Groundbreakable's own classification of the
// opportunity as trade-relevant, not a loose text match.
function scoreContractorOpportunityMatch(profile: OpportunityProfile, opportunity: DevelopmentOpportunity, market: Market): ClientMatch {
  const geo = geographyBonus(profile, market);
  const reasons = [...geo.reasons];
  let points = geo.points;

  if (opportunity.opportunity_group === "contractor" || opportunity.opportunity_group === "builder") {
    points += 20;
    reasons.push("Groundbreakable flagged this as a contractor/builder opportunity");
  }

  const haystack = [opportunity.opportunity_type, opportunity.category, ...opportunity.signals, ...opportunity.reasons].join(" ").toLowerCase();
  const tradeHit = profile.trade && haystack.includes(profile.trade.toLowerCase());
  const projectTypeHit = profile.preferred_project_types.some((pt) => haystack.includes(pt));
  if (tradeHit) {
    points += 15;
    reasons.push(`Mentions your trade (${profile.trade})`);
  }
  if (projectTypeHit) {
    points += 10;
    reasons.push("Matches one of your preferred project types");
  }

  if (profile.requires_gc_unidentified && !opportunity.related_contractor) {
    points += 25;
    reasons.push("No general contractor has been publicly identified yet");
  }

  const strengthPoints = opportunity.strength === "high" ? 15 : opportunity.strength === "medium" ? 8 : 3;
  points += strengthPoints;
  if (opportunity.strength === "high") reasons.push("Flagged as a high-strength opportunity");

  return { score: Math.min(100, points), reasons };
}

// Single entry point for scoring an opportunity -- dispatches on
// profile_type so callers (the personalized feed, the AI analyst
// context builder) don't need to branch themselves.
export function scoreOpportunityMatch(profile: OpportunityProfile, opportunity: DevelopmentOpportunity, market: Market): ClientMatch {
  return profile.profile_type === "contractor"
    ? scoreContractorOpportunityMatch(profile, opportunity, market)
    : scoreInvestorDeveloperOpportunityMatch(profile, opportunity, market);
}

export function scoreShiftMatch(profile: OpportunityProfile, shift: Shift, market: Market): ClientMatch {
  const geo = geographyBonus(profile, market);
  const reasons = [...geo.reasons];
  let points = geo.points;

  if (profile.profile_type === "contractor") {
    // A contractor cares about building/infrastructure activity
    // (permits, construction) far more than plans/zoning-stage signals
    // -- weight those categories directly rather than through the
    // investor-side watches_* flags.
    if (shift.category === "building") {
      points += 20;
      reasons.push("A building/permit signal — directly relevant to contractor work");
    } else if (shift.category === "infrastructure") {
      points += 12;
      reasons.push("Infrastructure activity that often precedes new contract work");
    }
    if (shift.audience.includes("contractor")) {
      points += 15;
      reasons.push("Flagged as relevant to contractors specifically");
    }
  } else {
    const kw = keywordBonus(profile, [shift.category, shift.shift_type, shift.event]);
    points += kw.points;
    reasons.push(...kw.reasons);
    if (shift.audience.some((a) => a === "developer" || a === "investor")) {
      points += 10;
      reasons.push("Flagged as relevant to developers/investors specifically");
    }
  }

  const impactPoints = shift.impact === "high" ? 15 : shift.impact === "medium" ? 8 : 3;
  points += impactPoints;
  if (shift.impact === "high") reasons.push("Rated a high-impact signal");

  return { score: Math.min(100, points), reasons };
}

const MOMENTUM_BONUS: Record<GrowthArea["momentum_state"], number> = {
  accelerating: 20,
  emerging: 15,
  established: 10,
};

export function scoreCorridorMatch(profile: OpportunityProfile, corridor: GrowthArea, market: Market): ClientMatch {
  const geo = geographyBonus(profile, market);
  const kw = keywordBonus(profile, [corridor.name, corridor.narrative ?? "", corridor.thesis ?? ""]);
  const momentumPoints = MOMENTUM_BONUS[corridor.momentum_state];
  const watchlistBonus = profile.target_corridor_ids.includes(corridor.id) ? 10 : 0;
  const reasons = [...geo.reasons, ...kw.reasons, `${corridor.momentum_state === "accelerating" ? "Accelerating" : corridor.momentum_state === "emerging" ? "Emerging" : "Established"} momentum corridor`];
  if (watchlistBonus > 0) reasons.push("Already one of your named target corridors");
  const score = Math.min(100, geo.points + kw.points + momentumPoints + watchlistBonus);
  return { score, reasons };
}

export function scoreSizeFit(profile: OpportunityProfile, acres: number | null | undefined, units: number | null | undefined): ClientMatch {
  const { points, reasons } = sizeFitBonus(profile, acres, units);
  return { score: points, reasons };
}
