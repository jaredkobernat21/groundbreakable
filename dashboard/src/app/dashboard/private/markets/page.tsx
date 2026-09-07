import { createClient } from "@/lib/supabase/server";
import { gatherMarketBundles } from "@/lib/generatePrivateBrief";
import { computeEmergingMarketScore, EMERGING_MARKET_TIER_LABEL } from "@/lib/emergingMarketScoring";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";

const TIER_COLOR: Record<ReturnType<typeof computeEmergingMarketScore>["tier"], string> = {
  leading: "bg-emerald-600",
  emerging: "bg-amber-500",
  watch: "bg-blue-500",
  quiet: "bg-[#1c1c1c]/25",
};

export default async function EmergingMarketsPage() {
  const supabase = createClient();
  const { data: marketsData } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const markets = marketsData ?? [];
  const bundles = await gatherMarketBundles(supabase, markets);

  const ranked = bundles
    .map((b) => ({
      market: b.market,
      score: computeEmergingMarketScore({
        indicators: b.indicators,
        growthAreas: b.growthAreas,
        recentShifts: b.shifts,
        opportunities: b.opportunities,
      }),
      recentPlansInfra: b.shifts.filter((s) => s.category === "plans" || s.category === "infrastructure").slice(0, 3),
      accelerating: b.growthAreas.filter((g) => g.momentum_state === "accelerating"),
    }))
    .sort((a, b) => b.score.score - a.score.score);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Emerging Markets</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#1c1c1c]/60">
          Ranked by forward-looking municipal commitments — recent plans and infrastructure activity, growth-area
          momentum, and high-strength development opportunities weigh far more here than lagging demographic
          statistics (spec section 6).
        </p>
      </div>

      <div className="space-y-4">
        {ranked.map(({ market, score, recentPlansInfra, accelerating }) => (
          <div key={market.id} className={cardClass}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-medium text-[#1c1c1c]">
                  {market.name}, {market.state}
                </div>
                <p className="mt-1 text-sm text-[#1c1c1c]/60">
                  {score.reasons.length > 0 ? score.reasons.join(". ") + "." : "No forward-looking signals on file yet."}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center rounded-full ${TIER_COLOR[score.tier]} px-3 py-1 text-xs font-semibold text-white`}>
                  {EMERGING_MARKET_TIER_LABEL[score.tier]}
                </span>
                <span className="text-2xl font-semibold text-[#1c1c1c]">{score.score}<span className="text-sm text-[#1c1c1c]/30">/100</span></span>
              </div>
            </div>

            {(recentPlansInfra.length > 0 || accelerating.length > 0) && (
              <div className="mt-4 grid gap-4 border-t border-[#1c1c1c]/10 pt-4 sm:grid-cols-2">
                {recentPlansInfra.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">What's Changing</div>
                    <ul className="mt-1 space-y-1 text-sm text-[#1c1c1c]/70">
                      {recentPlansInfra.map((s) => (
                        <li key={s.id}>{s.event}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {accelerating.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">Where Growth Is Moving</div>
                    <ul className="mt-1 space-y-1 text-sm text-[#1c1c1c]/70">
                      {accelerating.map((g) => (
                        <li key={g.id}>{g.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
