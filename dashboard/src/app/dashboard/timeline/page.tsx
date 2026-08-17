import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { selectMarket } from "@/lib/selectMarket";
import { getProjectEventsFeed } from "@/lib/queries/planIntelligence";
import { formatDate } from "@/lib/format";
import {
  PLAN_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  type Market,
  type PlanCategory,
  type ProjectEventWithProject,
  type ProjectStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORY_FILTERS: { key: PlanCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "development", label: "Development" },
  { key: "land_use", label: "Land Use" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "public_investment", label: "Public Investment" },
];

// event_type is open vocabulary (see the project_events schema comment),
// but every row today still carries the raw ProjectStatus value written
// by the mirror trigger off project_updates -- humanize whichever shape
// shows up rather than assuming one.
function eventTypeLabel(eventType: string): string {
  if (eventType in PROJECT_STATUS_LABEL) {
    return PROJECT_STATUS_LABEL[eventType as ProjectStatus];
  }
  return eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupByDate(events: ProjectEventWithProject[]) {
  const groups: { date: string; events: ProjectEventWithProject[] }[] = [];
  for (const event of events) {
    const last = groups[groups.length - 1];
    if (last && last.date === event.occurred_on) {
      last.events.push(event);
    } else {
      groups.push({ date: event.occurred_on, events: [event] });
    }
  }
  return groups;
}

// "What changed?" (§14) -- every project_event across the market,
// newest first, grouped by day. Each event links back to its project on
// the Map; the Plans category filter is the one dimension with clean
// data across every project today (project_type/growth areas aren't
// populated yet, so those filters wait for later phases).
export default async function TimelinePage({
  searchParams,
}: {
  searchParams: { market?: string; category?: string };
}) {
  const supabase = createClient();

  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const market = selectMarket(markets ?? [], searchParams.market);

  if (!market) {
    return (
      <p className="text-sm text-[#1c1c1c]/50">
        You don't have access to a market yet — an admin needs to grant you access in Supabase.
      </p>
    );
  }

  const activeCategory: PlanCategory | "all" = CATEGORY_FILTERS.some((f) => f.key === searchParams.category)
    ? (searchParams.category as PlanCategory | "all")
    : "all";

  const { data: events } = await getProjectEventsFeed(supabase, market.id, {
    planCategory: activeCategory === "all" ? undefined : activeCategory,
  });

  const groups = groupByDate(events ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1c1c1c]">Timeline</h1>
        <p className="mt-1 text-sm text-[#1c1c1c]/50">
          What's changed in {market.name}, {market.state} — every plan event, chronologically.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/dashboard/timeline?market=${market.slug}${f.key === "all" ? "" : `&category=${f.key}`}`}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              activeCategory === f.key
                ? "bg-[#1c1c1c] text-white"
                : "border border-[#1c1c1c]/15 text-[#1c1c1c]/60 hover:border-[#1c1c1c]/30 hover:text-[#1c1c1c]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-[#1c1c1c]/40">No events for {market.name} yet.</p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.date} className="grid grid-cols-[92px_1fr] gap-4 sm:gap-6">
              <div className="pt-1 text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/40">
                {formatDate(group.date)}
              </div>
              <div className="space-y-4 border-l border-[#1c1c1c]/10 pl-4 sm:pl-6">
                {group.events.map((event) => (
                  <div key={event.id}>
                    <Link
                      href={`/dashboard/map?market=${market.slug}&select=${event.project.id}&selectType=project`}
                      className="font-medium text-[#1c1c1c] hover:underline"
                    >
                      {event.project.title}
                    </Link>
                    {event.project.plan_category && (
                      <span className="ml-2 rounded-full bg-[#1c1c1c]/5 px-2 py-0.5 text-[11px] uppercase tracking-wide text-[#1c1c1c]/40">
                        {PLAN_CATEGORY_LABEL[event.project.plan_category]}
                      </span>
                    )}
                    <p className="mt-0.5 text-sm text-[#1c1c1c]/60">
                      {eventTypeLabel(event.event_type)}
                      {event.note ? ` — ${event.note}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
