"use client";

// Buyer Criteria ranked-matches results list (2026-10-04) -- "Show me the best sites that fit
// this buyer's deal profile," per the data-center-buyer brief's Section 14 worked example. Same
// slide-out chrome as FollowingPanel.tsx (filter/following panels already use this pattern) --
// a results list, not a new standalone search product.
export type BuyerMatch = {
  catalystId: string;
  title: string;
  matchPercent: number;
  lines: { status: "match" | "caution" | "unknown"; text: string }[];
};

const STATUS_ICON: Record<BuyerMatch["lines"][number]["status"], string> = {
  match: "✓",
  caution: "△",
  unknown: "✕",
};

const STATUS_COLOR: Record<BuyerMatch["lines"][number]["status"], string> = {
  match: "text-emerald-300",
  caution: "text-amber-300",
  unknown: "text-white/35",
};

export default function BuyerMatchPanel({
  open,
  onClose,
  matches,
  onSelectCatalyst,
}: {
  open: boolean;
  onClose: () => void;
  matches: BuyerMatch[];
  onSelectCatalyst: (id: string) => void;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-[340px] overflow-y-auto border-l border-white/10 bg-black/90 p-5 shadow-2xl backdrop-blur-xl max-sm:right-3 max-sm:w-[calc(100%-1.5rem)]"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Ranked Matches ({matches.length})</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white">
            ✕
          </button>
        </div>

        {matches.length === 0 ? (
          <p className="text-sm text-white/40">No Potential sites match this criteria combination yet.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <button
                key={m.catalystId}
                type="button"
                onClick={() => {
                  onSelectCatalyst(m.catalystId);
                  onClose();
                }}
                className="block w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:border-white/25"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{m.title}</span>
                  <span className="text-xs font-semibold text-white/70">{m.matchPercent}% MATCH</span>
                </div>
                <ul className="space-y-0.5">
                  {m.lines.map((line, i) => (
                    <li key={i} className={`flex gap-1.5 text-xs ${STATUS_COLOR[line.status]}`}>
                      <span>{STATUS_ICON[line.status]}</span>
                      <span className="text-white/60">{line.text}</span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
