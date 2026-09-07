"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPrivateClient, getActiveAcquisitionProfile } from "@/lib/queries/privateClients";
import { buildPrivateBrief, gatherMarketBundles, resolveBriefMarkets } from "@/lib/generatePrivateBrief";
import type { Market } from "@/lib/types";

// Snapshots the brief currently on screen into private_briefs so the
// next visit has something concrete to diff against for "Changes Since
// Last Brief" (spec section 11.6) -- deliberately re-computed server-side
// from live data rather than trusting whatever the client posts, same
// reasoning as every other write path in this app trusting RLS + a
// server-side recompute over client-submitted numbers.
export async function saveBrief(clientId: string) {
  const supabase = createClient();

  const client = await getPrivateClient(supabase, clientId);
  if (!client) throw new Error("Private client not found or not accessible.");

  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const activeProfile = getActiveAcquisitionProfile(client);
  const briefMarkets = resolveBriefMarkets(activeProfile, markets ?? []);
  const bundles = await gatherMarketBundles(supabase, briefMarkets);
  const content = buildPrivateBrief(client, activeProfile, bundles);

  const { error } = await supabase.from("private_briefs").insert({
    private_client_id: clientId,
    top_signal_summary: content.sections.topSignalSummary,
    emerging_markets_summary: content.sections.emergingMarketsSummary,
    corridor_watch_summary: content.sections.corridorWatchSummary,
    acquisition_matches_summary: content.sections.acquisitionMatchesSummary,
    city_decisions_summary: content.sections.cityDecisionsSummary,
    changes_since_last_summary: null,
    risks_summary: content.sections.risksSummary,
    groundbreakable_take: content.sections.groundbreakableTake,
    match_snapshot: content.matchSnapshot,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/private/${clientId}`);
}
