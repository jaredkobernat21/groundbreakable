import type { MarketIndicatorWithSource, MarketOverviewWithSources } from "@/lib/types";
import MarketIndicatorCard from "./MarketIndicatorCard";

// Deliberately simple, per Jared's ask: a one-line takeaway, a grid of
// indicator cards (current value/change/trend/source -- see
// MarketIndicatorCard), then major employers and recent employer changes
// as plain lists. No map -- these are market-wide figures, not
// parcel-level pins.
export default function MarketOverviewSection({
  indicators,
  overview,
}: {
  indicators: MarketIndicatorWithSource[];
  overview: MarketOverviewWithSources | null;
}) {
  if (indicators.length === 0 && !overview) {
    return (
      <p className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4 text-sm text-[#1c1c1c]/40">
        No market indicators researched yet for this market.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {overview?.summary && (
        <p className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4 text-sm leading-relaxed text-[#1c1c1c]/80">
          {overview.summary}
        </p>
      )}

      {indicators.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {indicators.map((indicator) => (
            <MarketIndicatorCard key={indicator.id} indicator={indicator} />
          ))}
        </div>
      )}

      {overview && (overview.major_employers.length > 0 || overview.recent_employer_changes.length > 0 || overview.new_business_activity) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {overview.major_employers.length > 0 && (
            <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Major Employers</p>
              <ul className="space-y-1 text-sm text-[#1c1c1c]/80">
                {overview.major_employers.map((employer) => (
                  <li key={employer}>{employer}</li>
                ))}
              </ul>
              {overview.major_employers_note && (
                <p className="mt-2 text-xs leading-relaxed text-[#1c1c1c]/45">{overview.major_employers_note}</p>
              )}
            </div>
          )}

          {overview.recent_employer_changes.length > 0 && (
            <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Recent Employer Changes</p>
              <ul className="space-y-2 text-sm leading-relaxed text-[#1c1c1c]/80">
                {overview.recent_employer_changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          {overview.new_business_activity && (
            <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4 sm:col-span-2">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">New Business Activity</p>
              <p className="text-sm leading-relaxed text-[#1c1c1c]/80">{overview.new_business_activity}</p>
            </div>
          )}
        </div>
      )}

      {overview && overview.sources.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#1c1c1c]/45">
          {overview.sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-[#1c1c1c]/20 underline-offset-2 hover:decoration-[#1c1c1c]"
            >
              {source.agency}
              {source.title ? ` — ${source.title}` : ""} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
