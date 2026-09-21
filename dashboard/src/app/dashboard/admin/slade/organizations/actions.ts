"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findOrCreateOrganization, updateOrganization } from "@/lib/slade";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

// Manual entry goes through the same lib/slade service functions the SLADE
// chat endpoint uses -- one code path, whether a record was typed into a
// form or said in conversation. See SLADE/ARCHITECTURE.md.
export async function createOrganizationAction(formData: FormData) {
  const supabase = createClient();

  const name = str(formData, "name");
  if (!name) throw new Error("Organization name is required.");

  await findOrCreateOrganization(supabase, {
    name,
    type: str(formData, "type") as never,
    website: str(formData, "website"),
    primary_market_id: str(formData, "primary_market_id"),
    relationship_status: (str(formData, "relationship_status") ?? "unknown") as never,
    notes: str(formData, "notes"),
  });

  revalidatePath("/dashboard/admin/slade/organizations");
}

export async function updateOrganizationAction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const id = str(formData, "id");
  if (!id) throw new Error("Missing organization id.");

  await updateOrganization(
    supabase,
    id,
    {
      name: str(formData, "name") ?? undefined,
      type: str(formData, "type") as never,
      website: str(formData, "website"),
      primary_market_id: str(formData, "primary_market_id"),
      relationship_status: (str(formData, "relationship_status") ?? "unknown") as never,
      notes: str(formData, "notes"),
    },
    user?.email ?? undefined
  );

  revalidatePath("/dashboard/admin/slade/organizations");
}
