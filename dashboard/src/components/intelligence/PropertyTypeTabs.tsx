import { OPPORTUNITIES_COLOR, OPPORTUNITY_TYPE_LABEL, type OpportunityType } from "@/lib/types";

const TYPE_ORDER: OpportunityType[] = ["tax_lien", "pre_foreclosure", "absentee_owner", "high_equity_owner", "listing"];

// Property-type filter chips for the Opportunities view. Same visual
// pattern as DevelopmentFilterBar's category chips.
export default function PropertyTypeTabs({
  activeTypes,
  onToggleType,
  onReset,
  typeCounts,
}: {
  activeTypes: Set<OpportunityType>;
  onToggleType: (type: OpportunityType) => void;
  onReset: () => void;
  typeCounts: Partial<Record<OpportunityType, number>>;
}) {
  const filtersActive = activeTypes.size > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
      {TYPE_ORDER.map((type) => {
        const active = activeTypes.has(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggleType(type)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
              active
                ? "border-white/30 bg-white/10 text-white"
                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: OPPORTUNITIES_COLOR }} />
            {OPPORTUNITY_TYPE_LABEL[type]}
            <span className="text-white/30">{typeCounts[type] ?? 0}</span>
          </button>
        );
      })}

      {filtersActive && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto text-xs text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
