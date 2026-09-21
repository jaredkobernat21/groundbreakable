"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findOrCreateContact, updateContact } from "@/lib/slade";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function arr(formData: FormData, key: string): string[] {
  const raw = str(formData, key);
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export async function createContactAction(formData: FormData) {
  const supabase = createClient();

  const firstName = str(formData, "first_name");
  if (!firstName) throw new Error("First name is required.");

  await findOrCreateContact(supabase, {
    first_name: firstName,
    last_name: str(formData, "last_name"),
    organization_id: str(formData, "organization_id"),
    title: str(formData, "title"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    linkedin_url: str(formData, "linkedin_url"),
    website: str(formData, "website"),
    markets: arr(formData, "markets"),
    relationship_type: str(formData, "relationship_type") as never,
    relationship_status: (str(formData, "relationship_status") ?? "unknown") as never,
    lead_status: (str(formData, "lead_status") ?? "never_contacted") as never,
    notes: str(formData, "notes"),
    next_follow_up_at: str(formData, "next_follow_up_at"),
  });

  revalidatePath("/dashboard/admin/slade/contacts");
}

export async function updateContactAction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const id = str(formData, "id");
  if (!id) throw new Error("Missing contact id.");

  await updateContact(
    supabase,
    id,
    {
      first_name: str(formData, "first_name") ?? undefined,
      last_name: str(formData, "last_name"),
      organization_id: str(formData, "organization_id"),
      title: str(formData, "title"),
      phone: str(formData, "phone"),
      email: str(formData, "email"),
      linkedin_url: str(formData, "linkedin_url"),
      website: str(formData, "website"),
      markets: arr(formData, "markets"),
      relationship_type: str(formData, "relationship_type") as never,
      relationship_status: (str(formData, "relationship_status") ?? "unknown") as never,
      lead_status: (str(formData, "lead_status") ?? "never_contacted") as never,
      notes: str(formData, "notes"),
      next_follow_up_at: str(formData, "next_follow_up_at"),
    },
    user?.email ?? undefined
  );

  revalidatePath("/dashboard/admin/slade/contacts");
}
