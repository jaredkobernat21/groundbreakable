import { ACTIVITY_COLOR, OPPORTUNITIES_COLOR } from "@/lib/types";

// Independent on/off toggles, not exclusive tabs -- both default on, so the
// map shows everything at once ("one view that just shows the whole map"),
// and each can be filtered/hidden separately.
export default function LayerSwitcher({
  showActivity,
  onToggleActivity,
  showOpportunities,
  onToggleOpportunities,
}: {
  showActivity: boolean;
  onToggleActivity: () => void;
  showOpportunities: boolean;
  onToggleOpportunities: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
      <button
        type="button"
        onClick={onToggleActivity}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          showActivity
            ? "border-white/30 bg-white/10 text-white"
            : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
        }`}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: ACTIVITY_COLOR, opacity: showActivity ? 1 : 0.5 }}
        />
        Activity
      </button>
      <button
        type="button"
        onClick={onToggleOpportunities}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          showOpportunities
            ? "border-white/30 bg-white/10 text-white"
            : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
        }`}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: OPPORTUNITIES_COLOR, opacity: showOpportunities ? 1 : 0.5 }}
        />
        Opportunities
      </button>
    </div>
  );
}
