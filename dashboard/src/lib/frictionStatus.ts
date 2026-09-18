import type { FrictionCaseOutcome } from "./types";

// The Friction page's single set of status tabs (All/Active/Delayed/
// Modified/Stopped-Failed) -- replaces the old Opposed/Delayed/Failed
// primary-nav split with one page and a local filter, per the Development
// Intelligence nav simplification. Every FrictionCaseOutcome value the
// database can hold (resolved/modified/delayed/withdrawn/denied/
// abandoned/pending) is covered by exactly one non-"all" tab below, so no
// case is ever hidden by switching tabs.
export type FrictionStatusTab = "all" | "active" | "delayed" | "modified" | "stopped";

export const FRICTION_STATUS_TAB_ORDER: FrictionStatusTab[] = ["all", "active", "delayed", "modified", "stopped"];

export const FRICTION_STATUS_TAB_LABEL: Record<FrictionStatusTab, string> = {
  all: "All",
  active: "Active",
  delayed: "Delayed",
  modified: "Modified",
  stopped: "Stopped/Failed",
};

// null means "no restriction" (the "all" tab).
export function outcomesForFrictionStatusTab(tab: FrictionStatusTab): FrictionCaseOutcome[] | null {
  switch (tab) {
    case "active":
      return ["pending"];
    case "delayed":
      return ["delayed"];
    case "modified":
      return ["modified", "resolved"];
    case "stopped":
      return ["denied", "withdrawn", "abandoned"];
    default:
      return null;
  }
}
