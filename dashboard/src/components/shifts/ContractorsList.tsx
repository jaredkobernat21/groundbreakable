import type { ContractorEntry } from "@/lib/contractors";
import { PROJECT_STAGE_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";

// The "Contractors" tab -- who's actually building, derived from
// projects.developer and permit shifts' raw_data.contractor (see
// buildContractorDirectory). No map: these names don't have their own
// lat/lng, just a list of what they're tied to, same "snapshot list, no
// map" shape as ProjectsList.
export default function ContractorsList({ directory }: { directory: ContractorEntry[] }) {
  if (directory.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">No contractors or developers identified yet for this market.</p>;
  }

  return (
    <div className="divide-y divide-[#1c1c1c]/10">
      {directory.map((entry) => (
        <div key={entry.name} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#1c1c1c]">{entry.name}</h3>
            <div className="flex shrink-0 gap-1">
              {entry.isDeveloper && (
                <span className="rounded-full bg-[#1c1c1c]/10 px-2 py-0.5 text-[10px] font-medium text-[#1c1c1c]/70">Developer</span>
              )}
              {entry.isPermitContractor && (
                <span className="rounded-full bg-[#1c1c1c]/10 px-2 py-0.5 text-[10px] font-medium text-[#1c1c1c]/70">Contractor</span>
              )}
            </div>
          </div>

          <ul className="space-y-1.5">
            {entry.projects.map((p) => (
              <li key={p.id} className="text-xs leading-relaxed text-[#1c1c1c]/70">
                <span className="font-medium text-[#1c1c1c]">{p.title}</span>
                {p.stage && ` — ${PROJECT_STAGE_LABEL[p.stage]}`}
                {p.address && <span className="text-[#1c1c1c]/45"> · {p.address}</span>}
              </li>
            ))}
            {entry.shifts.map((s) => (
              <li key={s.id} className="text-xs leading-relaxed text-[#1c1c1c]/70">
                <span className="font-medium text-[#1c1c1c]">{s.event}</span>
                {formatDate(s.eventDate) && ` — ${formatDate(s.eventDate)}`}
                {s.address && <span className="text-[#1c1c1c]/45"> · {s.address}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
