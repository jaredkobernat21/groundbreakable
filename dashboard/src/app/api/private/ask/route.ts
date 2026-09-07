import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getPrivateClient, getActiveAcquisitionProfile } from "@/lib/queries/privateClients";
import { buildPrivateBrief, gatherMarketBundles, resolveBriefMarkets } from "@/lib/generatePrivateBrief";
import { computePrivateClientScore } from "@/lib/privateClientScoring";
import { EMERGING_MARKET_TIER_LABEL } from "@/lib/emergingMarketScoring";
import type { Market, PrivateClientWithProfiles } from "@/lib/types";

// Section 10's Personalized AI Analyst. Reuses the exact same
// buildPrivateBrief() output the brief page renders -- the analyst
// answers from the same synthesized data a human would see, not a
// separate retrieval path, so "why does Groundbreakable think Gardner is
// emerging" and the Emerging Markets page can never silently disagree.
//
// Distinct system prompt from /api/ask on purpose: that endpoint is
// written for retail investors with little technical/investing
// background (plain spoken-word answers, no jargon). This audience is
// the opposite -- principals who personally evaluate acquisitions and
// want a sharper, more analytical register, closer to how a research
// analyst would actually brief them.
const INSTRUCTIONS =
  "You are the Groundbreakable Private analyst for one specific client. Answer only from the CONTEXT block below — " +
  "never invent projects, addresses, developers, scores, or figures. If the data doesn't support an answer, say so " +
  "plainly.\n\n" +
  "Your audience is a private real estate developer or land investor who personally evaluates acquisitions and " +
  "reads market intelligence professionally. Write like a sharp research analyst briefing a principal: concise, " +
  "confident, specific — 2-5 sentences, no filler, no disclaimers about being an AI. Reference concrete figures " +
  "(scores, acreage, dates) when they're in the CONTEXT. No markdown formatting (no asterisks, no bullet points, " +
  "no headers) — plain prose only.";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI analyst isn't configured yet — ANTHROPIC_API_KEY is missing." }, { status: 503 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const clientId = typeof body?.clientId === "string" ? body.clientId : undefined;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!clientId || !question) {
    return NextResponse.json({ error: "A clientId and question are required." }, { status: 400 });
  }

  const client = await getPrivateClient(supabase, clientId);
  if (!client) {
    return NextResponse.json({ error: "Private client not found or not accessible." }, { status: 404 });
  }

  const { data: marketsData } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const trackedMarkets = marketsData ?? [];
  const activeProfile = getActiveAcquisitionProfile(client);
  const briefMarkets = resolveBriefMarkets(activeProfile, trackedMarkets);
  const bundles = await gatherMarketBundles(supabase, briefMarkets);
  const content = buildPrivateBrief(client, activeProfile, bundles);
  const score = computePrivateClientScore(client, activeProfile, trackedMarkets);

  const context = buildContext(client, score.total, content, briefMarkets);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      // Same two-breakpoint caching approach as /api/ask: INSTRUCTIONS is
      // identical for every client/question; CONTEXT is identical for
      // every question asked about this one client until their data
      // changes, so a 1h TTL keeps repeat questions cheap.
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
    console.error("Private AI analyst failed", error);
    return NextResponse.json({ error: "AI analyst failed — try again in a moment." }, { status: 502 });
  }
}

function buildContext(
  client: PrivateClientWithProfiles,
  scoreTotal: number,
  content: ReturnType<typeof buildPrivateBrief>,
  markets: Market[]
): string {
  const profile = getActiveAcquisitionProfile(client);

  const profileLines = profile
    ? [
        `Target markets/states/metros: ${[...profile.target_states, ...profile.target_metros, ...profile.target_cities].join(", ") || "none specified"}`,
        `Property types: ${profile.property_types.join(", ") || "none specified"}`,
        `Size range: ${profile.min_acres ?? "?"}-${profile.max_acres ?? "?"} acres, ${profile.min_units ?? "?"}-${profile.max_units ?? "?"} units`,
        `Development stages: ${profile.development_stages.join(", ") || "none specified"}`,
        `Strategic preferences: ${profile.strategic_preferences.join(", ") || "none specified"}`,
        `Growth signals watched: ${[
          profile.watches_annexation && "annexation",
          profile.watches_utility_expansion && "utility expansion",
          profile.watches_road_investment && "road investment",
          profile.watches_new_schools && "new schools",
          profile.watches_municipal_incentives && "municipal incentives",
          profile.watches_employer_announcements && "employer announcements",
          profile.watches_capital_improvements && "capital improvements",
          profile.watches_housing_shortage && "housing shortage",
          profile.watches_job_growth && "job growth",
        ]
          .filter(Boolean)
          .join(", ") || "none specified"}`,
      ]
    : ["No acquisition profile configured yet."];

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
    `CLIENT: ${client.full_name}${client.company ? `, ${client.company}` : ""} — Groundbreakable Private Client Score ${scoreTotal}/100.`,
    "",
    "ACQUISITION PROFILE:",
    ...profileLines,
    "",
    `MARKETS GROUNDBREAKABLE IS COVERING FOR THIS BRIEF: ${markets.map((m) => `${m.name}, ${m.state}`).join(", ")}`,
    "",
    "EMERGING MARKET RANKINGS:",
    ...(marketLines.length ? marketLines : ["(none)"]),
    "",
    "TOP MATCHED DEVELOPMENT OPPORTUNITIES:",
    ...(opportunityLines.length ? opportunityLines : ["(none)"]),
    "",
    "TOP MATCHED SIGNALS (plans/permits/infrastructure/business/property/distress):",
    ...(shiftLines.length ? shiftLines : ["(none)"]),
    "",
    "TOP MATCHED CORRIDORS:",
    ...(corridorLines.length ? corridorLines : ["(none)"]),
    "",
    `GROUNDBREAKABLE TAKE: ${content.sections.groundbreakableTake}`,
    `RISKS: ${content.sections.risksSummary}`,
  ].join("\n");
}
