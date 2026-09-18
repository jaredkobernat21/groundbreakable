import type { DevelopmentFrictionCaseWithSource, FrictionCaseOutcome, Market } from "@/lib/types";
import Icon from "../shifts/Icon";

const RESOLVED_OUTCOMES: FrictionCaseOutcome[] = ["resolved", "modified"];
const DELAYED_OUTCOMES: FrictionCaseOutcome[] = ["delayed", "pending"];
const FAILED_OUTCOMES: FrictionCaseOutcome[] = ["denied", "withdrawn", "abandoned"];

const ICON_ALERT = ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 8v5", "M12 16h.01"];
const ICON_CLOCK = ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 3"];
const ICON_X_CIRCLE = ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M9 9l6 6", "M15 9l-6 6"];

// Purely computed from real counts -- no generated narrative -- since
// there's no sourced-content pipeline behind this the way BriefingSummary
// has for Momentum areas. "Opposed" is every case on file, since every
// row in development_friction_cases faced friction by definition.
function headline(market: Market, total: number, delayed: number, failed: number, resolved: number): string {
  if (total === 0) {
    return `No documented development friction cases on file for ${market.name}, ${market.state} yet.`;
  }
  const parts: string[] = [];
  if (failed > 0) parts.push(`${failed} failed`);
  if (delayed > 0) parts.push(`${delayed} delayed`);
  if (resolved > 0) parts.push(`${resolved} resolved or modified despite opposition`);
  return `${market.name}, ${market.state} has ${total} documented development friction case${total === 1 ? "" : "s"} on file${
    parts.length > 0 ? `: ${parts.join(", ")}` : ""
  }.`;
}

// Replaces BriefingSummary + MetricCardRow's momentum-specific content at
// the top of the page while any Friction sub-tab is active -- a market-
// scoped (not cross-market) overview of that market's own community-
// opposition/approval history, per Jared's ask, with the three metric
// cards doubling as shortcuts into the matching sub-tab.
export default function DevelopmentFrictionOverview({
  market,
  cases,
  onSelectView,
}: {
  market: Market;
  cases: DevelopmentFrictionCaseWithSource[];
  onSelectView: (view: "frictionOpposed" | "frictionDelayed" | "frictionFailed") => void;
}) {
  const marketCases = cases.filter((c) => c.market_id === market.id);
  const delayedCount = marketCases.filter((c) => DELAYED_OUTCOMES.includes(c.outcome)).length;
  const failedCount = marketCases.filter((c) => FAILED_OUTCOMES.includes(c.outcome)).length;
  const resolvedCount = marketCases.filter((c) => RESOLVED_OUTCOMES.includes(c.outcome)).length;

  const cards: { key: "frictionOpposed" | "frictionDelayed" | "frictionFailed"; label: string; value: number; iconPaths: readonly string[]; color: string }[] = [
    { key: "frictionOpposed", label: "Opposed", value: marketCases.length, iconPaths: ICON_ALERT, color: "#1c1c1c" },
    { key: "frictionDelayed", label: "Delayed", value: delayedCount, iconPaths: ICON_CLOCK, color: "#f59e0b" },
    { key: "frictionFailed", label: "Failed", value: failedCount, iconPaths: ICON_X_CIRCLE, color: "#ef4444" },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">
          Development Friction · {market.name}, {market.state}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#1c1c1c]/70">{headline(market, marketCases.length, delayedCount, failedCount, resolvedCount)}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectView(card.key)}
            className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4 text-left transition hover:border-[#1c1c1c]/20"
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${card.color}1a`, color: card.color }}
              >
                <Icon paths={card.iconPaths} className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-[#1c1c1c]/70">{card.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#1c1c1c]">{card.value}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
