"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/lib/types";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value !== null ? Number(value) : null;
}

export async function createSignal(formData: FormData) {
  const supabase = createClient();

  const marketId = str(formData, "market_id");
  const title = str(formData, "title");
  const category = str(formData, "category");
  const status = str(formData, "status") as ProjectStatus | null;
  const latitude = num(formData, "latitude");
  const longitude = num(formData, "longitude");
  const sourceAgency = str(formData, "source_agency");
  const sourceUrl = str(formData, "source_url");

  // RLS (is_admin()) is the real gate; these just avoid a confusing
  // partial insert if a required field was skipped client-side.
  if (!marketId || !title || !category || !status || latitude === null || longitude === null) {
    throw new Error("Market, title, category, status, and coordinates are required.");
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

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      market_id: marketId,
      title,
      category,
      subcategory: str(formData, "subcategory"),
      status,
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
      confidence: str(formData, "confidence") ?? "reported",
    })
    .select("id")
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Failed to save signal.");
  }

  await supabase.from("project_updates").insert({
    project_id: project.id,
    status,
    note: "Signal created.",
    source_id: source.id,
    occurred_on: dateAnnounced ?? new Date().toISOString().slice(0, 10),
  });

  revalidatePath("/dashboard");
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
    .update({ status, last_verified_at: new Date().toISOString() })
    .eq("id", projectId);

  if (updateError) throw new Error(updateError.message);

  const { error: historyError } = await supabase.from("project_updates").insert({
    project_id: projectId,
    status,
    note: str(formData, "note"),
    occurred_on: occurredOn,
  });

  if (historyError) throw new Error(historyError.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/intelligence");
}
