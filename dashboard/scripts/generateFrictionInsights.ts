// One-off/rerunnable script: fills in ai_insight for every
// development_friction_cases row that doesn't have one yet, using the
// row's own already-sourced structured facts as the only input (same
// grounding discipline as src/app/api/ask/route.ts's ANTHROPIC_API_KEY
// usage) -- never invents anything the row doesn't already state. Run
// manually after seeding new cases, not generated live on page render
// (same cost/latency tradeoff already made for /api/ask).

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required -- run via \`npm run generate:friction-insights\` from dashboard/ so .env.local loads.`);
  return value;
}

type FrictionCaseRow = {
  id: string;
  project_name: string;
  developer_name: string | null;
  project_type: string | null;
  original_plan_summary: string;
  friction_type: string;
  concerns: string[];
  decision_makers: string[];
  response_summary: string | null;
  outcome: string;
  final_plan_summary: string | null;
  impact_units_lost: number | null;
  impact_density_reduction: string | null;
  impact_added_conditions: string[];
  impact_time_delay: string | null;
  impact_added_cost_usd: number | null;
  impact_project_failed: boolean;
};

function buildPrompt(c: FrictionCaseRow): string {
  const lines = [
    `Project: ${c.project_name}${c.developer_name ? ` (developer/applicant: ${c.developer_name})` : ""}${c.project_type ? ` — ${c.project_type}` : ""}`,
    `Original plan: ${c.original_plan_summary}`,
    `Friction type: ${c.friction_type}`,
    c.concerns.length > 0 ? `Documented concerns: ${c.concerns.join("; ")}` : null,
    c.decision_makers.length > 0 ? `Decision-makers involved: ${c.decision_makers.join(", ")}` : null,
    c.response_summary ? `Response: ${c.response_summary}` : null,
    `Outcome: ${c.outcome}`,
    c.final_plan_summary ? `Final/resulting plan: ${c.final_plan_summary}` : null,
    c.impact_units_lost != null ? `Units lost: ${c.impact_units_lost}` : null,
    c.impact_density_reduction ? `Density reduction: ${c.impact_density_reduction}` : null,
    c.impact_added_conditions.length > 0 ? `Added conditions: ${c.impact_added_conditions.join("; ")}` : null,
    c.impact_time_delay ? `Time delay: ${c.impact_time_delay}` : null,
    c.impact_added_cost_usd != null ? `Added cost: $${c.impact_added_cost_usd.toLocaleString()}` : null,
    c.impact_project_failed ? "The project ultimately failed." : null,
  ].filter((line): line is string => line != null);

  return (
    "Below are the fully-sourced, documented facts of one real development friction case. Write a short insight " +
    "(2-4 plain sentences, no markdown, no bullet points) explaining what happened, why it mattered, and what " +
    "another developer evaluating a similar site could learn from it. Use ONLY the facts given below -- never " +
    "add a fact, number, date, or reason that isn't stated here.\n\n" +
    lines.join("\n")
  );
}

async function main() {
  const supabaseUrl = envOrThrow("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = envOrThrow("SUPABASE_SERVICE_ROLE_KEY");
  const apiKey = envOrThrow("ANTHROPIC_API_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const anthropic = new Anthropic({ apiKey });

  const { data: cases, error } = await supabase
    .from("development_friction_cases")
    .select(
      "id, project_name, developer_name, project_type, original_plan_summary, friction_type, concerns, decision_makers, response_summary, outcome, final_plan_summary, impact_units_lost, impact_density_reduction, impact_added_conditions, impact_time_delay, impact_added_cost_usd, impact_project_failed"
    )
    .is("ai_insight", null)
    .returns<FrictionCaseRow[]>();

  if (error) throw new Error(`Failed to fetch cases: ${error.message}`);
  if (!cases || cases.length === 0) {
    console.log("No development_friction_cases rows need an insight.");
    return;
  }

  console.log(`Generating insight for ${cases.length} case(s)...`);

  for (const c of cases) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 400,
      messages: [{ role: "user", content: buildPrompt(c) }],
    });

    const insight = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join(" ")
      .trim();

    if (!insight) {
      console.error(`  ! ${c.project_name}: model returned no text, skipping`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("development_friction_cases")
      .update({ ai_insight: insight, ai_insight_generated_at: new Date().toISOString() })
      .eq("id", c.id);

    if (updateError) {
      console.error(`  ! ${c.project_name}: failed to save insight: ${updateError.message}`);
      continue;
    }

    console.log(`  ${c.project_name}: ${insight}`);
  }
}

main().catch((error) => {
  console.error("Insight generation failed:", error);
  process.exit(1);
});
