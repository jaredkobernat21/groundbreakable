"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export async function createOpportunityZone(formData: FormData) {
  const supabase = createClient();

  const marketId = str(formData, "market_id");
  const title = str(formData, "title");
  const boundaryRaw = str(formData, "boundary");
  const sourceAgency = str(formData, "source_agency");
  const sourceUrl = str(formData, "source_url");

  // RLS (is_admin()) is the real gate; these just avoid a confusing
  // partial insert if a required field was skipped client-side.
  if (!marketId || !title || !boundaryRaw) {
    throw new Error("Market, title, and a boundary are required.");
  }
  if (!sourceAgency || !sourceUrl) {
    throw new Error("Source agency and source URL are required — every zone must cite a source.");
  }

  let boundary: unknown;
  try {
    boundary = JSON.parse(boundaryRaw);
  } catch {
    throw new Error("Boundary must be valid GeoJSON (Polygon or MultiPolygon).");
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

  const { error: zoneError } = await supabase.from("opportunity_zones").insert({
    market_id: marketId,
    title,
    description: str(formData, "description"),
    zoning_district: str(formData, "zoning_district"),
    rezoning_notes: str(formData, "rezoning_notes"),
    boundary,
    source_id: source.id,
    confidence: str(formData, "confidence") ?? "reported",
  });

  if (zoneError) {
    throw new Error(zoneError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/opportunity-zones");
}
