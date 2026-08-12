"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export async function createDecision(formData: FormData) {
  const supabase = createClient();

  const marketId = str(formData, "market_id");
  const title = str(formData, "title");
  const decisionType = str(formData, "decision_type");
  const decisionDate = str(formData, "decision_date");

  // RLS (is_admin()) is the real gate; this just avoids a confusing
  // partial insert if a required field was skipped client-side.
  if (!marketId || !title || !decisionType || !decisionDate) {
    throw new Error("Market, title, decision type, and date are required.");
  }

  let sourceId: string | null = null;
  const sourceAgency = str(formData, "source_agency");
  const sourceUrl = str(formData, "source_url");
  if (sourceAgency && sourceUrl) {
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .insert({
        agency: sourceAgency,
        title: str(formData, "source_title"),
        source_type: str(formData, "source_type") ?? "other",
        url: sourceUrl,
        published_date: str(formData, "source_published_date"),
      })
      .select("id")
      .single();

    if (sourceError || !source) {
      throw new Error(sourceError?.message ?? "Failed to save source.");
    }
    sourceId = source.id;
  }

  const { error } = await supabase.from("upcoming_decisions").insert({
    market_id: marketId,
    project_id: str(formData, "project_id"),
    title,
    decision_type: decisionType,
    description: str(formData, "description"),
    decision_date: decisionDate,
    status: str(formData, "status") ?? "scheduled",
    source_id: sourceId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/decisions");
}

export async function updateDecisionStatus(formData: FormData) {
  const supabase = createClient();

  const decisionId = str(formData, "decision_id");
  const status = str(formData, "status");

  if (!decisionId || !status) {
    throw new Error("Decision and new status are required.");
  }

  const { error } = await supabase
    .from("upcoming_decisions")
    .update({ status, outcome: str(formData, "outcome") })
    .eq("id", decisionId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/decisions");
}
