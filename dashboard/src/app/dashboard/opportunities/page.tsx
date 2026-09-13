import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestorProfile, tierAtLeast } from "@/lib/tiers";
import { getOpportunityProfiles, getActiveOpportunityProfile } from "@/lib/queries/opportunityProfiles";
import { buildPersonalizedBrief, gatherMarketBundles, resolveBriefMarkets } from "@/lib/generatePersonalizedBrief";
import type { Market } from "@/lib/types";
import { addMatchToWatchlist } from "./actions";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";

function matchBadge(score: number) {
  const color = score >= 70 ? "bg-emerald-600" : score >= 40 ? "bg-amber-500" : "bg-[#1c1c1c]/30";
  return <span className={`inline-flex items-center rounded-full ${color} px-2.5 py-1 text-xs font-semibold text-white`}>{score}% Match</span>;
}

export default async function OpportunitiesPage() {
  const supabase = createClient();
  const account = await getCurrentInvestorProfile(supabase);
  if (!account) redirect("/login");

  if (!tierAtLeast(account.subscription_tier, "intelligence")) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Opportunities</h1>
          <p className="mt-1 text-sm text-[#1c1c1c]/60">See what matters to you.</p>
        </div>
        <div className={cardClass}>
          <p className="text-sm text-[#1c1c1c]/70">
            Personalized opportunity matching — scored against your exact criteria, with why-it-matches reasoning —
            is part of <span className="font-medium text-[#1c1c1c]">Intelligence</span> and{" "}
            <span className="font-medium text-[#1c1c1c]">Partner</span>.
          </p>
          <p className="mt-2 text-sm text-[#1c1c1c]/50">
            Broad development activity and opportunity signals are still visible on your{" "}
            <Link href="/dashboard" className="underline decoration-[#1c1c1c]/20 underline-offset-2 hover:text-[#1c1c1c]">
              Overview
            </Link>{" "}
            dashboard.
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-4 inline-block rounded-full bg-[#1c1c1c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]/85"
          >
            Upgrade to Intelligence
          </Link>
        </div>
      </div>
    );
  }

  const { data: marketsData } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const trackedMarkets = marketsData ?? [];
  const profiles = await getOpportunityProfiles(supabase, account.id);
  const activeProfile = getActiveOpportunityProfile(profiles);
  const briefMarkets = resolveBriefMarkets(activeProfile, trackedMarkets);
  const bundles = await gatherMarketBundles(supabase, briefMarkets);
  const content = buildPersonalizedBrief(account, activeProfile, bundles);

  const isPartner = tierAtLeast(account.subscription_tier, "partner");

  const cards = [
    ...content.topOpportunities.map((o) => ({
      key: `o-${o.opportunity.id}`,
      itemType: "opportunity" as const,
      itemId: o.opportunity.id,
      market: o.market.name,
      title: o.opportunity.address,
      score: o.match.score,
      reasons: o.match.reasons,
      subjectLabel: `${o.opportunity.address} (${o.market.name})`,
    })),
    ...content.topShifts.map((s) => ({
      key: `s-${s.shift.id}`,
      itemType: "shift" as const,
      itemId: s.shift.id,
      market: s.market.name,
      title: s.shift.event,
      score: s.match.score,
      reasons: s.match.reasons,
      subjectLabel: `${s.shift.event} (${s.market.name})`,
    })),
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Opportunities</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#1c1c1c]/60">
            {!activeProfile
              ? "No Opportunity Profile configured yet — showing raw signal strength, not a personalized fit."
              : content.sections.groundbreakableTake}
          </p>
        </div>
        <Link href="/dashboard/profile" className="rounded-full border border-[#1c1c1c]/15 px-3 py-1.5 text-xs text-[#1c1c1c]/60 hover:border-[#1c1c1c]/30">
          Edit Opportunity Profile
        </Link>
      </div>

      {!activeProfile && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Set up your Opportunity Profile to turn this into a personalized, scored feed.{" "}
          <Link href="/dashboard/profile" className="underline underline-offset-2">
            Set it up →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.key} className={cardClass}>
            <div className="flex items-start justify-between gap-2">
              <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">{card.market}</div>
              {matchBadge(card.score)}
            </div>
            <Link href={`/dashboard/opportunities/${card.itemType}/${card.itemId}`} className="mt-1 block text-sm font-medium text-[#1c1c1c] hover:underline">
              {card.title}
            </Link>
            <ul className="mt-2 space-y-1 text-sm text-[#1c1c1c]/60">
              {card.reasons.slice(0, 2).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={addMatchToWatchlist}>
                <input type="hidden" name="item_type" value={card.itemType} />
                <input type="hidden" name="item_id" value={card.itemId} />
                <input type="hidden" name="label" value={card.subjectLabel} />
                <button type="submit" className="rounded-full border border-[#1c1c1c]/15 px-3 py-1 text-xs text-[#1c1c1c]/60 hover:border-[#1c1c1c]/30">
                  + Watchlist
                </button>
              </form>
              {isPartner && (
                <Link
                  href={`/dashboard/partner-desk?subject_type=${card.itemType}&subject_id=${card.itemId}&subject_label=${encodeURIComponent(card.subjectLabel)}`}
                  className="rounded-full border border-[#B08D57]/40 px-3 py-1 text-xs font-medium text-[#B08D57] hover:bg-[#B08D57]/10"
                >
                  Request Partner Help →
                </Link>
              )}
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="text-sm text-[#1c1c1c]/40">No matches yet — check back as Groundbreakable tracks more activity.</p>
        )}
      </div>
    </div>
  );
}
