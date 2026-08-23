import type { GblResearch } from "@/lib/leads/types";
import { CONFIDENCE_LABEL } from "@/lib/leads/types";
import { formatDate } from "@/lib/format";
import { addResearch } from "@/app/leads/[id]/actions";

const inputClass = "w-full rounded border border-[#1c1c1c]/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#B08D57]";

export default function ResearchPanel({ propertyId, research }: { propertyId: string; research: GblResearch[] }) {
  const boundAddResearch = addResearch.bind(null, propertyId);

  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
      <h2 className="mb-3 font-serif text-lg font-semibold text-[#1c1c1c]">Manual Research</h2>

      {research.length === 0 && <p className="mb-3 text-sm text-[#1c1c1c]/40">No research notes yet.</p>}
      <ul className="mb-4 space-y-3">
        {research.map((r) => (
          <li key={r.id} className="rounded-lg border border-[#1c1c1c]/8 p-3 text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">{r.category}</span>
              <span className="text-xs text-[#1c1c1c]/35">{CONFIDENCE_LABEL[r.verification_status]}</span>
            </div>
            <p className="text-[#1c1c1c]/80">{r.finding}</p>
            <div className="mt-1 flex items-center justify-between text-xs text-[#1c1c1c]/35">
              <span>{r.author ?? "Unknown author"} · {formatDate(r.created_at.slice(0, 10))}</span>
              {r.source_url && (
                <a href={r.source_url} target="_blank" rel="noreferrer noopener" className="underline decoration-[#1c1c1c]/20 hover:text-[#1c1c1c]">
                  Source
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form action={boundAddResearch} className="grid grid-cols-2 gap-2 border-t border-[#1c1c1c]/10 pt-4">
        <select name="category" className={inputClass}>
          <option value="zoning">Zoning finding</option>
          <option value="utility">Utility provider</option>
          <option value="permit">Permit finding</option>
          <option value="site">Site note</option>
          <option value="other">Other</option>
        </select>
        <select name="verification_status" className={inputClass} defaultValue="needs_confirmation">
          <option value="verified">Verified</option>
          <option value="likely">Likely</option>
          <option value="unknown">Unknown</option>
          <option value="needs_confirmation">Needs confirmation</option>
        </select>
        <div className="col-span-2">
          <textarea name="finding" required rows={2} placeholder="Research note…" className={inputClass} />
        </div>
        <div className="col-span-2">
          <input name="source_url" type="url" placeholder="Source URL (optional)" className={inputClass} />
        </div>
        <div className="col-span-2">
          <button type="submit" className="rounded-full bg-[#1c1c1c] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1c1c1c]/85">
            Add Research
          </button>
        </div>
      </form>
    </div>
  );
}
