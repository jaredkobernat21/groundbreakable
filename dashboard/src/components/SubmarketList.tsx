import type { Submarket } from "@/lib/types";

const MOMENTUM_LABEL: Record<Submarket["momentum"], string> = {
  high: "High Momentum",
  emerging: "Emerging",
  stable: "Stable",
  watch: "Watch",
};

const MOMENTUM_COLOR: Record<Submarket["momentum"], string> = {
  high: "text-green-400 bg-green-400/10",
  emerging: "text-amber-400 bg-amber-400/10",
  stable: "text-blue-400 bg-blue-400/10",
  watch: "text-red-400 bg-red-400/10",
};

export default function SubmarketList({ submarkets }: { submarkets: Submarket[] }) {
  if (submarkets.length === 0) {
    return (
      <p className="text-sm text-white/40">
        No submarkets entered yet for this market.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {submarkets.map((s) => (
        <li key={s.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">{s.name}</span>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${MOMENTUM_COLOR[s.momentum]}`}
            >
              {MOMENTUM_LABEL[s.momentum]}
            </span>
          </div>
          {s.summary && <p className="mt-1 text-sm text-white/50">{s.summary}</p>}
          <div className="mt-2 flex gap-4 text-xs text-white/40">
            {s.median_price != null && (
              <span>Median: ${s.median_price.toLocaleString()}</span>
            )}
            {s.cash_on_cash_pct != null && <span>CoC: {s.cash_on_cash_pct}%</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
