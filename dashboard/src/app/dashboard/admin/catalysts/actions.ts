"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeCatalystScore } from "@/lib/catalysts/score";
import { computeDataCenterSignalConfidence, type DataCenterSignalCategory } from "@/lib/catalysts/dataCenterSignal";
import type { CatalystType } from "@/lib/types";

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

  const boundaryRaw = str(formData, "boundary");
  let boundary: unknown = null;
  if (boundaryRaw) {
    try {
      boundary = JSON.parse(boundaryRaw);
    } catch {
      throw new Error("Watch zone boundary must be valid GeoJSON (Polygon or MultiPolygon).");
    }
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

  const relatedContextRaw = str(formData, "related_context");
  const relatedContext = relatedContextRaw
    ? relatedContextRaw.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  // Potential-data-center investigation fields -- checkboxes only rendered/
  // meaningful when catalyst_type === 'potential_data_center', but reading
  // them unconditionally is harmless (empty array/null confidence for every
  // other type).
  const signalCategories = formData
    .getAll("signal_categories")
    .filter((v): v is string => typeof v === "string" && v.length > 0) as DataCenterSignalCategory[];
  const powerLoadMw = num(formData, "power_load_mw");
  const signalConfidence = computeDataCenterSignalConfidence(signalCategories, powerLoadMw);

  const boundedEstimatedValue = num(formData, "estimated_value");
  const influenceRadiusMeters = num(formData, "influence_radius_meters") ?? 800;

  // catalyst_score/reason are admin-editable, but if left blank the form
  // ships a computed starting suggestion instead -- same "computed
  // recommendation, human decides" convention as is_spotlight.
  const manualScore = num(formData, "catalyst_score");
  const manualReason = str(formData, "reason_for_catalyst_classification");
  const suggested = computeCatalystScore({
    catalyst_type: catalystType as CatalystType,
    estimated_value: boundedEstimatedValue,
    influence_radius_meters: influenceRadiusMeters,
    boundary,
    related_context: relatedContext,
    signal_categories: signalCategories,
  });

  const { error: catalystError } = await supabase.from("catalysts").insert({
    market_id: marketId,
    title,
    catalyst_type: catalystType,
    description: str(formData, "description"),
    address: str(formData, "address"),
    latitude,
    longitude,
    influence_radius_meters: influenceRadiusMeters,
    boundary,
    status: str(formData, "status") ?? "rumored",
    estimated_value: boundedEstimatedValue,
    estimated_scale_note: str(formData, "estimated_scale_note"),
    expected_timeline: str(formData, "expected_timeline"),
    why_it_matters: str(formData, "why_it_matters"),
    development_impact: str(formData, "development_impact"),
    related_context: relatedContext,
    related_shift_id: str(formData, "related_shift_id"),
    related_entitlement_case_id: str(formData, "related_entitlement_case_id"),
    date_announced: str(formData, "date_announced"),
    source_id: source.id,
    confidence: str(formData, "confidence") ?? "reported",
    catalyst_score: manualScore ?? suggested.score,
    reason_for_catalyst_classification: manualReason ?? suggested.components.filter((c) => c.evidence.length > 0).flatMap((c) => c.evidence).join(" "),
    signal_categories: signalCategories,
    signal_confidence: signalConfidence,
    power_load_mw: powerLoadMw,
  });

  if (catalystError) {
    throw new Error(catalystError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/catalysts");
}

// Catalyst Spotlight is a single editorial pick per market -- unset any
// prior spotlight in the same market before setting the new one, so the
// "one per market" rule holds even though the unique index only enforces
// it at commit time.
export async function setCatalystSpotlight(formData: FormData) {
  const supabase = createClient();

  const catalystId = str(formData, "catalyst_id");
  const marketId = str(formData, "market_id");
  if (!catalystId || !marketId) {
    throw new Error("Catalyst and market are required.");
  }

  const { error: clearError } = await supabase
    .from("catalysts")
    .update({ is_spotlight: false })
    .eq("market_id", marketId)
    .eq("is_spotlight", true);
  if (clearError) throw new Error(clearError.message);

  const { error: setError } = await supabase
    .from("catalysts")
    .update({ is_spotlight: true })
    .eq("id", catalystId);
  if (setError) throw new Error(setError.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/catalysts");
}

export async function clearCatalystSpotlight(formData: FormData) {
  const supabase = createClient();

  const catalystId = str(formData, "catalyst_id");
  if (!catalystId) {
    throw new Error("Catalyst is required.");
  }

  const { error } = await supabase.from("catalysts").update({ is_spotlight: false }).eq("id", catalystId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/catalysts");
}

// Moves a catalyst through the pre-permit pipeline and logs the transition
// to catalyst_events -- the only writer of that table today. Without this,
// the new event/history table (docs/DATA_INTELLIGENCE_PIPELINE.md §11's
// flagged gap) would stay permanently empty and status changes would go
// back to silently overwriting the one column with no record kept.
export async function updateCatalystStatus(formData: FormData) {
  const supabase = createClient();

  const catalystId = str(formData, "catalyst_id");
  const toStatus = str(formData, "status");
  const note = str(formData, "note");
  if (!catalystId || !toStatus) {
    throw new Error("Catalyst and new status are required.");
  }

  const { data: current, error: fetchError } = await supabase
    .from("catalysts")
    .select("status")
    .eq("id", catalystId)
    .single();
  if (fetchError || !current) throw new Error(fetchError?.message ?? "Catalyst not found.");

  if (current.status === toStatus) {
    revalidatePath("/dashboard/admin/catalysts");
    return;
  }

  const { error: updateError } = await supabase
    .from("catalysts")
    .update({ status: toStatus, last_verified_at: new Date().toISOString() })
    .eq("id", catalystId);
  if (updateError) throw new Error(updateError.message);

  const { error: eventError } = await supabase.from("catalyst_events").insert({
    catalyst_id: catalystId,
    event_type: "stage_change",
    from_status: current.status,
    to_status: toStatus,
    note,
  });
  if (eventError) throw new Error(eventError.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/catalysts");
}
