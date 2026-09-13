import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestorProfile, tierAtLeast } from "@/lib/tiers";
import { selectMarket } from "@/lib/selectMarket";
import AskBar from "@/components/AskBar";
import PersonalizedAskChat from "@/components/profile/PersonalizedAskChat";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AskPage() {
  const supabase = createClient();
  const account = await getCurrentInvestorProfile(supabase);
  if (!account) redirect("/login");

  const isIntelligence = tierAtLeast(account.subscription_tier, "intelligence");

  const { data: marketsData } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const market = selectMarket(marketsData ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Ask Groundbreakable</h1>
        <p className="mt-1 text-sm text-[#1c1c1c]/60">
          {isIntelligence
            ? "An analyst that knows your Opportunity Profile and today's matches."
            : "Ask about what's happening in a market."}
        </p>
      </div>

      {isIntelligence ? (
        <PersonalizedAskChat />
      ) : (
        <div className="space-y-4">
          {market ? (
            <AskBar marketName={market.name} marketSlug={market.slug} />
          ) : (
            <p className="text-sm text-[#1c1c1c]/40">No market available yet.</p>
          )}
          <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 text-sm text-[#1c1c1c]/60 shadow-sm">
            A personal analyst that knows your exact criteria — and can answer things like "which opportunities this
            month best fit me" — is part of{" "}
            <Link href="/dashboard/profile" className="font-medium text-[#1c1c1c] underline underline-offset-2">
              Intelligence
            </Link>
            .
          </div>
        </div>
      )}
    </div>
  );
}
