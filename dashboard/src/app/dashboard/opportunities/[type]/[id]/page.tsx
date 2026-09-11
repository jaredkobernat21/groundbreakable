import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestorProfile, tierAtLeast } from "@/lib/tiers";
import { getOpportunityProfiles, getActiveOpportunityProfile } from "@/lib/queries/opportunityProfiles";
import { scoreOpportunityMatch, scoreShiftMatch } from "@/lib/clientMatchScoring";
import { SHIFT_CATEGORY_LABEL, SHIFT_IMPACT_LABEL } from "@/lib/shiftConstants";
import { OPPORTUNITY_STRENGTH_LABEL, type DevelopmentOpportunity, type Market, type Shift, type Source } from "@/lib/types";
import PersonalizedOverviewMap from "@/components/profile/PersonalizedOverviewMap";
import { addMatchToWatchlist } from "../../actions";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";

function matchBadge(score: number) {
  const color = score >= 70 ? "bg-emerald-600" : score >= 40 ? "bg-amber-500" : "bg-[#1c1c1c]/30";
  return <span className={`inline-flex items-center rounded-full ${color} px-3 py-1.5 text-sm font-semibold text-white`}>{score}% Match</span>;
}

export default async function MatchDetailPage({ params }: { params: { type: string; id: string } }) {
  if (params.type !== "opportunity" && params.type !== "shift") notFound();

  const supabase = createClient();
  const account = await getCurrentInvestorProfile(supabase);
  if (!account) redirect("/login");
  if (!tierAtLeast(account.subscription_tier, "intelligence")) redirect("/dashboard/opportunities");

  const profiles = await getOpportunityProfiles(supabase, account.id);
  const activeProfile = getActiveOpportunityProfile(profiles);

  // Normalize both shapes (development_opportunities vs. shifts) into one
  // template's worth of fields -- the two entities carry genuinely
  // different columns (an opportunity's own sourced "reasons" vs. a
  // shift's free-text description), so this is assembled per-branch
  // rather than forced into a shared query.
  let title: string;
  let market: Market;
  let lat: number | null;
  let lng: number | null;
  let matchScore: number;
  let matchReasons: string[];
  let typeLabel: string;
  let dateLabel: string;
  let ownReasons: string[] | null = null;
  let description: string | null = null;
  let sources: Source[] = [];
  let subjectLabel: string;

  if (params.type === "opportunity") {
    const { data: opportunities } = await supabase
      .from("development_opportunities")
      .select("*")
      .eq("id", params.id)
      .returns<DevelopmentOpportunity[]>();
    const opportunity = opportunities?.[0];
    if (!opportunity) notFound();

    const { data: markets } = await supabase.from("markets").select("*").eq("id", opportunity.market_id).returns<Market[]>();
    market = markets?.[0] as Market;
    if (!market) notFound();

    const { data: sourceRows } = opportunity.source_ids.length
      ? await supabase.from("sources").select("*").in("id", opportunity.source_ids).returns<Source[]>()
      : { data: [] };
    sources = sourceRows ?? [];

    const match = activeProfile ? scoreOpportunityMatch(activeProfile, opportunity, market) : { score: 0, reasons: [] };

    title = opportunity.address;
    lat = opportunity.latitude;
    lng = opportunity.longitude;
    matchScore = match.score;
    matchReasons = match.reasons;
    typeLabel = `${opportunity.opportunity_type} · ${OPPORTUNITY_STRENGTH_LABEL[opportunity.strength]} strength`;
    dateLabel = `Identified ${opportunity.date_identified}`;
    ownReasons = opportunity.reasons;
    subjectLabel = `${opportunity.address} (${market.name})`;
  } else {
    const { data: shifts } = await supabase.from("shifts").select("*").eq("id", params.id).returns<Shift[]>();
    const shift = shifts?.[0];
    if (!shift) notFound();

    const { data: markets } = await supabase.from("markets").select("*").eq("id", shift.market_id).returns<Market[]>();
    market = markets?.[0] as Market;
    if (!market) notFound();

    const match = activeProfile ? scoreShiftMatch(activeProfile, shift, market) : { score: 0, reasons: [] };

    if (shift.source_id) {
      const { data: sourceRows } = await supabase.from("sources").select("*").eq("id", shift.source_id).returns<Source[]>();
      sources = sourceRows ?? [];
    }

    title = shift.event;
    lat = shift.lat;
    lng = shift.lng;
    matchScore = match.score;
    matchReasons = match.reasons;
    typeLabel = `${SHIFT_CATEGORY_LABEL[shift.category]} · ${SHIFT_IMPACT_LABEL[shift.impact]} impact`;
    dateLabel = `Logged ${shift.event_date}`;
    description = shift.description;
    subjectLabel = `${shift.event} (${market.name})`;
  }

  const addToWatchlistAction = addMatchToWatchlist;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/opportunities" className="text-xs text-[#1c1c1c]/40 hover:text-[#1c1c1c]">
          ← All Matches
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">{market.name}, {market.state}</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">{title}</h1>
            <p className="mt-1 text-sm text-[#1c1c1c]/50">{typeLabel} · {dateLabel}</p>
          </div>
          {matchBadge(matchScore)}
        </div>
      </div>

      {!activeProfile && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          No Opportunity Profile configured — this match score reflects raw signal strength, not a personalized fit.
        </div>
      )}

      {lat != null && lng != null && (
        <div className="h-72 overflow-hidden rounded-2xl border border-[#1c1c1c]/10 shadow-sm sm:h-80">
          <PersonalizedOverviewMap
            pins={[{ id: params.id, lat, lng, title, subtitle: market.name, score: matchScore }]}
            singlePinZoom={14}
          />
        </div>
      )}

      <section className={cardClass}>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/50">Why This Matches You</h2>
        {matchReasons.length > 0 ? (
          <ul className="space-y-1.5">
            {matchReasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#1c1c1c]/80">
                <span className="text-emerald-600">✓</span> {reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#1c1c1c]/40">No specific match reasons — this didn't score highly against your current criteria.</p>
        )}
      </section>

      {(ownReasons?.length || description) && (
        <section className={cardClass}>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/50">What's Happening Here</h2>
          {description && <p className="text-sm text-[#1c1c1c]/80">{description}</p>}
          {ownReasons && ownReasons.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {ownReasons.map((reason, i) => (
                <li key={i} className="text-sm text-[#1c1c1c]/80">• {reason}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {sources.length > 0 && (
        <section className={cardClass}>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/50">Sources</h2>
          <ul className="space-y-1">
            {sources.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-[#1c1c1c]/70 underline decoration-[#1c1c1c]/20 underline-offset-2 hover:text-[#1c1c1c]"
                >
                  {s.agency}{s.title ? ` — ${s.title}` : ""}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <form action={addToWatchlistAction}>
          <input type="hidden" name="item_type" value={params.type} />
          <input type="hidden" name="item_id" value={params.id} />
          <input type="hidden" name="label" value={subjectLabel} />
          <button type="submit" className="rounded-full border border-[#1c1c1c]/15 px-4 py-2 text-sm text-[#1c1c1c]/70 hover:border-[#1c1c1c]/30">
            + Add to Watchlist
          </button>
        </form>
        {tierAtLeast(account.subscription_tier, "partner") && (
          <Link
            href={`/dashboard/partner-desk?subject_type=${params.type}&subject_id=${params.id}&subject_label=${encodeURIComponent(subjectLabel)}`}
            className="rounded-full border border-[#B08D57]/40 px-4 py-2 text-sm font-medium text-[#B08D57] hover:bg-[#B08D57]/10"
          >
            Request Partner Help →
          </Link>
        )}
      </div>
    </div>
  );
}
