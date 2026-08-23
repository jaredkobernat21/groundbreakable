"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeGroundbreakableScore } from "@/lib/leads/scoring";
import type { City, GblLead, GblProperty, OwnerType, PropertyType } from "@/lib/leads/types";
import { CITY_OPTIONS } from "@/lib/leads/types";

export interface ImportRow {
  parcel_id: string | null;
  address: string;
  city: string | null;
  county: string | null;
  owner_name: string;
  mailing_address: string | null;
  sale_date: string | null;
  sale_price: number | null;
  acreage: number | null;
  property_type_raw: string | null;
  zoning: string | null;
  structure_raw: string | null;
  permits_raw: string | null;
  latitude: number | null;
  longitude: number | null;
}

function normalizeCity(raw: string | null): City {
  if (!raw) return "Unincorporated Johnson County";
  const match = CITY_OPTIONS.find((c) => c.toLowerCase() === raw.trim().toLowerCase());
  return match ?? "Other";
}

function guessOwnerType(ownerName: string): OwnerType {
  const n = ownerName.toUpperCase();
  if (/\bTRUST\b/.test(n)) return "trust";
  if (/\bLLC\b|\bL\.L\.C\.|\bINC\b|\bCORP\b|\bCOMPANY\b|\bLP\b|\bLLP\b/.test(n)) return "llc";
  if (/&| AND /.test(n) || /,/.test(n)) return "couple";
  return "individual";
}

function guessPropertyType(raw: string | null): PropertyType | null {
  if (!raw) return null;
  const t = raw.toLowerCase();
  if (t.includes("vacant")) return "vacant_residential";
  if ((t.includes("acre") || t.includes("acreage")) && !t.includes("agri") && !t.includes("farm")) return "residential_acreage";
  if (t.includes("agri") || t.includes("farm")) return "agricultural";
  if (t.includes("resid")) return "vacant_residential";
  return "other";
}

function guessBool(raw: string | null, trueWords: string[], falseWords: string[]): boolean | null {
  if (!raw) return null;
  const t = raw.trim().toLowerCase();
  if (trueWords.some((w) => t.includes(w))) return true;
  if (falseWords.some((w) => t.includes(w))) return false;
  return null;
}

export interface ImportResult {
  propertiesUpserted: number;
  leadsCreated: number;
  leadsSkippedExisting: number;
  errors: string[];
}

export async function importRows(rows: ImportRow[]): Promise<ImportResult> {
  const supabase = createClient();
  const result: ImportResult = { propertiesUpserted: 0, leadsCreated: 0, leadsSkippedExisting: 0, errors: [] };

  const withParcel = rows.filter((r) => r.parcel_id);
  const withoutParcel = rows.filter((r) => !r.parcel_id);

  function toPropertyPayload(r: ImportRow) {
    return {
      parcel_id: r.parcel_id,
      address: r.address,
      city: normalizeCity(r.city),
      county: r.county || "Johnson County",
      state: "KS",
      latitude: r.latitude,
      longitude: r.longitude,
      acreage: r.acreage,
      zoning: r.zoning,
      property_type: guessPropertyType(r.property_type_raw),
      existing_structure: guessBool(r.structure_raw, ["yes", "house", "residence", "existing", "true"], ["no", "vacant", "none", "false"]),
      sale_date: r.sale_date,
      sale_price: r.sale_price,
    };
  }

  const upsertedProperties: (GblProperty & { _row: ImportRow })[] = [];

  if (withParcel.length) {
    const { data, error } = await supabase
      .from("gbl_properties")
      .upsert(
        withParcel.map(toPropertyPayload),
        { onConflict: "parcel_id" }
      )
      .select("*")
      .returns<GblProperty[]>();
    if (error) result.errors.push(error.message);
    else data?.forEach((p, idx) => upsertedProperties.push({ ...p, _row: withParcel[idx] }));
  }

  if (withoutParcel.length) {
    const { data, error } = await supabase
      .from("gbl_properties")
      .upsert(
        withoutParcel.map(toPropertyPayload),
        { onConflict: "address,sale_date" }
      )
      .select("*")
      .returns<GblProperty[]>();
    if (error) result.errors.push(error.message);
    else data?.forEach((p, idx) => upsertedProperties.push({ ...p, _row: withoutParcel[idx] }));
  }

  result.propertiesUpserted = upsertedProperties.length;

  if (upsertedProperties.length === 0) {
    return result;
  }

  const { data: existingLeads } = await supabase
    .from("gbl_leads")
    .select("property_id")
    .in("property_id", upsertedProperties.map((p) => p.id));
  const existingPropertyIds = new Set((existingLeads ?? []).map((l) => l.property_id));

  const toCreate = upsertedProperties.filter((p) => !existingPropertyIds.has(p.id));
  result.leadsSkippedExisting = upsertedProperties.length - toCreate.length;

  for (const property of toCreate) {
    const ownerType = guessOwnerType(property._row.owner_name);
    const permitFound = guessBool(property._row.permits_raw, ["permit", "issued", "found"], ["none", "no permit", "not found"]);

    let intelligence = null;
    if (permitFound !== null) {
      const { data: intelRow } = await supabase
        .from("gbl_property_intelligence")
        .upsert({ property_id: property.id, permit_found: permitFound, permit_confidence: "unknown" }, { onConflict: "property_id" })
        .select("*")
        .single();
      intelligence = intelRow ?? null;
    }

    const { score, reasons } = computeGroundbreakableScore(
      property,
      { owner_type: ownerType },
      intelligence
    );

    const { data: lead, error: leadError } = await supabase
      .from("gbl_leads")
      .insert({
        property_id: property.id,
        owner_name: property._row.owner_name,
        owner_type: ownerType,
        score,
        score_reasons: reasons,
        source: "csv_import",
      })
      .select("id")
      .single<Pick<GblLead, "id">>();

    if (leadError || !lead) {
      result.errors.push(`${property._row.owner_name}: ${leadError?.message ?? "failed to create lead"}`);
      continue;
    }

    result.leadsCreated += 1;

    if (property._row.mailing_address) {
      await supabase.from("gbl_contacts").insert({
        lead_id: lead.id,
        type: "mailing_address",
        value: property._row.mailing_address,
        source: "csv_import",
        confidence: "likely",
      });
    }
  }

  revalidatePath("/leads");
  revalidatePath("/leads/pipeline");
  revalidatePath("/leads/map");

  return result;
}
