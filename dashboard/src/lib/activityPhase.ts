import type { ActivityPhase, ProjectStage, ProjectStatus } from "./types";

const COMPLETED_WINDOW_DAYS = 183; // ~6 months -- older completions drop out of Activity

// The write-path equivalent of the old derive_project_plan_category_and_stage
// trigger's status->stage half (see the Phase 7 Tier 3 migration that
// dropped it) -- every admin write path now calls this directly instead
// of relying on a DB trigger, so an explicit plan_category/stage set in
// the same insert can't be silently overwritten.
export function deriveStageFromStatus(status: ProjectStatus): ProjectStage {
  switch (status) {
    case "proposed":
      return "proposed";
    case "planning_review":
    case "filed":
    case "under_review":
      return "review_planning";
    case "approved":
      return "approved";
    case "permitted":
      return "permitting";
    case "under_construction":
      return "construction";
    case "completed":
      return "complete";
    case "on_hold":
      return "on_hold";
    case "cancelled":
      return "cancelled";
  }
}

// Activity's primary grouping axis (Planning/Active/Completed), derived
// from stage rather than stored. on_hold/cancelled projects fall outside
// all three phases and simply don't appear in the Activity view. A null
// stage (no admin write path sets it yet) is treated the same way --
// there's nothing to bucket it into.
export function resolveActivityPhase(stage: ProjectStage | null, dateUpdated: string): ActivityPhase | null {
  if (stage === null || stage === "on_hold" || stage === "cancelled") return null;
  if (stage === "complete") {
    const daysAgo = (Date.now() - new Date(dateUpdated).getTime()) / 86_400_000;
    return daysAgo <= COMPLETED_WINDOW_DAYS ? "completed" : null;
  }
  if (stage === "permitting" || stage === "construction") return "active";
  return "planning"; // proposed, review_planning, approved
}
