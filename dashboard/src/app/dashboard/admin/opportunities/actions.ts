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

export async function createOpportunity(formData: FormData) {
  const supabase = createClient();

  const marketId = str(formData, "market_id");
  const address = str(formData, "address");
  const signals = formData.getAll("signals").filter((v): v is string => typeof v === "string" && v.length > 0);
  const latitude = num(formData, "latitude");
  const longitude = num(formData, "longitude");
  const whyFlagged = str(formData, "why_flagged");
  const sourceAgency = str(formData, "source_agency");
  const sourceUrl = str(formData, "source_url");

  // RLS (is_admin()) is the real gate; these just avoid a confusing
  // partial insert if a required field was skipped client-side.
  if (!marketId || !address || signals.length === 0 || latitude === null || longitude === null) {
    throw new Error("Market, address, at least one signal, and coordinates are required.");
  }
  if (!whyFlagged) {
    throw new Error("Why Groundbreakable flagged it is required — every opportunity must state its rationale.");
  }
  if (!sourceAgency || !sourceUrl) {
    throw new Error("Source agency and source URL are required — every opportunity must cite a source.");
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

  const distressRaw = str(formData, "distress_indicators");
  const distressIndicators = distressRaw
    ? distressRaw
        .split(",")
        .map((s) => s.trim().toLowerCase().replace(/\s+/g, "_"))
        .filter(Boolean)
    : null;

  const dateIdentified = str(formData, "date_identified");
  const confidence = str(formData, "confidence") ?? "reported";

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .insert({
      market_id: marketId,
      address,
      latitude,
      longitude,
      listing_status: str(formData, "listing_status"),
      owner_name: str(formData, "owner_name"),
      is_absentee: formData.get("is_absentee") === "on",
      years_owned: num(formData, "years_owned"),
      estimated_equity: num(formData, "estimated_equity"),
      assessed_value: num(formData, "assessed_value"),
      distress_indicators: distressIndicators,
      opportunity_score: num(formData, "opportunity_score"),
      why_flagged: whyFlagged,
      date_identified: dateIdentified,
      asking_price: num(formData, "asking_price"),
      estimated_resale_value: num(formData, "estimated_resale_value"),
      original_list_price: num(formData, "original_list_price"),
      lot_size_acres: num(formData, "lot_size_acres"),
      code_violation_count: num(formData, "code_violation_count"),
      code_violation_summary: str(formData, "code_violation_summary"),
      vacant_since: str(formData, "vacant_since"),
      zoning_district: str(formData, "zoning_district"),
      permitted_uses: str(formData, "permitted_uses"),
      rezoning_potential: str(formData, "rezoning_potential"),
      buildability_notes: str(formData, "buildability_notes"),
      source_id: source.id,
      confidence,
    })
    .select("id")
    .single();

  if (opportunityError || !opportunity) {
    throw new Error(opportunityError?.message ?? "Failed to save opportunity.");
  }

  // Writes directly to the signals table now instead of
  // opportunities.signals[] -- see the Phase 7 Tier 3 migration that
  // dropped that column once nothing read it anymore. One row per
  // checked signal type, all sharing this opportunity's address/
  // coordinates/source/confidence.
  const { error: signalsError } = await supabase.from("signals").insert(
    signals.map((signalType) => ({
      market_id: marketId,
      opportunity_id: opportunity.id,
      address,
      latitude,
      longitude,
      signal_type: signalType,
      detected_date: dateIdentified,
      source_id: source.id,
      confidence,
    }))
  );

  if (signalsError) {
    throw new Error(signalsError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/opportunities");
}
