import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { selectMarket } from "@/lib/selectMarket";
import { resolveActivityPhase } from "@/lib/activityPhase";
import {
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  type CatalystWithSource,
  type Market,
  type OpportunityWithSource,
  type ProjectUpdateWithProject,
  type ProjectWithSource,
  type UpcomingDecisionWithSource,
} from "@/lib/types";

export type AskSegment = { text: string; type: "project" | "opportunity"; id: string } | { text: string };

const LINK_MARKUP = /\[\[([PO]\d+)\|([^\]]+)\]\]/g;

// Market-independent on purpose -- the market's name/data lives in the
// CONTEXT block instead (see buildContext) -- so this text is byte-for-byte
// identical on every request regardless of which market is being asked
// about, letting it cache-hit across the whole app, not just repeat
// questions on the same market (see the cache_control usage below).
const INSTRUCTIONS =
  "You are Groundbreakable's market analyst assistant. Answer only from the data provided below — never invent " +
  "projects, addresses, developers, or figures. If the data doesn't support an answer, say so plainly rather " +
  "than guessing.\n\n" +
  "Your audience includes people with little to no software or investing experience, some of them older " +
  "investors who aren't comfortable with technology. Write the way you'd explain it out loud to someone in that " +
  "position: short, plain sentences (2-4 sentences total), no jargon, no markdown formatting (no asterisks, no " +
  "bullet points, no headers) — just a clear, spoken-style answer.\n\n" +
  "Every project and property below has a short key in brackets, like [P1] or [O3]. Whenever you refer to one " +
  "of them by name in your answer, wrap whatever short, natural phrase you'd actually say (it does NOT need to " +
  "be the full formal title — a shortened name is better) like this: [[P1|Spore.Bio]] or [[O3|200 Oak Ave]] — " +
  "key first, then a pipe, then the visible phrase. This turns into a tappable link automatically, so never " +
  "mention the markup or the keys themselves out loud. Only use keys that are listed below; if you're not " +
  "confident which item you mean, just don't add markup for it.";

// Not covered by middleware.ts's matcher (/dashboard/:path*, /login only),
// so this route does its own auth check. Market access is enforced by
// RLS on every query below -- if the signed-in user lacks access, the
// query just returns nothing, so there's no separate authorization check
// to write here.
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI search isn't configured yet — ANTHROPIC_API_KEY is missing from the server environment." },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const marketSlug = typeof body?.marketSlug === "string" ? body.marketSlug : undefined;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }

  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const market = selectMarket(markets ?? [], marketSlug);
  if (!market) {
    return NextResponse.json({ error: "No accessible market found." }, { status: 404 });
  }

  const [{ data: projects }, { data: opportunities }, { data: catalysts }, { data: recentUpdates }, { data: decisions }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("market_id", market.id).returns<ProjectWithSource[]>(),
      supabase.from("opportunities").select("*").eq("market_id", market.id).returns<OpportunityWithSource[]>(),
      supabase.from("catalysts").select("*").eq("market_id", market.id).returns<CatalystWithSource[]>(),
      supabase
        .from("project_updates")
        .select("*, project:projects!inner(id, title, category, market_id)")
        .eq("project.market_id", market.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<ProjectUpdateWithProject[]>(),
      supabase
        .from("upcoming_decisions")
        .select("*")
        .eq("market_id", market.id)
        .order("decision_date", { ascending: true })
        .limit(10)
        .returns<UpcomingDecisionWithSource[]>(),
    ]);

  const { context, keyMap } = buildContext(
    market,
    projects ?? [],
    opportunities ?? [],
    catalysts ?? [],
    recentUpdates ?? [],
    decisions ?? []
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      // Generous headroom: the model can spend some of this budget on
      // internal reasoning before emitting the reply, and a too-tight
      // limit was previously cutting responses off mid-answer (stop_reason
      // "max_tokens") -- 500-600 wasn't enough even for a 2-4 sentence reply.
      max_tokens: 1024,
      // Two cache breakpoints, cheapest-to-reuse first: INSTRUCTIONS is
      // byte-identical for every market and every question, so it's
      // reusable across the whole app; CONTEXT is identical for every
      // question asked about this one market until its data changes. A
      // 1-hour TTL (not the 5-minute default) means a market's data
      // snapshot is billed at full price at most once an hour, no matter
      // how many investors ask questions about it in that window --
      // subsequent questions read the cache at a fraction of the cost.
      // Cache misses simply degrade to normal pricing (e.g. right after
      // an admin edits the market's data, or on a market too small to
      // clear the provider's minimum cacheable length) -- never an error.
      system: [
        { type: "text", text: INSTRUCTIONS, cache_control: { type: "ephemeral", ttl: "1h" } },
        { type: "text", text: context, cache_control: { type: "ephemeral", ttl: "1h" } },
      ],
      messages: [{ role: "user", content: question }],
    });

    const rawAnswer = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!rawAnswer) {
      return NextResponse.json({ error: "AI search didn't return an answer — try rephrasing your question." }, { status: 502 });
    }

    const segments = parseSegments(stripMarkdown(rawAnswer), keyMap);
    return NextResponse.json({ segments });
  } catch (error) {
    console.error("AI search failed", error);
    return NextResponse.json({ error: "AI search failed — try again in a moment." }, { status: 502 });
  }
}

// Strips stray markdown the model might still slip in despite the system
// prompt (bold/italic markers, header hashes, bullet dashes) -- doesn't
// touch the [[key|text]] link markup, which uses square brackets/pipes.
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/(?<!\[)\*([^*]+)\*(?!\])/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .trim();
}

// Splits the answer into an ordered list of plain-text and linked segments
// by walking [[key|text]] markup left to right -- the client renders this
// directly, so there's no ambiguous "does this substring appear in the
// prose" matching to get wrong (see the AskBar history: asking the model
// to separately name a project "exactly as it appears in the answer"
// didn't hold up once it started paraphrasing naturally).
function parseSegments(
  text: string,
  keyMap: Record<string, { type: "project" | "opportunity"; id: string }>
): AskSegment[] {
  const segments: AskSegment[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  LINK_MARKUP.lastIndex = 0;
  while ((match = LINK_MARKUP.exec(text)) !== null) {
    const [full, key, visibleText] = match;
    if (match.index > cursor) segments.push({ text: text.slice(cursor, match.index) });
    const target = keyMap[key];
    if (target) {
      segments.push({ text: visibleText, type: target.type, id: target.id });
    } else {
      // Unknown key (model error) -- fall back to showing the plain phrase.
      segments.push({ text: visibleText });
    }
    cursor = match.index + full.length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

function buildContext(
  market: Market,
  projects: ProjectWithSource[],
  opportunities: OpportunityWithSource[],
  catalysts: CatalystWithSource[],
  recentUpdates: ProjectUpdateWithProject[],
  decisions: UpcomingDecisionWithSource[]
): { context: string; keyMap: Record<string, { type: "project" | "opportunity"; id: string }> } {
  const keyMap: Record<string, { type: "project" | "opportunity"; id: string }> = {};

  const projectLines = projects.map((p, i) => {
    const key = `P${i + 1}`;
    keyMap[key] = { type: "project", id: p.id };
    const phase = resolveActivityPhase(p.status, p.date_updated);
    return `- [${key}] "${p.title}" (${PROJECT_CATEGORY_LABEL[p.category]}, ${PROJECT_STATUS_LABEL[p.status]}${phase ? `, phase: ${phase}` : ""})${
      p.address ? ` at ${p.address}` : ""
    }. Developer: ${p.developer ?? "unknown"}. Contractor: ${p.contractor ?? "not yet assigned"}. Investor: ${
      p.investor ?? "unknown"
    }. Updated ${p.date_updated}.${p.project_value ? ` Value: $${p.project_value.toLocaleString()}.` : ""}`;
  });

  const opportunityLines = opportunities.map((o, i) => {
    const key = `O${i + 1}`;
    keyMap[key] = { type: "opportunity", id: o.id };
    return `- [${key}] ${o.address}: signals [${o.signals.join(", ")}]${o.opportunity_score ? `, score ${o.opportunity_score}` : ""}. ${o.why_flagged}`;
  });

  const catalystLines = catalysts.map(
    (c) => `- "${c.title}" (${c.catalyst_type}, ${c.status})${c.address ? ` at ${c.address}` : ""}`
  );

  const updateLines = recentUpdates.map(
    (u) => `- ${u.occurred_on}: "${u.project?.title ?? "unknown project"}" → ${u.status}${u.note ? ` (${u.note})` : ""}`
  );

  const decisionLines = decisions.map(
    (d) => `- ${d.decision_date}: "${d.title}" (${d.decision_type}, ${d.status})`
  );

  const context = [
    `Market: ${market.name}, ${market.state}`,
    "",
    `PROJECTS (${projects.length}):`,
    ...(projectLines.length ? projectLines : ["(none on file)"]),
    "",
    `OPPORTUNITIES (${opportunities.length}):`,
    ...(opportunityLines.length ? opportunityLines : ["(none on file)"]),
    "",
    `CATALYSTS / WATCH ZONES (${catalysts.length}, no key -- these aren't map-linkable):`,
    ...(catalystLines.length ? catalystLines : ["(none on file)"]),
    "",
    "RECENT ACTIVITY (last 20 status updates):",
    ...(updateLines.length ? updateLines : ["(none recorded)"]),
    "",
    "UPCOMING DECISIONS:",
    ...(decisionLines.length ? decisionLines : ["(none scheduled)"]),
  ].join("\n");

  return { context, keyMap };
}
