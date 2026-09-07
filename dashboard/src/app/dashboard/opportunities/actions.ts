"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addWatchlistItem } from "@/lib/queries/watchlist";
import type { WatchlistItemType } from "@/lib/types";

export async function addMatchToWatchlist(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");

  const itemType = formData.get("item_type") as WatchlistItemType | null;
  const itemId = formData.get("item_id");
  const label = formData.get("label");
  if (!itemType || typeof itemId !== "string" || typeof label !== "string") {
    throw new Error("Missing watchlist item details.");
  }

  const { error } = await addWatchlistItem(supabase, user.id, itemType, itemId, label);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/opportunities");
  revalidatePath("/dashboard/watchlist");
}
