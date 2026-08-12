import type { ActivityPhase, ProjectStatus } from "./types";

const COMPLETED_WINDOW_DAYS = 183; // ~6 months -- older completions drop out of Activity

// Activity's primary grouping axis (Planning/Active/Completed), derived
// from status rather than stored. on_hold/cancelled projects fall outside
// all three phases and simply don't appear in the Activity view.
export function resolveActivityPhase(status: ProjectStatus, dateUpdated: string): ActivityPhase | null {
  if (status === "on_hold" || status === "cancelled") return null;
  if (status === "completed") {
    const daysAgo = (Date.now() - new Date(dateUpdated).getTime()) / 86_400_000;
    return daysAgo <= COMPLETED_WINDOW_DAYS ? "completed" : null;
  }
  if (status === "permitted" || status === "under_construction") return "active";
  return "planning"; // proposed, planning_review, filed, under_review, approved
}
