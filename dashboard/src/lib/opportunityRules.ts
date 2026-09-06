import type { DevelopmentOpportunityWithSources, ProjectPersonWithSource, ProjectWithSource } from "./types";
import { PROJECT_TYPE_LABEL } from "./types";
import { deriveLifecycleStage, LIFECYCLE_STAGE_LABEL, type LifecycleStage } from "./lifecycleStage";

// Only Approval/Pre-Construction projects are eligible -- the window
// between "entitlement cleared" and "vertical construction started."
// Build-stage projects are deliberately excluded: a project already
// under active construction with no contractor on record is almost
// always a sourcing gap in project_people, not a genuine unfilled
// opportunity, and flagging it as one would be a false claim rather than
// real intelligence.
const ELIGIBLE_STAGES: ReadonlySet<LifecycleStage> = new Set(["approval", "pre_construction"]);

function findPerson(people: ProjectPersonWithSource[], projectId: string, role: "developer" | "contractor") {
  return people.find((p) => p.related_record_type === "project" && p.related_record_id === projectId && p.role === role) ?? null;
}

// Live rule engine for the spec's Builder/Contractor Opportunity logic:
//   developer known + GC/builder not identified + stage at Approval or
//   Pre-Construction -> Builder Opportunity (residential/lot projects)
//   or Contractor Opportunity (everything else -- multifamily, commercial,
//   industrial, mixed use).
// Returns opportunities shaped like DevelopmentOpportunityWithSources so
// they render through the existing Opportunity map/feed/detail panel
// unchanged -- `category` is set to "early_project" (the closest existing
// bucket: a developer-known, not-yet-built signal) and `opportunity_group`
// carries the real classification.
export function computeProjectOpportunities(
  projects: ProjectWithSource[],
  projectPeople: ProjectPersonWithSource[]
): DevelopmentOpportunityWithSources[] {
  const results: DevelopmentOpportunityWithSources[] = [];

  for (const project of projects) {
    const stage = deriveLifecycleStage(project.stage);
    if (stage === null || !ELIGIBLE_STAGES.has(stage)) continue;

    const developerPerson = findPerson(projectPeople, project.id, "developer");
    const developerName = developerPerson?.person_name ?? developerPerson?.company_name ?? project.developer;
    if (!developerName) continue; // no developer on record -- nothing to build an opportunity on

    const contractorPerson = findPerson(projectPeople, project.id, "contractor");
    if (contractorPerson || project.contractor) continue; // contractor already identified -- not an opportunity

    const group = project.project_type === "residential" ? "builder" : "contractor";
    const stageLabel = LIFECYCLE_STAGE_LABEL[stage];
    const typeLabel = project.project_type ? PROJECT_TYPE_LABEL[project.project_type] : "Project";

    // Stage proximity to needing a contractor is the only evidence-based
    // strength signal available here -- Pre-Construction is closer to
    // needing one than Approval, so it reads HIGH; Approval reads MEDIUM.
    const strength: "high" | "medium" = stage === "pre_construction" ? "high" : "medium";

    results.push({
      id: `project-opportunity-${project.id}`,
      market_id: project.market_id,
      address: project.address ?? project.title,
      latitude: project.latitude,
      longitude: project.longitude,
      opportunity_type: `${typeLabel} — ${group === "builder" ? "Vertical Builder Not Identified" : "General Contractor Not Identified"}`,
      strength,
      category: "early_project",
      opportunity_group: group,
      status: `${stageLabel} — developer known, ${group === "builder" ? "builder" : "GC"} not yet identified`,
      related_developer: developerName,
      related_contractor: null,
      signals: [group === "builder" ? "builder_not_identified" : "contractor_not_identified"],
      reasons: [
        `Developer identified: ${developerName}.`,
        `Current stage: ${stageLabel}.`,
        "No contractor identified in available records.",
      ],
      source_ids: [],
      date_identified: project.date_announced ?? project.date_updated,
      created_at: project.date_updated,
      sources: project.source ? [project.source] : [],
    });
  }

  return results;
}
