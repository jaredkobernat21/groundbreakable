import type { ProjectStage, ProjectWithSource, ShiftWithSource } from "./types";

export type ContractorLinkedProject = {
  kind: "project";
  id: string;
  title: string;
  stage: ProjectStage | null;
  address: string | null;
};

export type ContractorLinkedShift = {
  kind: "shift";
  id: string;
  event: string;
  eventDate: string;
  address: string | null;
};

export type ContractorEntry = {
  name: string;
  isDeveloper: boolean;
  isPermitContractor: boolean;
  projects: ContractorLinkedProject[];
  shifts: ContractorLinkedShift[];
};

// Builds a directory of who's actually doing the building -- not a
// curated table, just the developer/contractor names already sitting on
// `projects.developer` and `shifts.raw_data->>'contractor'` (permit
// filings that named one), grouped by name so one builder's work across
// several permits/projects reads as one entry instead of scattered rows.
// `raw_data.contractor` is the only raw_data field trusted here --
// `applicant`/`developer`/`funder` on other shift types name landowners
// or grant funders, not contractors, and would misrepresent them as
// builders.
export function buildContractorDirectory(
  projects: ProjectWithSource[],
  shifts: ShiftWithSource[]
): ContractorEntry[] {
  const byName = new Map<string, ContractorEntry>();

  function getOrCreate(name: string): ContractorEntry {
    const existing = byName.get(name);
    if (existing) return existing;
    const entry: ContractorEntry = { name, isDeveloper: false, isPermitContractor: false, projects: [], shifts: [] };
    byName.set(name, entry);
    return entry;
  }

  for (const project of projects) {
    if (!project.developer) continue;
    const entry = getOrCreate(project.developer);
    entry.isDeveloper = true;
    entry.projects.push({ kind: "project", id: project.id, title: project.title, stage: project.stage, address: project.address });
  }

  for (const shift of shifts) {
    const contractor = shift.raw_data?.contractor;
    if (typeof contractor !== "string" || !contractor.trim()) continue;
    const entry = getOrCreate(contractor);
    entry.isPermitContractor = true;
    entry.shifts.push({ kind: "shift", id: shift.id, event: shift.event, eventDate: shift.event_date, address: shift.address });
  }

  return Array.from(byName.values()).sort((a, b) => {
    const countDiff = b.projects.length + b.shifts.length - (a.projects.length + a.shifts.length);
    if (countDiff !== 0) return countDiff;
    return a.name.localeCompare(b.name);
  });
}
