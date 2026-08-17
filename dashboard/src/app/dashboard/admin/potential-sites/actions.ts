"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value !== null ? Number(value) : null;
}

export async function createPotentialSite(formData: FormData) {
  const supabase = createClient();

  const marketId = str(formData, "market_id");
  const title = str(formData, "title");
  const latitude = num(formData, "latitude");
  const longitude = num(formData, "longitude");
  const sourceAgency = str(formData, "source_agency");
  const sourceUrl = str(formData, "source_url");

  // RLS (is_admin()) is the real gate; these just avoid a confusing
  // partial insert if a required field was skipped client-side.
  if (!marketId || !title) {
    throw new Error("Market and title are required.");
  }
  if (!sourceAgency || !sourceUrl) {
    throw new Error("Source agency and source URL are required — every Potential Site must cite a source.");
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

  const { error } = await supabase.from("potential_sites").insert({
    market_id: marketId,
    growth_area_id: str(formData, "growth_area_id"),
    title,
    address: str(formData, "address"),
    latitude,
    longitude,
    tier: str(formData, "tier") ?? "watch",
    development_context: str(formData, "development_context"),
    source_id: source.id,
    confidence: str(formData, "confidence") ?? "reported",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/potential-sites");
}
