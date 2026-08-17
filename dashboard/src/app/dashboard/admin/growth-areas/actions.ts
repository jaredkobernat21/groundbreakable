"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

// growth_areas.geom is a MultiPolygon column, but hand-tracing a single
// contiguous area naturally produces a Polygon -- accept either and
// normalize, same as the Phase 1 migration's sync triggers do for
// opportunity_zones/parcels, rather than making the admin remember to
// double-wrap their coordinates.
function toMultiPolygon(geom: { type: string; coordinates: unknown }): { type: "MultiPolygon"; coordinates: unknown } {
  if (geom.type === "Polygon") return { type: "MultiPolygon", coordinates: [geom.coordinates] };
  if (geom.type === "MultiPolygon") return geom as { type: "MultiPolygon"; coordinates: unknown };
  throw new Error("Boundary must be a GeoJSON Polygon or MultiPolygon.");
}

export async function createGrowthArea(formData: FormData) {
  const supabase = createClient();

  const marketId = str(formData, "market_id");
  const name = str(formData, "name");
  const boundaryRaw = str(formData, "boundary");

  // RLS (is_admin()) is the real gate; these just avoid a confusing
  // partial insert if a required field was skipped client-side.
  if (!marketId || !name || !boundaryRaw) {
    throw new Error("Market, name, and a boundary are required.");
  }

  let geom: { type: string; coordinates: unknown };
  try {
    geom = JSON.parse(boundaryRaw);
  } catch {
    throw new Error("Boundary must be valid GeoJSON (Polygon or MultiPolygon).");
  }

  const { error } = await supabase.from("growth_areas").insert({
    market_id: marketId,
    name,
    momentum_state: str(formData, "momentum_state") ?? "emerging",
    narrative: str(formData, "narrative"),
    geom: toMultiPolygon(geom),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/growth-areas");
}
