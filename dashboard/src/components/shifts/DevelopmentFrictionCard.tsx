import type { DevelopmentFrictionSignalWithSource } from "@/lib/types";
import { SHIFT_IMPACT_COLOR, SHIFT_IMPACT_LABEL } from "@/lib/shiftConstants";
import { formatDate } from "@/lib/format";

// metric_unit is free text (same reasoning as market_indicators.unit) --
// best-effort formatting for what's been seeded so far, plain fallback
// otherwise.
function formatMetric(value: number, unit: string): string {
  switch (unit) {
    case "usd":
      return `$${Math.round(value).toLocaleString()}`;
    case "days":
      return `${value.toLocaleString()} days`;
    case "months":
      return `${value.toLocaleString()} months`;
    default:
      return `${value.toLocaleString()} ${unit}`;
  }
}

export default function DevelopmentFrictionCard({ signal }: { signal: DevelopmentFrictionSignalWithSource }) {
  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-[#1c1c1c]">{signal.title}</p>
        {signal.severity && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
            style={{ backgroundColor: SHIFT_IMPACT_COLOR[signal.severity] }}
          >
            {SHIFT_IMPACT_LABEL[signal.severity]}
          </span>
        )}
      </div>

      {signal.metric_value != null && signal.metric_unit && (
        <p className="mt-1 text-xl font-semibold text-[#1c1c1c]">{formatMetric(signal.metric_value, signal.metric_unit)}</p>
      )}

      <p className="mt-2 text-sm leading-relaxed text-[#1c1c1c]/70">{signal.summary}</p>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#1c1c1c]/10 pt-2 text-[10px] text-[#1c1c1c]/40">
        <span>
          {signal.confidence === "verified" ? "Verified" : signal.confidence === "reported" ? "Reported" : "Unconfirmed"}
          {formatDate(signal.observed_date) ? ` · ${formatDate(signal.observed_date)}` : ""}
        </span>
        {signal.source && (
          <a
            href={signal.source.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 truncate underline decoration-[#1c1c1c]/30 underline-offset-2 hover:decoration-[#1c1c1c]"
          >
            {signal.source.agency}
          </a>
        )}
      </div>
    </div>
  );
}
