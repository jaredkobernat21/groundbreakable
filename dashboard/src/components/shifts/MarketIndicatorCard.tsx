import type { MarketIndicatorWithSource } from "@/lib/types";
import { formatIndicatorChange, formatIndicatorValue, MARKET_TREND_ARROW, MARKET_TREND_COLOR } from "@/lib/marketConstants";
import { formatDate } from "@/lib/format";

export default function MarketIndicatorCard({ indicator }: { indicator: MarketIndicatorWithSource }) {
  const change = formatIndicatorChange(indicator.change_absolute, indicator.change_percent, indicator.unit);
  const trendColor = indicator.trend ? MARKET_TREND_COLOR[indicator.trend] : "#94a3b8";

  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">{indicator.label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#1c1c1c]">{formatIndicatorValue(indicator.current_value, indicator.unit)}</p>

      <div className="mt-1 flex items-center gap-1.5 text-sm">
        {indicator.trend && (
          <span className="font-medium" style={{ color: trendColor }}>
            {MARKET_TREND_ARROW[indicator.trend]}
          </span>
        )}
        {change ? (
          <span className="text-[#1c1c1c]/60">{change}</span>
        ) : (
          <span className="text-[#1c1c1c]/40">No comparable prior period available</span>
        )}
      </div>

      {indicator.notes && <p className="mt-2 text-xs leading-relaxed text-[#1c1c1c]/50">{indicator.notes}</p>}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#1c1c1c]/10 pt-2 text-[10px] text-[#1c1c1c]/40">
        <span>
          {indicator.confidence === "verified" ? "Verified" : indicator.confidence === "reported" ? "Reported" : "Unconfirmed"}
          {formatDate(indicator.current_value_date) ? ` · ${formatDate(indicator.current_value_date)}` : ""}
        </span>
        {indicator.source && (
          <a
            href={indicator.source.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 truncate underline decoration-[#1c1c1c]/30 underline-offset-2 hover:decoration-[#1c1c1c]"
          >
            {indicator.source.agency}
          </a>
        )}
      </div>
    </div>
  );
}
