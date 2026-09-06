import type { ProjectPersonRole, ProjectPersonWithSource, ProjectType, ProjectWithSource } from "./types";
import { deriveLifecycleStage } from "./lifecycleStage";

export type CompanyStageBreakdown = {
  planning: number; // Signal/Planning/Approval -- entitlement not yet cleared to build
  active: number; // Pre-Construction/Build
  completed: number; // Completion
  unclear: number; // on_hold/cancelled/no stage set
};

export type CompanyPartner = {
  name: string;
  role: ProjectPersonRole;
  sharedProjectCount: number;
};

export type CompanyProfile = {
  key: string; // grouping identity -- person_name, falling back to company_name (same resolution PeopleList always used)
  displayName: string;
  companyName: string | null;
  role: ProjectPersonRole;
  // Every project_people row naming this party -- both project- and
  // shift-linked (permits/rezonings/etc.) -- doubling as the activity
  // timeline. This is the "N Known Projects/Permits" headline count.
  records: ProjectPersonWithSource[];
  // Only the subset that resolves to a real `projects` row -- the basis
  // for stageBreakdown/estimatedVolume/primaryType. Per Jared's own rule
  // ("don't present permit count as completed projects unless the data
  // confirms completion"), a shift-linked permit never counts toward
  // stageBreakdown -- only a real project's stage does.
  projects: ProjectWithSource[];
  stageBreakdown: CompanyStageBreakdown;
  // Sum of project_value across linked projects that actually have one --
  // null (rendered "Not available") when none do, never a fabricated $0.
  estimatedVolume: number | null;
  primaryType: ProjectType | null;
  partners: CompanyPartner[];
};

function groupKey(p: ProjectPersonWithSource): string {
  return p.person_name ?? p.company_name ?? "Unknown";
}

function stageBucket(stage: ProjectWithSource["stage"]): keyof CompanyStageBreakdown {
  const lifecycle = deriveLifecycleStage(stage);
  if (lifecycle === "completion") return "completed";
  if (lifecycle === "pre_construction" || lifecycle === "build") return "active";
  if (lifecycle === "planning" || lifecycle === "approval") return "planning";
  return "unclear";
}

// Builds one profile per uniquely-named developer/contractor, computing
// every rollup live from project_people + projects -- no persistent
// company table, no stored counts, so nothing here can drift out of sync
// with the underlying evidence.
export function buildCompanyProfiles(
  role: ProjectPersonRole,
  allPeople: ProjectPersonWithSource[],
  projects: ProjectWithSource[]
): CompanyProfile[] {
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const byKey = new Map<string, ProjectPersonWithSource[]>();
  for (const person of allPeople) {
    if (person.role !== role) continue;
    const key = groupKey(person);
    const existing = byKey.get(key);
    if (existing) existing.push(person);
    else byKey.set(key, [person]);
  }

  const profiles: CompanyProfile[] = [];

  for (const [key, records] of byKey) {
    const sortedRecords = [...records].sort((a, b) => (b.event_date ?? "").localeCompare(a.event_date ?? ""));

    const projectIds = Array.from(
      new Set(records.filter((r) => r.related_record_type === "project").map((r) => r.related_record_id))
    );
    const linkedProjects = projectIds
      .map((id) => projectById.get(id))
      .filter((p): p is ProjectWithSource => p != null)
      .sort((a, b) => b.date_updated.localeCompare(a.date_updated));

    const stageBreakdown: CompanyStageBreakdown = { planning: 0, active: 0, completed: 0, unclear: 0 };
    for (const project of linkedProjects) stageBreakdown[stageBucket(project.stage)]++;

    const knownValues = linkedProjects.map((p) => p.project_value).filter((v): v is number => v != null);
    const estimatedVolume = knownValues.length > 0 ? knownValues.reduce((sum, v) => sum + v, 0) : null;

    const typeCounts = new Map<ProjectType, number>();
    for (const project of linkedProjects) {
      if (project.project_type == null) continue;
      typeCounts.set(project.project_type, (typeCounts.get(project.project_type) ?? 0) + 1);
    }
    let primaryType: ProjectType | null = null;
    let primaryTypeCount = 0;
    for (const [type, count] of typeCounts) {
      if (count > primaryTypeCount) {
        primaryType = type;
        primaryTypeCount = count;
      }
    }

    // "Who else shows up on the same projects" -- a plain self-join over
    // project_people, not a separate relationship table, so it's always
    // exactly as current as the underlying evidence.
    const partnerCounts = new Map<string, CompanyPartner>();
    for (const project of linkedProjects) {
      const coRecords = allPeople.filter((p) => p.related_record_type === "project" && p.related_record_id === project.id);
      for (const co of coRecords) {
        const coKey = groupKey(co);
        if (coKey === key) continue;
        const existing = partnerCounts.get(coKey);
        if (existing) existing.sharedProjectCount++;
        else partnerCounts.set(coKey, { name: coKey, role: co.role, sharedProjectCount: 1 });
      }
    }
    const partners = Array.from(partnerCounts.values()).sort((a, b) => b.sharedProjectCount - a.sharedProjectCount);

    profiles.push({
      key,
      displayName: key,
      companyName: records[0].person_name && records[0].company_name ? records[0].company_name : null,
      role,
      records: sortedRecords,
      projects: linkedProjects,
      stageBreakdown,
      estimatedVolume,
      primaryType,
      partners,
    });
  }

  return profiles.sort((a, b) => b.records.length - a.records.length || a.displayName.localeCompare(b.displayName));
}
