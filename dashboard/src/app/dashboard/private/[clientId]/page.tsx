import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPrivateClient, getActiveAcquisitionProfile } from "@/lib/queries/privateClients";
import { getRecentBriefs } from "@/lib/queries/privateBriefs";
import { buildPrivateBrief, gatherMarketBundles, resolveBriefMarkets } from "@/lib/generatePrivateBrief";
import { computePrivateClientScore, PRIVATE_CLIENT_SCORE_TIER_LABEL } from "@/lib/privateClientScoring";
import { EMERGING_MARKET_TIER_LABEL } from "@/lib/emergingMarketScoring";
import type { Market } from "@/lib/types";
import PrivateAnalystChat from "@/components/private/PrivateAnalystChat";
import { saveBrief } from "./actions";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";

function matchBadge(score: number) {
  const color = score >= 70 ? "bg-emerald-600" : score >= 40 ? "bg-amber-500" : "bg-[#1c1c1c]/30";
  return (
    <span className={`inline-flex items-center rounded-full ${color} px-2.5 py-1 text-xs font-semibold text-white`}>
      {score}% Match
    </span>
  );
}

export default async function PrivateBriefPage({ params }: { params: { clientId: string } }) {
  const supabase = createClient();
  const client = await getPrivateClient(supabase, params.clientId);
  if (!client) notFound();

  const { data: marketsData } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const trackedMarkets = marketsData ?? [];

  const activeProfile = getActiveAcquisitionProfile(client);
  const briefMarkets = resolveBriefMarkets(activeProfile, trackedMarkets);
  const bundles = await gatherMarketBundles(supabase, briefMarkets);
  const content = buildPrivateBrief(client, activeProfile, bundles);
  const score = computePrivateClientScore(client, activeProfile, trackedMarkets);

  const recentBriefs = await getRecentBriefs(supabase, client.id, 2);
  const lastSaved = recentBriefs[0] ?? null;
  const priorSnapshot = lastSaved?.match_snapshot as { topOpportunityIds?: string[]; topShiftIds?: string[]; topCorridorIds?: string[] } | undefined;

  const newOpportunityIds = priorSnapshot
    ? content.matchSnapshot.topOpportunityIds.filter((id) => !(priorSnapshot.topOpportunityIds ?? []).includes(id))
    : content.matchSnapshot.topOpportunityIds;
  const newShiftIds = priorSnapshot
    ? content.matchSnapshot.topShiftIds.filter((id) => !(priorSnapshot.topShiftIds ?? []).includes(id))
    : content.matchSnapshot.topShiftIds;

  const changesSinceLast = !lastSaved
    ? "This is the first brief saved for this client — nothing to compare against yet."
    : newOpportunityIds.length === 0 && newShiftIds.length === 0
      ? "No new top-ranked matches since the last saved brief."
      : `${newOpportunityIds.length} new top-ranked opportunit${newOpportunityIds.length === 1 ? "y" : "ies"} and ${newShiftIds.length} new top-ranked signal${newShiftIds.length === 1 ? "" : "s"} since the last saved brief (${new Date(lastSaved.generated_at).toLocaleDateString()}).`;

  const saveBriefAction = saveBrief.bind(null, client.id);

  // Top Matches card row -- the spec's "3-10 highest-priority signals"
  // (section 5A), pulled from whichever of shift/opportunity/corridor
  // matches scored highest, not just one category.
  const topCards = [
    ...content.topOpportunities.map((o) => ({
      key: `o-${o.opportunity.id}`,
      market: o.market.name,
      title: o.opportunity.address,
      score: o.match.score,
      reason: o.match.reasons[0] ?? o.opportunity.opportunity_type,
      href: null as string | null,
    })),
    ...content.topShifts.slice(0, 4).map((s) => ({
      key: `s-${s.shift.id}`,
      market: s.market.name,
      title: s.shift.event,
      score: s.match.score,
      reason: s.match.reasons[0] ?? s.shift.category,
      href: null as string | null,
    })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-[#B08D57]">Private Brief</div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">{client.full_name}</h1>
          <p className="text-sm text-[#1c1c1c]/50">
            {[client.title, client.company].filter(Boolean).join(" · ") || "—"} · Covering{" "}
            {briefMarkets.map((m) => m.name).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-semibold text-[#1c1c1c]">
              {score.total}
              <span className="text-sm text-[#1c1c1c]/30">/100</span>
            </div>
            <div className="text-xs text-[#1c1c1c]/50">{PRIVATE_CLIENT_SCORE_TIER_LABEL[score.tier]}</div>
          </div>
          <form action={saveBriefAction}>
            <button type="submit" className="rounded-full bg-[#1c1c1c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]/85">
              Save This Brief
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link href={`/dashboard/private/${client.id}/profile`} className="rounded-full border border-[#1c1c1c]/15 px-3 py-1.5 text-[#1c1c1c]/60 hover:border-[#1c1c1c]/30">
          View Client Profile & Acquisition Criteria
        </Link>
        <Link href={`/dashboard/private/${client.id}/watchlist`} className="rounded-full border border-[#1c1c1c]/15 px-3 py-1.5 text-[#1c1c1c]/60 hover:border-[#1c1c1c]/30">
          Watchlist
        </Link>
      </div>

      {!activeProfile && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          No acquisition profile is configured for {client.full_name} yet — this brief is showing raw signal
          strength, not a personalized match.{" "}
          <Link href={`/dashboard/admin/private-clients/${client.id}`} className="underline underline-offset-2">
            Set up the acquisition profile →
          </Link>
        </div>
      )}

      {/* Top Opportunities cards */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">Top Opportunities</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topCards.map((card) => (
            <div key={card.key} className={cardClass}>
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">{card.market}</div>
                {matchBadge(card.score)}
              </div>
              <div className="mt-1 text-sm font-medium text-[#1c1c1c]">{card.title}</div>
              <p className="mt-2 text-sm text-[#1c1c1c]/60">{card.reason}</p>
            </div>
          ))}
          {topCards.length === 0 && (
            <p className="text-sm text-[#1c1c1c]/40">No matches yet — signals will populate here as Groundbreakable tracks more activity.</p>
          )}
        </div>
      </section>

      {/* 8-section Private Brief (spec section 11) */}
      <section className="space-y-4">
        <BriefSection number={1} title="Top Signal" body={content.sections.topSignalSummary} />
        <BriefSection
          number={2}
          title="Emerging Markets"
          body={content.sections.emergingMarketsSummary}
          extra={
            <div className="mt-3 flex flex-wrap gap-2">
              {content.emergingMarkets.slice(0, 5).map((m) => (
                <Link
                  key={m.market.id}
                  href={`/dashboard/private/markets`}
                  className="rounded-full border border-[#1c1c1c]/10 px-3 py-1 text-xs text-[#1c1c1c]/60 hover:border-[#1c1c1c]/30"
                >
                  {m.market.name} · {EMERGING_MARKET_TIER_LABEL[m.score.tier]} · {m.score.score}
                </Link>
              ))}
            </div>
          }
        />
        <BriefSection
          number={3}
          title="Corridor Watch"
          body={content.sections.corridorWatchSummary}
          extra={
            <div className="mt-3 space-y-1">
              {content.topCorridors.map((c) => (
                <Link
                  key={c.corridor.id}
                  href={`/dashboard/private/corridors/${c.corridor.id}`}
                  className="block text-sm text-[#1c1c1c]/70 underline decoration-[#1c1c1c]/20 underline-offset-2 hover:text-[#1c1c1c]"
                >
                  {c.corridor.name} ({c.market.name}) — {c.match.score}% match
                </Link>
              ))}
            </div>
          }
        />
        <BriefSection number={4} title="Acquisition Matches" body={content.sections.acquisitionMatchesSummary} />
        <BriefSection number={5} title="City Decisions" body={content.sections.cityDecisionsSummary} />
        <BriefSection number={6} title="Changes Since Last Brief" body={changesSinceLast} />
        <BriefSection number={7} title="Risks" body={content.sections.risksSummary} />
        <BriefSection number={8} title="Groundbreakable Take" body={content.sections.groundbreakableTake} emphasized />
      </section>

      <PrivateAnalystChat clientId={client.id} />
    </div>
  );
}

function BriefSection({
  number,
  title,
  body,
  extra,
  emphasized,
}: {
  number: number;
  title: string;
  body: string;
  extra?: React.ReactNode;
  emphasized?: boolean;
}) {
  return (
    <div className={emphasized ? `${cardClass} border-[#1c1c1c]/20 bg-[#1c1c1c] text-white` : cardClass}>
      <div className={`text-xs uppercase tracking-wide ${emphasized ? "text-white/50" : "text-[#1c1c1c]/40"}`}>
        {number}. {title}
      </div>
      <p className={`mt-1 text-sm ${emphasized ? "text-white/90" : "text-[#1c1c1c]/80"}`}>{body}</p>
      {extra}
    </div>
  );
}
