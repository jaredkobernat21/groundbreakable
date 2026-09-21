"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createBuyBox, updateBuyBox } from "@/lib/slade";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value !== null ? Number(value) : null;
}

function arr(formData: FormData, key: string): string[] {
  const raw = str(formData, key);
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

// Tri-state: an unchecked "unspecified" radio leaves the requirement
// genuinely unknown (null) rather than forcing it to false -- a buy box
// that never mentioned rail access shouldn't read as "rail access not
// required," it should read as "not asked yet." See SLADE/DATA_MODEL.md.
function triBool(formData: FormData, key: string): boolean | null {
  const value = formData.get(key);
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function buyBoxFieldsFromForm(formData: FormData) {
  return {
    name: str(formData, "name") ?? "Primary",
    active: formData.get("active") === "on",
    target_markets: arr(formData, "target_markets"),
    asset_types: arr(formData, "asset_types"),
    min_acres: num(formData, "min_acres"),
    max_acres: num(formData, "max_acres"),
    min_price: num(formData, "min_price"),
    max_price: num(formData, "max_price"),
    preferred_deal_types: arr(formData, "preferred_deal_types"),
    preferred_distress_signals: arr(formData, "preferred_distress_signals"),
    zoning_preferences: arr(formData, "zoning_preferences"),
    entitlement_preferences: str(formData, "entitlement_preferences"),
    excluded_uses: arr(formData, "excluded_uses"),
    requires_sewer: triBool(formData, "requires_sewer"),
    requires_water: triBool(formData, "requires_water"),
    requires_highway_access: triBool(formData, "requires_highway_access"),
    requires_rail_access: triBool(formData, "requires_rail_access"),
    notes: str(formData, "notes"),
    source: str(formData, "source"),
    last_verified_at: str(formData, "last_verified_at"),
  };
}

export async function createBuyBoxAction(formData: FormData) {
  const supabase = createClient();

  const contactId = str(formData, "contact_id");
  if (!contactId) throw new Error("A contact is required for a buy box.");

  await createBuyBox(supabase, { contact_id: contactId, ...buyBoxFieldsFromForm(formData) });

  revalidatePath("/dashboard/admin/slade/buy-boxes");
}

export async function updateBuyBoxAction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const id = str(formData, "id");
  if (!id) throw new Error("Missing buy box id.");

  await updateBuyBox(supabase, id, buyBoxFieldsFromForm(formData), user?.email ?? undefined);

  revalidatePath("/dashboard/admin/slade/buy-boxes");
}
