"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

// zoning_land_use.geom is a MultiPolygon column, but hand-tracing a single
// contiguous zone naturally produces a Polygon -- accept either and
// normalize, same pattern as growth-areas/actions.ts.
function toMultiPolygon(geom: { type: string; coordinates: unknown }): { type: "MultiPolygon"; coordinates: unknown } {
  if (geom.type === "Polygon") return { type: "MultiPolygon", coordinates: [geom.coordinates] };
  if (geom.type === "MultiPolygon") return geom as { type: "MultiPolygon"; coordinates: unknown };
  throw new Error("Boundary must be a GeoJSON Polygon or MultiPolygon.");
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

  let geom: { type: string; coordinates: unknown };
  try {
    geom = JSON.parse(boundaryRaw);
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

  // Writes directly to zoning_land_use now instead of opportunity_zones --
  // see the Phase 7 Tier 3 migration notes on mapLayers.ts reading from
  // zoning_land_use since the two tables no longer need a sync trigger
  // to stay aligned once this is the only write path. layer_type is
  // always 'current_zoning' here -- this form (and the map's Favorable
  // Zoning layer) has only ever represented present-day zoning, not
  // future land use or overlays.
  const { error: zoneError } = await supabase.from("zoning_land_use").insert({
    market_id: marketId,
    layer_type: "current_zoning",
    title,
    description: str(formData, "description"),
    district_code: str(formData, "zoning_district"),
    regulatory_notes: str(formData, "rezoning_notes"),
    geom: toMultiPolygon(geom),
    source_id: source.id,
    confidence: str(formData, "confidence") ?? "reported",
  });

  if (zoneError) {
    throw new Error(zoneError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/opportunity-zones");
}
