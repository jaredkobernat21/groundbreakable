import type { ProjectPersonWithSource } from "@/lib/types";
import { PROJECT_PERSON_CONFIDENCE_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";

const CONFIDENCE_COLOR: Record<string, string> = {
  confirmed: "#22c55e",
  likely: "#eab308",
};

// The Developers/Contractors rail tabs -- one evidence-based entry per
// project_people row, grouped by whoever's named (person, or company
// when no person is named) so one party's work across several
// permits/projects reads as one entry. See project_people migration for
// how each row was sourced -- this just renders it.
export default function PeopleList({ people }: { people: ProjectPersonWithSource[] }) {
  if (people.length === 0) {
    return <p className="p-4 text-sm text-[#1c1c1c]/40">None identified yet for this market.</p>;
  }

  const byName = new Map<string, ProjectPersonWithSource[]>();
  for (const person of people) {
    const key = person.person_name ?? person.company_name ?? "Unknown";
    const existing = byName.get(key);
    if (existing) existing.push(person);
    else byName.set(key, [person]);
  }

  const grouped = Array.from(byName.entries()).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return (
    <div className="divide-y divide-[#1c1c1c]/10">
      {grouped.map(([name, entries]) => (
        <div key={name} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#1c1c1c]">{name}</h3>
              {entries[0].person_name && entries[0].company_name && (
                <p className="text-xs text-[#1c1c1c]/45">{entries[0].company_name}</p>
              )}
            </div>
          </div>

          <ul className="space-y-1.5">
            {entries.map((entry) => (
              <li key={entry.id} className="text-xs leading-relaxed text-[#1c1c1c]/70">
                <span className="font-medium text-[#1c1c1c]">{entry.related_label}</span>
                {formatDate(entry.event_date) && <span className="text-[#1c1c1c]/45"> · {formatDate(entry.event_date)}</span>}
                <span
                  className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                  style={{ backgroundColor: CONFIDENCE_COLOR[entry.confidence] }}
                >
                  {PROJECT_PERSON_CONFIDENCE_LABEL[entry.confidence]}
                </span>
                {entry.evidence_note && <p className="mt-0.5 text-[#1c1c1c]/45">{entry.evidence_note}</p>}
                {entry.source && (
                  <a
                    href={entry.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block text-[#1c1c1c]/50 underline decoration-[#1c1c1c]/20 underline-offset-2 hover:decoration-[#1c1c1c]"
                  >
                    Source: {entry.source.agency}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
