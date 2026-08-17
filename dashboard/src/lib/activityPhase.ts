import type { ActivityPhase, ProjectStage } from "./types";

const COMPLETED_WINDOW_DAYS = 183; // ~6 months -- older completions drop out of Activity

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
