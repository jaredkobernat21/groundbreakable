"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function csvArray(formData: FormData, key: string): string[] {
  const raw = str(formData, key);
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

// Operator-only (RLS partner_requests_update_admin) -- every field past
// submission is filled in by whoever is working the request. Manual for
// the MVP on purpose (spec: "manual work behind the scenes is
// acceptable... this operator dashboard is essential because the manual
// service is part of how we learn what should eventually become
// automated").
export async function updatePartnerRequest(requestId: string, formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase
    .from("partner_requests")
    .update({
      status: str(formData, "status") ?? "submitted",
      priority: str(formData, "priority") ?? "normal",
      assigned_to: str(formData, "assigned_to"),
      findings_summary: str(formData, "findings_summary"),
      ownership_notes: str(formData, "ownership_notes"),
      planning_history: str(formData, "planning_history"),
      infrastructure_notes: str(formData, "infrastructure_notes"),
      zoning_notes: str(formData, "zoning_notes"),
      risks: str(formData, "risks"),
      suggested_next_steps: str(formData, "suggested_next_steps"),
      source_links: csvArray(formData, "source_links"),
      contact_name: str(formData, "contact_name"),
      contact_method: str(formData, "contact_method"),
      contact_notes: str(formData, "contact_notes"),
      outreach_message: str(formData, "outreach_message"),
      response_notes: str(formData, "response_notes"),
      internal_notes: str(formData, "internal_notes"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/partner-requests");
  revalidatePath(`/dashboard/admin/partner-requests/${requestId}`);
  revalidatePath("/dashboard/partner-desk");
}
