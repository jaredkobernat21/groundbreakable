import type { SupabaseClient } from "@supabase/supabase-js";
import type { SladeBuyBox, SladeContact } from "./types";
import { logChange } from "./changeLog";

export async function getBuyBox(supabase: SupabaseClient, id: string): Promise<SladeBuyBox | null> {
  const { data, error } = await supabase.from("slade_buy_boxes").select("*").eq("id", id).limit(1).returns<SladeBuyBox[]>();
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export type SladeBuyBoxWithContact = SladeBuyBox & { contact: SladeContact | null };

export async function listBuyBoxes(supabase: SupabaseClient): Promise<SladeBuyBoxWithContact[]> {
  const { data, error } = await supabase
    .from("slade_buy_boxes")
    .select("*, contact:slade_contacts(*)")
    .order("updated_at", { ascending: false })
    .returns<SladeBuyBoxWithContact[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getActiveBuyBoxesForContact(supabase: SupabaseClient, contactId: string): Promise<SladeBuyBox[]> {
  const { data, error } = await supabase
    .from("slade_buy_boxes")
    .select("*")
    .eq("contact_id", contactId)
    .eq("active", true)
    .returns<SladeBuyBox[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createBuyBox(
  supabase: SupabaseClient,
  input: Pick<SladeBuyBox, "contact_id"> & Partial<Omit<SladeBuyBox, "id" | "created_at" | "updated_at">>
): Promise<SladeBuyBox> {
  const { data, error } = await supabase.from("slade_buy_boxes").insert(input).select("*").returns<SladeBuyBox[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_buy_boxes returned no row.");
  return data[0];
}

export async function updateBuyBox(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Omit<SladeBuyBox, "id" | "contact_id" | "created_at" | "updated_at">>,
  changedBy?: string
): Promise<SladeBuyBox> {
  const { data, error } = await supabase
    .from("slade_buy_boxes")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .returns<SladeBuyBox[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error(`slade_buy_boxes ${id} not found`);

  // Buy-box edits are always worth an audit entry -- criteria drift is
  // exactly the kind of change that matters later ("what did TJ's buy box
  // used to say?"). Log the whole patch as one entry rather than per-field.
  await logChange(supabase, {
    tableName: "slade_buy_boxes",
    recordId: id,
    note: `Updated fields: ${Object.keys(patch).join(", ")}`,
    changedBy,
  });

  return data[0];
}
