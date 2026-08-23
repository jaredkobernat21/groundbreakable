import type { GblInteraction, GblLead } from "@/lib/leads/types";
import { INTERACTION_TYPE_LABEL } from "@/lib/leads/types";
import { formatDate } from "@/lib/format";
import { setFollowUp, updateNote } from "@/app/leads/[id]/actions";

function eventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityTimeline({ lead, interactions }: { lead: GblLead; interactions: GblInteraction[] }) {
  const boundSetFollowUp = setFollowUp.bind(null, lead.id);
  const boundUpdateNote = updateNote.bind(null, lead.id);

  const events = [
    { date: lead.created_at, label: `Lead added${lead.source ? ` — ${lead.source.replace(/_/g, " ")}` : ""}` },
    ...interactions.map((i) => ({
      date: i.created_at,
      label: `${INTERACTION_TYPE_LABEL[i.interaction_type]}${i.notes ? ` — ${i.notes}` : ""}${i.author ? ` (${i.author})` : ""}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
      <h2 className="mb-3 font-serif text-lg font-semibold text-[#1c1c1c]">Activity</h2>

      <form action={boundSetFollowUp} className="mb-4 flex items-center gap-2 rounded-lg bg-[#F7F6F2] p-3">
        <label className="text-xs font-medium text-[#1c1c1c]/50">Next follow-up</label>
        <input
          type="date"
          name="next_follow_up"
          defaultValue={lead.next_follow_up ?? ""}
          className="rounded border border-[#1c1c1c]/15 bg-white px-2 py-1 text-sm"
        />
        <button type="submit" className="rounded-full border border-[#1c1c1c]/15 px-3 py-1 text-xs font-medium hover:bg-white">
          Save
        </button>
      </form>

      <form action={boundUpdateNote} className="mb-5">
        <label className="mb-1 block text-xs font-medium text-[#1c1c1c]/50">Short note</label>
        <div className="flex gap-2">
          <input
            name="note"
            defaultValue={lead.note ?? ""}
            className="flex-1 rounded border border-[#1c1c1c]/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#B08D57]"
          />
          <button type="submit" className="rounded-full border border-[#1c1c1c]/15 px-3 py-1 text-xs font-medium hover:bg-[#F7F6F2]">
            Save
          </button>
        </div>
      </form>

      <ul className="space-y-3 border-t border-[#1c1c1c]/10 pt-4">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="w-14 shrink-0 text-xs text-[#1c1c1c]/35">{eventDate(e.date)}</span>
            <span className="text-[#1c1c1c]/75">{e.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
