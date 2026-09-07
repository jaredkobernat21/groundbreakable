import Link from "next/link";
import type { PersonalizedBriefContent } from "@/lib/generatePersonalizedBrief";
import { EMERGING_MARKET_TIER_LABEL } from "@/lib/emergingMarketScoring";
import type { InvestorProfile, Market } from "@/lib/types";
import PersonalizedOverviewMap, { type OverviewMapPin } from "./PersonalizedOverviewMap";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";
// A separate class string (not cardClass + overrides) on purpose --
// Tailwind utility classes with the same property (bg-white vs.
// bg-[#1c1c1c]) don't reliably resolve in the order they're written in
// the className string, only in whatever order they land in the
// generated stylesheet. Concatenating "bg-[#1c1c1c]" onto a string that
// already contains "bg-white" previously let bg-white win, leaving
// white-on-white text that looked like an empty box.
const emphasizedCardClass = "rounded-2xl border border-[#1c1c1c]/20 bg-[#1c1c1c] p-5 shadow-sm text-white";

function matchBadge(score: number) {
  const color = score >= 70 ? "bg-emerald-600" : score >= 40 ? "bg-amber-500" : "bg-[#1c1c1c]/30";
  return <span className={`inline-flex items-center rounded-full ${color} px-2.5 py-1 text-xs font-semibold text-white`}>{score}% Match</span>;
}

// The Intelligence/Partner landing experience (spec: "highlighted
// important information... opportunities matching what he looks for").
// Deliberately NOT scoped to one market -- it's built from
// buildPersonalizedBrief() across every market in the account's
// Opportunity Profile, the same engine /dashboard/opportunities and the
// AI analyst use, so this page, the full feed, and the analyst can never
// silently disagree about what's a good match. This is the "briefing"
// view (a handful of highlights + a synthesized take); the full ranked
// list lives at /dashboard/opportunities.
export default function PersonalizedOverview({
  account,
  content,
  coverageMarkets,
}: {
  account: InvestorProfile;
  content: PersonalizedBriefContent;
  coverageMarkets: Market[];
}) {
  const firstName = (account.full_name ?? "there").split(" ")[0];

  const topCards = [
    ...content.topOpportunities.map((o) => ({
      key: `o-${o.opportunity.id}`,
      market: o.market.name,
      title: o.opportunity.address,
      score: o.match.score,
      reason: o.match.reasons[0] ?? o.opportunity.opportunity_type,
    })),
    ...content.topShifts.map((s) => ({
      key: `s-${s.shift.id}`,
      market: s.market.name,
      title: s.shift.event,
      score: s.match.score,
      reason: s.match.reasons[0] ?? s.shift.category,
    })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // Every geolocated top match, across every market -- the hero map
  // fits its own bounds to whatever this produces rather than assuming
  // one market's center/zoom, since matches here can span the full
  // width of the account's footprint (Dan Lynch's spans Perry to Spring
  // Hill, well over an hour apart).
  const pins: OverviewMapPin[] = [
    ...content.topOpportunities
      .filter((o) => o.opportunity.latitude != null && o.opportunity.longitude != null)
      .map((o) => ({
        id: `o-${o.opportunity.id}`,
        lat: o.opportunity.latitude as number,
        lng: o.opportunity.longitude as number,
        title: o.opportunity.address,
        subtitle: o.market.name,
        score: o.match.score,
      })),
    ...content.topShifts
      .filter((s) => s.shift.lat != null && s.shift.lng != null)
      .map((s) => ({
        id: `s-${s.shift.id}`,
        lat: s.shift.lat as number,
        lng: s.shift.lng as number,
        title: s.shift.event,
        subtitle: s.market.name,
        score: s.match.score,
      })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-[#1c1c1c]/50">
          Covering all {coverageMarkets.length} of your markets: {coverageMarkets.map((m) => m.name).join(", ")}
        </p>
      </div>

      {pins.length > 0 && (
        <div className="h-80 overflow-hidden rounded-2xl border border-[#1c1c1c]/10 shadow-sm sm:h-96">
          <PersonalizedOverviewMap pins={pins} />
        </div>
      )}

      <div className={emphasizedCardClass}>
        <div className="text-xs uppercase tracking-wide text-white/50">Groundbreakable Take</div>
        <p className="mt-1 text-sm text-white/90">{content.sections.groundbreakableTake}</p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">Top Matches</h2>
          <Link href="/dashboard/opportunities" className="text-xs text-[#1c1c1c]/50 underline decoration-[#1c1c1c]/20 underline-offset-2 hover:text-[#1c1c1c]">
            See all matches →
          </Link>
        </div>
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
            <p className="text-sm text-[#1c1c1c]/40">No matches yet — check back as Groundbreakable tracks more activity.</p>
          )}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cardClass}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/50">Emerging Markets</h2>
            <Link href="/dashboard/markets" className="text-xs text-[#1c1c1c]/50 underline decoration-[#1c1c1c]/20 underline-offset-2 hover:text-[#1c1c1c]">
              See all →
            </Link>
          </div>
          <div className="space-y-2">
            {content.emergingMarkets.slice(0, 3).map((m) => (
              <div key={m.market.id} className="flex items-center justify-between text-sm">
                <span className="text-[#1c1c1c]/80">{m.market.name}</span>
                <span className="text-[#1c1c1c]/50">
                  {EMERGING_MARKET_TIER_LABEL[m.score.tier]} · {m.score.score}/100
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/50">Corridor Watch</h2>
            <Link href="/dashboard/markets/corridors" className="text-xs text-[#1c1c1c]/50 underline decoration-[#1c1c1c]/20 underline-offset-2 hover:text-[#1c1c1c]">
              See all →
            </Link>
          </div>
          <div className="space-y-2">
            {content.topCorridors.slice(0, 3).map((c) => (
              <Link
                key={c.corridor.id}
                href={`/dashboard/markets/corridors/${c.corridor.id}`}
                className="block text-sm text-[#1c1c1c]/80 hover:text-[#1c1c1c] hover:underline"
              >
                {c.corridor.name} <span className="text-[#1c1c1c]/40">({c.market.name}) — {c.match.score}% match</span>
              </Link>
            ))}
            {content.topCorridors.length === 0 && <p className="text-sm text-[#1c1c1c]/40">No corridors matched yet.</p>}
          </div>
        </section>
      </div>

      {content.sections.risksSummary && content.sections.risksSummary !== "No material data-coverage risks identified right now." && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">{content.sections.risksSummary}</div>
      )}
    </div>
  );
}
