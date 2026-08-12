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

export async function createCatalyst(formData: FormData) {
  const supabase = createClient();

  const marketId = str(formData, "market_id");
  const title = str(formData, "title");
  const catalystType = str(formData, "catalyst_type");
  const latitude = num(formData, "latitude");
  const longitude = num(formData, "longitude");
  const sourceAgency = str(formData, "source_agency");
  const sourceUrl = str(formData, "source_url");

  // RLS (is_admin()) is the real gate; these just avoid a confusing
  // partial insert if a required field was skipped client-side.
  if (!marketId || !title || !catalystType || latitude === null || longitude === null) {
    throw new Error("Market, title, catalyst type, and coordinates are required.");
  }
  if (!sourceAgency || !sourceUrl) {
    throw new Error("Source agency and source URL are required — every catalyst must cite a source.");
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

  const { error: catalystError } = await supabase.from("catalysts").insert({
    market_id: marketId,
    title,
    catalyst_type: catalystType,
    description: str(formData, "description"),
    address: str(formData, "address"),
    latitude,
    longitude,
    influence_radius_meters: num(formData, "influence_radius_meters") ?? 800,
    status: str(formData, "status") ?? "planned",
    estimated_value: num(formData, "estimated_value"),
    date_announced: str(formData, "date_announced"),
    source_id: source.id,
    confidence: str(formData, "confidence") ?? "reported",
  });

  if (catalystError) {
    throw new Error(catalystError.message);
  }

  revalidatePath("/dashboard/development-map");
  revalidatePath("/dashboard/admin/catalysts");
}
