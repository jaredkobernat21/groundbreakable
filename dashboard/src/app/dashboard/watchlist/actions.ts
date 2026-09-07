"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addWatchlistItem, removeWatchlistItem } from "@/lib/queries/watchlist";
import type { WatchlistItemType } from "@/lib/types";

export async function addToWatchlist(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");

  const itemType = formData.get("item_type") as WatchlistItemType | null;
  const note = formData.get("note");

  // Quick-add dropdowns submit a single "id::label" choice.
  const choice = formData.get("item_choice");
  let itemId: string | null = null;
  let label: string | null = null;
  if (typeof choice === "string" && choice.includes("::")) {
    const [id, ...rest] = choice.split("::");
    itemId = id;
    label = rest.join("::");
  }

  if (!itemType || !itemId || !label) throw new Error("Item type and item are required.");

  const { error } = await addWatchlistItem(supabase, user.id, itemType, itemId, label, typeof note === "string" ? note : null);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/watchlist");
}

export async function removeFromWatchlist(itemId: string) {
  const supabase = createClient();
  const { error } = await removeWatchlistItem(supabase, itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/watchlist");
}
