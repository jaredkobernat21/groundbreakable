import { NEUTRAL_ICON_COLOR, OPPORTUNITY_SIGNAL_PRIORITY, OPPORTUNITY_TYPE_LABEL, type OpportunityType } from "@/lib/types";
import { OPPORTUNITY_SIGNAL_ICON, opportunityIconSvgMarkup } from "@/lib/markerIcons";

// Same breakdown pattern as DevelopmentLegend for Activity, but counts by
// signal rather than by a single category -- a property can carry more
// than one signal at once, so counts here can sum to more than the total
// number of opportunities.
export default function OpportunityLegend({
  counts,
}: {
  counts: Partial<Record<OpportunityType, number>>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
      <ul className="space-y-1.5">
        {OPPORTUNITY_SIGNAL_PRIORITY.map((type) => (
          <li key={type} className="flex items-center gap-2 text-xs text-white/70">
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: opportunityIconSvgMarkup(OPPORTUNITY_SIGNAL_ICON[type], {
                  size: 13,
                  stroke: NEUTRAL_ICON_COLOR,
                  strokeWidth: 2,
                }),
              }}
            />
            <span className="flex-1">{OPPORTUNITY_TYPE_LABEL[type]}</span>
            <span className="text-white/30">{counts[type] ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
