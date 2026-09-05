import Icon from "./Icon";

export type MetricCard = {
  key: string;
  label: string;
  value: string;
  weeklyDelta: number;
  iconPaths: readonly string[];
  color: string;
  onClick?: () => void;
};

// A row of small "current value + change vs. last 7 days" cards --
// weeklyDelta is a real count of items dated within the last 7 days
// (see ShiftDashboardView), not a fabricated trend; 0 renders as a plain
// gray "steady" state rather than a fake up/down arrow.
export default function MetricCardRow({ cards }: { cards: MetricCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={card.onClick}
          disabled={!card.onClick}
          className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4 text-left transition hover:border-[#1c1c1c]/20 disabled:cursor-default"
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
          <p className="mt-0.5 text-xs" style={{ color: card.weeklyDelta > 0 ? "#22c55e" : "#1c1c1c66" }}>
            {card.weeklyDelta > 0 ? `↑ +${card.weeklyDelta}` : "—"} vs. previous 7 days
          </p>
        </button>
      ))}
    </div>
  );
}
