import type { SupabaseClient } from "@supabase/supabase-js";
import type { SladeOpportunityFeedback } from "./types";

export async function addOpportunityFeedback(
  supabase: SupabaseClient,
  input: Pick<SladeOpportunityFeedback, "opportunity_id"> & Partial<Omit<SladeOpportunityFeedback, "id" | "created_at">>
): Promise<SladeOpportunityFeedback> {
  const { data, error } = await supabase.from("slade_opportunity_feedback").insert(input).select("*").returns<SladeOpportunityFeedback[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error("Insert into slade_opportunity_feedback returned no row.");
  return data[0];
}

export async function getOpportunityFeedback(supabase: SupabaseClient, opportunityId: string): Promise<SladeOpportunityFeedback[]> {
  const { data, error } = await supabase
    .from("slade_opportunity_feedback")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .order("occurred_at", { ascending: false })
    .returns<SladeOpportunityFeedback[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}
