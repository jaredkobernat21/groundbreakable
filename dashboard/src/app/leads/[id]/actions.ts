"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeGroundbreakableScore } from "@/lib/leads/scoring";
import type { GblLead, GblProperty, GblPropertyIntelligence } from "@/lib/leads/types";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value !== null ? Number(value) : null;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "1" || formData.get(key) === "true";
}

async function currentUserEmail(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export async function updatePipelineStatus(leadId: string, formData: FormData) {
  const supabase = createClient();
  const status = str(formData, "pipeline_status");
  if (!status) throw new Error("Status is required.");

  const { error } = await supabase.from("gbl_leads").update({ pipeline_status: status }).eq("id", leadId);
  if (error) throw new Error(error.message);

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  revalidatePath("/leads/pipeline");
}

export async function logInteraction(leadId: string, formData: FormData) {
  const supabase = createClient();
  const interactionType = str(formData, "interaction_type");
  if (!interactionType) throw new Error("Interaction type is required.");

  const author = await currentUserEmail();
  const { error } = await supabase.from("gbl_interactions").insert({
    lead_id: leadId,
    interaction_type: interactionType,
    notes: str(formData, "notes"),
    outcome: str(formData, "outcome"),
    author,
  });
  if (error) throw new Error(error.message);

  // Logging an outbound touch updates last_contacted_at; some interaction
  // types (Interested / Not Interested / Wrong Number) also move the
  // pipeline forward automatically since they ARE the outcome of contact.
  const updates: Partial<GblLead> = {};
  if (["called", "texted", "emailed"].includes(interactionType)) {
    updates.last_contacted_at = new Date().toISOString();
  }
  if (interactionType === "interested") updates.pipeline_status = "interested";
  if (interactionType === "not_interested") updates.pipeline_status = "not_a_fit";
  if (interactionType === "do_not_contact") {
    updates.pipeline_status = "do_not_contact";
    updates.dnc_status = true;
  }

  if (Object.keys(updates).length > 0) {
    const { error: leadError } = await supabase.from("gbl_leads").update(updates).eq("id", leadId);
    if (leadError) throw new Error(leadError.message);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function setFollowUp(leadId: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gbl_leads")
    .update({ next_follow_up: str(formData, "next_follow_up") })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function updateNote(leadId: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("gbl_leads").update({ note: str(formData, "note") }).eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function updateDnc(leadId: string, formData: FormData) {
  const supabase = createClient();
  const dncStatus = bool(formData, "dnc_status");
  const { error } = await supabase
    .from("gbl_leads")
    .update({
      dnc_status: dncStatus,
      dnc_checked_at: new Date().toISOString().slice(0, 10),
      dnc_notes: str(formData, "dnc_notes"),
      pipeline_status: dncStatus ? "do_not_contact" : undefined,
    })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function addContact(leadId: string, formData: FormData) {
  const supabase = createClient();
  const type = str(formData, "type");
  const value = str(formData, "value");
  if (!type || !value) throw new Error("Type and value are required.");

  const { error } = await supabase.from("gbl_contacts").insert({
    lead_id: leadId,
    type,
    value,
    phone_type: str(formData, "phone_type"),
    source: str(formData, "source") ?? "manual",
    confidence: str(formData, "confidence") ?? "unknown",
    verified_at: str(formData, "verified_at"),
    notes: str(formData, "notes"),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function upsertIntelligence(propertyId: string, formData: FormData) {
  const supabase = createClient();

  const payload = {
    property_id: propertyId,
    water_type: str(formData, "water_type"),
    water_provider: str(formData, "water_provider"),
    water_confidence: str(formData, "water_confidence") ?? "unknown",
    sewer_type: str(formData, "sewer_type"),
    sewer_confidence: str(formData, "sewer_confidence") ?? "unknown",
    electric_provider: str(formData, "electric_provider"),
    electric_confidence: str(formData, "electric_confidence") ?? "unknown",
    gas_type: str(formData, "gas_type"),
    gas_confidence: str(formData, "gas_confidence") ?? "unknown",
    road_frontage: str(formData, "road_frontage"),
    road_access_type: str(formData, "road_access_type"),
    road_notes: str(formData, "road_notes"),
    road_confidence: str(formData, "road_confidence") ?? "unknown",
    topography: str(formData, "topography"),
    flood_zone: str(formData, "flood_zone"),
    drainage_notes: str(formData, "drainage_notes"),
    environmental_flags: str(formData, "environmental_flags"),
    easements: str(formData, "easements"),
    site_confidence: str(formData, "site_confidence") ?? "unknown",
    permit_found: formData.get("permit_found") ? bool(formData, "permit_found") : null,
    permit_date: str(formData, "permit_date"),
    permit_status: str(formData, "permit_status"),
    permit_jurisdiction: str(formData, "permit_jurisdiction"),
    permit_notes: str(formData, "permit_notes"),
    permit_confidence: str(formData, "permit_confidence") ?? "unknown",
  };

  const { error } = await supabase.from("gbl_property_intelligence").upsert(payload, { onConflict: "property_id" });
  if (error) throw new Error(error.message);

  revalidatePath(`/leads`);
}

export async function addResearch(propertyId: string, formData: FormData) {
  const supabase = createClient();
  const category = str(formData, "category");
  const finding = str(formData, "finding");
  if (!category || !finding) throw new Error("Category and finding are required.");

  const author = await currentUserEmail();
  const { error } = await supabase.from("gbl_research").insert({
    property_id: propertyId,
    category,
    finding,
    source_url: str(formData, "source_url"),
    verification_status: str(formData, "verification_status") ?? "needs_confirmation",
    author,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/leads`);
}

export async function recalculateScore(leadId: string) {
  const supabase = createClient();

  const { data: lead } = await supabase.from("gbl_leads").select("*").eq("id", leadId).single<GblLead>();
  if (!lead) throw new Error("Lead not found.");

  const { data: property } = await supabase
    .from("gbl_properties")
    .select("*")
    .eq("id", lead.property_id)
    .single<GblProperty>();
  if (!property) throw new Error("Property not found.");

  const { data: intelligence } = await supabase
    .from("gbl_property_intelligence")
    .select("*")
    .eq("property_id", lead.property_id)
    .maybeSingle<GblPropertyIntelligence>();

  const { score, reasons } = computeGroundbreakableScore(property, lead, intelligence ?? null);

  const { error } = await supabase.from("gbl_leads").update({ score, score_reasons: reasons }).eq("id", leadId);
  if (error) throw new Error(error.message);

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function createBuildProject(leadId: string, propertyId: string, formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.from("gbl_build_projects").insert({
    lead_id: leadId,
    property_id: propertyId,
    timeline: str(formData, "timeline"),
    desired_sqft: num(formData, "desired_sqft"),
    bedrooms: num(formData, "bedrooms"),
    bathrooms: num(formData, "bathrooms"),
    garage: str(formData, "garage"),
    basement: str(formData, "basement"),
    style: str(formData, "style"),
    budget: str(formData, "budget"),
    goals: str(formData, "goals"),
    uncertainties: str(formData, "uncertainties"),
    architect_status: str(formData, "architect_status"),
    builder_status: str(formData, "builder_status"),
    lender_status: str(formData, "lender_status"),
    notes: str(formData, "notes"),
  });
  if (error) throw new Error(error.message);

  await supabase.from("gbl_leads").update({ pipeline_status: "build_plan" }).eq("id", leadId);

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  revalidatePath("/leads/pipeline");
}
