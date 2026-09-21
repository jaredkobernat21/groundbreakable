import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { SLADE_TOOLS, executeSladeTool, describeToolCall } from "@/lib/slade/tools";

// SLADE's chat endpoint -- see SLADE/docs/DASHBOARD_INTEGRATION.md. Deliberately
// separate from /api/ask (investor-facing, read-only over investor-visible
// data): this route is admin-only and has write access to every slade_*
// table. Not covered by middleware.ts's matcher, so it does its own auth
// check, same as /api/ask.

const SYSTEM_PROMPT = `You are SLADE, Jared's internal operating agent for Groundbreakable (see SLADE/SLADE_BIBLE.md). \
You are not customer-facing -- nobody outside Groundbreakable ever sees this conversation or its data.

The Supabase database is the source of truth, not this conversation. Read before answering -- don't assume you already \
know something because it was mentioned earlier in this chat; re-resolve it with a tool call if it matters. When Jared \
tells you something durable (a buy box detail, a status change, a fact about a site, a follow-up date), write it to the \
database in the same turn using the matching tool, not just in your reply.

Rules:
- Resolve a named entity (a person's name, a company, a property) with resolve_entity before acting on it, unless you \
  already have its id from earlier in this same turn's tool calls. If resolve_entity returns more than one plausible \
  match, ask Jared which one rather than guessing.
- Use find_or_create_contact / find_or_create_organization / find_or_create_site instead of assuming something is new \
  -- they check for duplicates first.
- Never invent a contact, site, buy box, market event, or outreach history. If it isn't in the database and Jared \
  hasn't just told you, say you don't have it.
- Every claim about a property or market fact must be traceable to a verification_status (verified, inferred, \
  needs_verification, conflicting, stale). Never state an unverified fact as settled -- say what's known, what's \
  inferred, and what's still open.
- An opportunity cannot go to ready_to_deliver without passing all 9 verification checks (evaluate_verification_gate \
  tells you which are outstanding) -- this is also enforced by the database itself.
- Be plain and direct. "I don't have that yet" is a complete, acceptable answer. Show your work: what you checked, \
  what you found, what's still open. No inflated confidence.
- Today's date is ${new Date().toISOString().slice(0, 10)}.`;

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

const MAX_TOOL_ITERATIONS = 8;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "SLADE isn't configured yet — ANTHROPIC_API_KEY is missing from the server environment." }, { status: 503 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data: profile } = await supabase.from("investor_profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "SLADE is admin-only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const history = Array.isArray(body?.messages) ? (body.messages as ChatTurn[]) : [];
  const question = typeof body?.message === "string" ? body.message.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  // Prior turns are replayed as plain text only -- SLADE re-resolves
  // whatever it needs fresh from the database each turn rather than
  // trusting stale tool results from earlier in the conversation (see
  // SLADE_BIBLE.md: the database is the source of truth, not conversational
  // memory). Keeps the request payload bounded regardless of how long the
  // chat runs, too.
  const messages: Anthropic.MessageParam[] = [
    ...history.map((turn): Anthropic.MessageParam => ({ role: turn.role, content: turn.text })),
    { role: "user", content: question },
  ];

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const actions: string[] = [];

  try {
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools: SLADE_TOOLS,
        messages,
      });

      const toolUses = response.content.filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");

      if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
        const text = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n")
          .trim();
        return NextResponse.json({
          reply: text || "(no response)",
          messages: [...history, { role: "user", text: question }, { role: "assistant", text }],
          actions,
        });
      }

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUses) {
        actions.push(describeToolCall(toolUse.name, toolUse.input as Record<string, unknown>));
        try {
          const result = await executeSladeTool(supabase, toolUse.name, toolUse.input as Record<string, unknown>, { changedBy: user.email });
          toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(result ?? null) });
        } catch (error) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Error: ${error instanceof Error ? error.message : String(error)}`,
            is_error: true,
          });
        }
      }
      messages.push({ role: "user", content: toolResults });
    }

    return NextResponse.json({ error: "SLADE took too many steps on that request — try breaking it into smaller asks." }, { status: 502 });
  } catch (error) {
    console.error("SLADE chat failed", error);
    return NextResponse.json({ error: "SLADE failed — try again in a moment." }, { status: 502 });
  }
}
