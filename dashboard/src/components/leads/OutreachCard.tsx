import type { GblLeadWithProperty, GblPropertyIntelligence, InteractionType } from "@/lib/leads/types";
import { logInteraction } from "@/app/leads/[id]/actions";

const BUTTONS: { type: InteractionType; label: string; tone?: string }[] = [
  { type: "called", label: "Called" },
  { type: "texted", label: "Texted" },
  { type: "emailed", label: "Emailed" },
  { type: "no_answer", label: "No Answer" },
  { type: "interested", label: "Interested", tone: "border-emerald-300 text-emerald-700 hover:bg-emerald-50" },
  { type: "not_interested", label: "Not Interested", tone: "border-[#1c1c1c]/15 text-[#1c1c1c]/50" },
  { type: "wrong_number", label: "Wrong Number", tone: "border-[#1c1c1c]/15 text-[#1c1c1c]/50" },
  { type: "do_not_contact", label: "Do Not Contact", tone: "border-red-300 text-red-700 hover:bg-red-50" },
];

export default function OutreachCard({ lead, intelligence }: { lead: GblLeadWithProperty; intelligence: GblPropertyIntelligence | null }) {
  const likelySituation =
    lead.property.existing_structure === false && intelligence?.permit_found !== true
      ? "Recently purchased vacant residential land with no detected building permit."
      : "Recently purchased land — verify current build status before reaching out.";

  const boundLogInteraction = logInteraction.bind(null, lead.id);

  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
      <h2 className="mb-3 font-serif text-lg font-semibold text-[#1c1c1c]">Recommended Approach</h2>

      <div className="mb-4 space-y-3 text-sm">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Likely situation</div>
          <p className="text-[#1c1c1c]/75">{likelySituation}</p>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Conversation opener</div>
          <p className="text-[#1c1c1c]/75">Ask whether they have started planning what they would like to build on the property.</p>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Groundbreakable fit</div>
          <p className="font-medium text-[#1c1c1c]/85">{lead.score >= 75 ? "Strong" : lead.score >= 50 ? "Worth exploring" : "Uncertain"}</p>
        </div>
      </div>

      <form action={boundLogInteraction} className="space-y-3 border-t border-[#1c1c1c]/10 pt-4">
        <div className="flex flex-wrap gap-2">
          {BUTTONS.map((b) => (
            <button
              key={b.type}
              type="submit"
              name="interaction_type"
              value={b.type}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${b.tone ?? "border-[#1c1c1c]/15 text-[#1c1c1c] hover:bg-[#1c1c1c]/5"}`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <textarea
          name="notes"
          rows={2}
          placeholder="Quick note about this interaction…"
          className="w-full rounded border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#B08D57]"
        />
        <p className="text-xs text-[#1c1c1c]/35">Clicking a button above logs it immediately with whatever note is in this box.</p>
      </form>
    </div>
  );
}
