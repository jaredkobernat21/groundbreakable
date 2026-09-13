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

// Corridor Intelligence (Groundbreakable Private, section 7) reuses
// growth_areas rather than a parallel table -- this just fills in the
// two columns it didn't already have (see the private-client-
// intelligence migration header) on an existing area.
export async function updateGrowthAreaCorridor(areaId: string, formData: FormData) {
  const supabase = createClient();

  const thesis = str(formData, "thesis");
  const timelineRaw = str(formData, "catalyst_timeline");

  let catalystTimeline: unknown = [];
  if (timelineRaw) {
    try {
      catalystTimeline = JSON.parse(timelineRaw);
    } catch {
      throw new Error("Catalyst Timeline must be valid JSON (an array of {year, label, status}).");
    }
  }

  const { error } = await supabase
    .from("growth_areas")
    .update({ thesis, catalyst_timeline: catalystTimeline, updated_at: new Date().toISOString() })
    .eq("id", areaId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/growth-areas");
  revalidatePath("/dashboard/private/corridors");
  revalidatePath(`/dashboard/private/corridors/${areaId}`);
}
