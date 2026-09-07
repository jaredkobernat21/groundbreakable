"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addWatchlistItem, removeWatchlistItem } from "@/lib/queries/watchlist";
import type { WatchlistItemType } from "@/lib/types";

export async function addToWatchlist(clientId: string, formData: FormData) {
  const supabase = createClient();
  const itemType = formData.get("item_type") as WatchlistItemType | null;
  const note = formData.get("note");

  // Quick-add forms (market/corridor dropdowns) submit a single
  // "id::label" choice since a <select> only carries one value per
  // option -- the advanced form submits item_id/label separately.
  const choice = formData.get("item_choice");
  let itemId: string | null = null;
  let label: string | null = null;
  if (typeof choice === "string" && choice.includes("::")) {
    const [id, ...rest] = choice.split("::");
    itemId = id;
    label = rest.join("::");
  } else {
    const rawId = formData.get("item_id");
    const rawLabel = formData.get("label");
    itemId = typeof rawId === "string" ? rawId : null;
    label = typeof rawLabel === "string" ? rawLabel : null;
  }

  if (!itemType || !itemId || !label) {
    throw new Error("Item type, item, and a label are required.");
  }

  const { error } = await addWatchlistItem(supabase, clientId, itemType, itemId, label, typeof note === "string" ? note : null);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/private/${clientId}/watchlist`);
}

export async function removeFromWatchlist(clientId: string, itemId: string) {
  const supabase = createClient();
  const { error } = await removeWatchlistItem(supabase, itemId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/private/${clientId}/watchlist`);
}
