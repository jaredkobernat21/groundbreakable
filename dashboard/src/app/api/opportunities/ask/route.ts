import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestorProfile, tierAtLeast } from "@/lib/tiers";
import { getOpportunityProfiles, getActiveOpportunityProfile } from "@/lib/queries/opportunityProfiles";
import { buildPersonalizedBrief, gatherMarketBundles, resolveBriefMarkets } from "@/lib/generatePersonalizedBrief";
import { EMERGING_MARKET_TIER_LABEL } from "@/lib/emergingMarketScoring";
import type { InvestorProfile, Market, OpportunityProfile } from "@/lib/types";

// Intelligence/Partner's Personalized AI Analyst (spec section 2:
// "AI analyst that knows the user's criteria"). Reuses the exact same
// buildPersonalizedBrief() output the Opportunities page renders -- the
// analyst answers from the same synthesized data a human would see, not
// a separate retrieval path, so "why is this opportunity ranked highly"
// and the Opportunities page can never silently disagree.
//
// Distinct system prompt from /api/ask on purpose: that endpoint is
// written for a broad audience with little technical/investing
// background (plain spoken-word answers). This is a paid personalization
// feature for someone who already configured a detailed profile -- write
// like a sharp analyst briefing them, not an FAQ bot.
const INSTRUCTIONS =
  "You are the Groundbreakable Intelligence analyst for one specific account. Answer only from the CONTEXT block " +
  "below — never invent projects, addresses, developers, scores, or figures. If the data doesn't support an " +
  "answer, say so plainly.\n\n" +
  "Your audience personally evaluates development opportunities or contract work and reads market intelligence " +
  "professionally. Write like a sharp research analyst briefing them: concise, confident, specific — 2-5 " +
  "sentences, no filler, no disclaimers about being an AI. Reference concrete figures (scores, acreage, dates) " +
  "when they're in the CONTEXT. No markdown formatting — plain prose only.";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI analyst isn't configured yet — ANTHROPIC_API_KEY is missing." }, { status: 503 });
  }

  const supabase = createClient();
  const account = await getCurrentInvestorProfile(supabase);
  if (!account) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!tierAtLeast(account.subscription_tier, "intelligence")) {
    return NextResponse.json({ error: "The personalized AI analyst is part of Intelligence and Partner." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }

  const { data: marketsData } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const trackedMarkets = marketsData ?? [];
  const profiles = await getOpportunityProfiles(supabase, account.id);
  const activeProfile = getActiveOpportunityProfile(profiles);
  const briefMarkets = resolveBriefMarkets(activeProfile, trackedMarkets);
  const bundles = await gatherMarketBundles(supabase, briefMarkets);
  const content = buildPersonalizedBrief(account, activeProfile, bundles);

  const context = buildContext(account, activeProfile, content, briefMarkets);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: [
        { type: "text", text: INSTRUCTIONS, cache_control: { type: "ephemeral", ttl: "1h" } },
        { type: "text", text: context, cache_control: { type: "ephemeral", ttl: "1h" } },
      ],
      messages: [{ role: "user", content: question }],
    });

    const answer = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!answer) {
      return NextResponse.json({ error: "The analyst didn't return an answer — try rephrasing your question." }, { status: 502 });
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Personalized AI analyst failed", error);
    return NextResponse.json({ error: "AI analyst failed — try again in a moment." }, { status: 502 });
  }
}

function buildContext(
  account: InvestorProfile,
  profile: OpportunityProfile | null,
  content: ReturnType<typeof buildPersonalizedBrief>,
  markets: Market[]
): string {
  const profileLines = profile
    ? profile.profile_type === "contractor"
      ? [
          `Profile type: Contractor (${profile.trade ?? "trade not specified"})`,
          `Travel radius: ${profile.travel_radius_mi ?? "not specified"} mi`,
          `Preferred project types: ${profile.preferred_project_types.join(", ") || "none specified"}`,
          `Minimum contract value: ${profile.min_contract_value ?? "not specified"}`,
          `Prioritizes projects with no GC identified yet: ${profile.requires_gc_unidentified ? "yes" : "no"}`,
        ]
      : [
          `Profile type: Investor / Developer`,
          `Target markets/states/metros: ${[...profile.target_states, ...profile.target_metros, ...profile.target_cities].join(", ") || "none specified"}`,
          `Property types: ${profile.property_types.join(", ") || "none specified"}`,
          `Size range: ${profile.min_acres ?? "?"}-${profile.max_acres ?? "?"} acres, ${profile.min_units ?? "?"}-${profile.max_units ?? "?"} units`,
          `Development stages: ${profile.development_stages.join(", ") || "none specified"}`,
          `Strategic preferences: ${profile.strategic_preferences.join(", ") || "none specified"}`,
        ]
    : ["No Opportunity Profile configured yet."];

  const marketLines = content.emergingMarkets.map(
    (m) => `- ${m.market.name}, ${m.market.state}: ${m.score.score}/100 (${EMERGING_MARKET_TIER_LABEL[m.score.tier]}) — ${m.score.reasons.join("; ") || "no notable signals"}`
  );

  const opportunityLines = content.topOpportunities.map(
    (o) => `- ${o.opportunity.address} (${o.market.name}): match ${o.match.score}/100, strength ${o.opportunity.strength}, type "${o.opportunity.opportunity_type}". Reasons: ${o.match.reasons.join("; ") || "none"}`
  );

  const shiftLines = content.topShifts.map(
    (s) => `- ${s.shift.event} (${s.market.name}, ${s.shift.category}, ${s.shift.event_date}): match ${s.match.score}/100. Reasons: ${s.match.reasons.join("; ") || "none"}`
  );

  const corridorLines = content.topCorridors.map(
    (c) => `- "${c.corridor.name}" (${c.market.name}, ${c.corridor.momentum_state} momentum): match ${c.match.score}/100.${c.corridor.thesis ? ` Thesis: ${c.corridor.thesis}` : ""}`
  );

  return [
    `ACCOUNT: ${account.full_name ?? "Groundbreakable user"}.`,
    "",
    "OPPORTUNITY PROFILE:",
    ...profileLines,
    "",
    `MARKETS COVERED: ${markets.map((m) => `${m.name}, ${m.state}`).join(", ")}`,
    "",
    "EMERGING MARKET RANKINGS:",
    ...(marketLines.length ? marketLines : ["(none)"]),
    "",
    "TOP MATCHED DEVELOPMENT OPPORTUNITIES:",
    ...(opportunityLines.length ? opportunityLines : ["(none)"]),
    "",
    "TOP MATCHED SIGNALS:",
    ...(shiftLines.length ? shiftLines : ["(none)"]),
    "",
    "TOP MATCHED CORRIDORS:",
    ...(corridorLines.length ? corridorLines : ["(none)"]),
    "",
    `GROUNDBREAKABLE TAKE: ${content.sections.groundbreakableTake}`,
    `RISKS: ${content.sections.risksSummary}`,
  ].join("\n");
}
