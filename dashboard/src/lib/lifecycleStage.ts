import type { ProjectStage } from "./types";

// The Development Intelligence spec's 6-rung lifecycle (Jared, 2026-09-06):
// Signal -> Planning -> Approval -> Pre-Construction -> Build -> Completion.
// Derived from the existing ProjectStage rather than stored -- a pure
// mapping layer so it stays reversible and never needs a DB backfill.
export type LifecycleStage = "signal" | "planning" | "approval" | "pre_construction" | "build" | "completion";

export const LIFECYCLE_STAGE_ORDER: LifecycleStage[] = [
  "signal",
  "planning",
  "approval",
  "pre_construction",
  "build",
  "completion",
];

export const LIFECYCLE_STAGE_LABEL: Record<LifecycleStage, string> = {
  signal: "Signal",
  planning: "Planning",
  approval: "Approval",
  pre_construction: "Pre-Construction",
  build: "Build",
  completion: "Completion",
};

// A formal `projects` row is, by definition, past raw-signal activity --
// land sale/rezoning-discussion/acquisition signals with no application
// filed yet live in `shifts`/`development_opportunities`, not here, so
// "signal" never comes out of this function today. permitting is
// genuinely ambiguous between Pre-Construction (demo/grading/utility
// permits) and Build (building permit issued) -- the schema doesn't
// distinguish permit sub-type, so it's mapped conservatively to
// Pre-Construction rather than guessed into Build. on_hold/cancelled/null
// return null ("Stage unclear") rather than forcing a rung with
// insufficient evidence.
export function deriveLifecycleStage(stage: ProjectStage | null): LifecycleStage | null {
  switch (stage) {
    case "proposed":
    case "review_planning":
      return "planning";
    case "approved":
      return "approval";
    case "permitting":
      return "pre_construction";
    case "construction":
      return "build";
    case "complete":
      return "completion";
    case "on_hold":
    case "cancelled":
    case null:
      return null;
  }
}
