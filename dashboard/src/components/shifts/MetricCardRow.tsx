export type MetricCard = {
  key: string;
  label: string;
  value: string;
  weeklyDelta: number;
  color: string;
  onClick?: () => void;
};

// A row of small "current value + change vs. last 7 days" cards --
// weeklyDelta is a real count of items dated within the last 7 days
// (see ShiftDashboardView), not a fabricated trend; 0 renders as a plain
// gray "steady" state rather than a fake up/down arrow. Restyled (Jared,
// 2026-09-29) to a minimal "dot + label, big number" layout instead of a
// tinted icon square -- the count should be the loudest thing on the
// card, category color is just a small accent, not a background.
export default function MetricCardRow({ cards }: { cards: MetricCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={card.onClick}
          disabled={!card.onClick}
          className="rounded-xl border border-[#1c1c1c]/8 bg-white px-4 py-3 text-left transition hover:border-[#1c1c1c]/20 disabled:cursor-default"
        >
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: card.color }} />
            <span className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/45">{card.label}</span>
          </div>
          <p className="mt-1.5 text-3xl font-semibold tracking-tight text-[#1c1c1c]">{card.value}</p>
          <p className="mt-0.5 text-xs" style={{ color: card.weeklyDelta > 0 ? "#22c55e" : "#1c1c1c66" }}>
            {card.weeklyDelta > 0 ? `↑ +${card.weeklyDelta}` : "—"} vs. previous 7 days
          </p>
        </button>
      ))}
    </div>
  );
}
