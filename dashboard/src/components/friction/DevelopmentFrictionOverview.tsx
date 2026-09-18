import { FRICTION_STATUS_TAB_LABEL, FRICTION_STATUS_TAB_ORDER, type FrictionStatusTab } from "@/lib/frictionStatus";

// Purely computed from real counts -- no generated narrative. `counts`
// already has the developer-search/type/severity/market pill filters
// applied (see frictionStatusCounts in ShiftDashboardView), so this stays
// in sync with whatever the user has actually filtered down to rather
// than a separate always-market-scoped total.
function headline(counts: Record<FrictionStatusTab, number>): string {
  if (counts.all === 0) {
    return "No development friction cases match these filters yet.";
  }
  const parts: string[] = [];
  if (counts.active > 0) parts.push(`${counts.active} active`);
  if (counts.delayed > 0) parts.push(`${counts.delayed} delayed`);
  if (counts.modified > 0) parts.push(`${counts.modified} modified or resolved`);
  if (counts.stopped > 0) parts.push(`${counts.stopped} stopped or failed`);
  return `${counts.all} development friction case${counts.all === 1 ? "" : "s"} on file${
    parts.length > 0 ? `: ${parts.join(", ")}` : ""
  }.`;
}

// The Friction page's header: one real headline plus the All/Active/
// Delayed/Modified/Stopped-Failed status tabs, replacing the three
// separate Opposed/Delayed/Failed primary-nav destinations with a single
// page and a local filter (see frictionStatus.ts).
export default function DevelopmentFrictionOverview({
  counts,
  activeTab,
  onSelectTab,
}: {
  counts: Record<FrictionStatusTab, number>;
  activeTab: FrictionStatusTab;
  onSelectTab: (tab: FrictionStatusTab) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Development Friction</p>
        <p className="mt-1 text-sm leading-relaxed text-[#1c1c1c]/70">{headline(counts)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-full border border-[#1c1c1c]/15 p-1 w-fit">
        {FRICTION_STATUS_TAB_ORDER.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSelectTab(tab)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeTab === tab ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
            }`}
          >
            {FRICTION_STATUS_TAB_LABEL[tab]} ({counts[tab]})
          </button>
        ))}
      </div>
    </div>
  );
}
