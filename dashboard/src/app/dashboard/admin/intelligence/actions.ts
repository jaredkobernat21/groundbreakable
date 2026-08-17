"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deriveStageFromStatus } from "@/lib/activityPhase";
import type { PlanCategory, ProjectStatus } from "@/lib/types";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value !== null ? Number(value) : null;
}

// A source citing its own agency's records is about as primary as
// evidence gets; a press release or news writeup is secondary even when
// reliable. "other" stays unclassified rather than guessed.
function sourceQuality(sourceType: string | null): "primary_government" | "secondary" | null {
  if (sourceType === "agency_document" || sourceType === "agency_gis" || sourceType === "public_record") return "primary_government";
  if (sourceType === "press_release" || sourceType === "news") return "secondary";
  return null;
}

export async function createSignal(formData: FormData) {
  const supabase = createClient();

  const marketId = str(formData, "market_id");
  const title = str(formData, "title");
  const planCategory = str(formData, "plan_category") as PlanCategory | null;
  const status = str(formData, "status") as ProjectStatus | null;
  const latitude = num(formData, "latitude");
  const longitude = num(formData, "longitude");
  const sourceAgency = str(formData, "source_agency");
  const sourceUrl = str(formData, "source_url");

  // RLS (is_admin()) is the real gate; these just avoid a confusing
  // partial insert if a required field was skipped client-side.
  if (!marketId || !title || !planCategory || !status || latitude === null || longitude === null) {
    throw new Error("Market, title, plan category, status, and coordinates are required.");
  }
  if (!sourceAgency || !sourceUrl) {
    throw new Error("Source agency and source URL are required — every signal must cite a source.");
  }

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

  const dateAnnounced = str(formData, "date_announced");
  const confidence = str(formData, "confidence") ?? "reported";
  const sourceType = str(formData, "source_type");

  // plan_category/stage are set directly rather than left to a DB trigger
  // to derive from category/status -- see the Phase 7 Tier 3 migration
  // that dropped that trigger after finding it silently overwrote
  // explicit plan_category values set elsewhere (review-queue/actions.ts).
  // category/status themselves are legacy and no longer written for new
  // rows (see types.ts) -- project_events.status below is what actually
  // carries this creation's status going forward.
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      market_id: marketId,
      title,
      subcategory: str(formData, "subcategory"),
      plan_category: planCategory,
      project_type: str(formData, "project_type"),
      stage: deriveStageFromStatus(status),
      case_number: str(formData, "case_number"),
      description: str(formData, "description"),
      address: str(formData, "address"),
      latitude,
      longitude,
      project_value: num(formData, "project_value"),
      units: num(formData, "units"),
      acreage: num(formData, "acreage"),
      developer: str(formData, "developer"),
      investor: str(formData, "investor"),
      contractor: str(formData, "contractor"),
      date_announced: dateAnnounced,
      source_id: source.id,
      confidence,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Failed to save signal.");
  }

  // Writes directly to project_events now instead of project_updates --
  // Timeline and the Project detail page have read project_events since
  // Phase 3/4, so writing anywhere else would mean this signal's own
  // creation never shows up in its own history there.
  await supabase.from("project_events").insert({
    project_id: project.id,
    event_type: status,
    status,
    note: "Signal created.",
    source_id: source.id,
    occurred_on: dateAnnounced ?? new Date().toISOString().slice(0, 10),
    confidence,
    source_quality: sourceQuality(sourceType),
    verification_status: "human_reviewed",
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timeline");
  revalidatePath("/dashboard/admin/intelligence");
}

export async function logStatusUpdate(formData: FormData) {
  const supabase = createClient();

  const projectId = str(formData, "project_id");
  const status = str(formData, "status") as ProjectStatus | null;
  const occurredOn = str(formData, "occurred_on") ?? new Date().toISOString().slice(0, 10);

  if (!projectId || !status) {
    throw new Error("Project and new status are required.");
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({ stage: deriveStageFromStatus(status), last_verified_at: new Date().toISOString() })
    .eq("id", projectId);

  if (updateError) throw new Error(updateError.message);

  const { error: historyError } = await supabase.from("project_events").insert({
    project_id: projectId,
    event_type: status,
    status,
    note: str(formData, "note"),
    occurred_on: occurredOn,
    confidence: "reported",
    verification_status: "human_reviewed",
  });

  if (historyError) throw new Error(historyError.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timeline");
  revalidatePath("/dashboard/admin/intelligence");
}
