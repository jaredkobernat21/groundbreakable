import type { EntitlementCaseWithSource, ShiftWithSource } from "./types";
import { ENTITLEMENT_CASE_STATUS_LABEL } from "./types";

// A "Plan" is one of two underlying record kinds merged into a single
// concept for the Plans feature (per the PLANS/OPPORTUNITIES redesign,
// 2026-09-25): a bare shift (category plans/infrastructure -- a news-
// sourced signal with no formal case on file yet) or an entitlement_cases
// row (a real rezoning/annexation/etc. request with its own request ->
// hearing -> decision lifecycle). Kept as a tagged union over the two raw
// records rather than flattening into one shape -- their detail views are
// different enough (see PlanDetailPanel) that a merged shape would just
// mean re-deriving which kind it was anyway.
export type PlanItem =
  | { kind: "shift"; id: string; shift: ShiftWithSource }
  | { kind: "entitlement"; id: string; case: EntitlementCaseWithSource };

// Composite selection id -- see lib/opportunityRules.ts's
// `project-opportunity-${id}` for the same "prefix by kind" convention
// already used elsewhere in this codebase for synthetic/merged ids.
export function planItemKey(item: PlanItem): string {
  return `plan-${item.kind}-${item.id}`;
}

export function planItemDate(item: PlanItem): string {
  if (item.kind === "shift") return item.shift.event_date;
  return item.case.application_date ?? item.case.planning_commission_hearing_date ?? item.case.created_at.slice(0, 10);
}

export function planItemLocation(item: PlanItem): { lat: number; lng: number } | null {
  if (item.kind === "shift") {
    return item.shift.lat != null && item.shift.lng != null ? { lat: item.shift.lat, lng: item.shift.lng } : null;
  }
  return item.case.latitude != null && item.case.longitude != null ? { lat: item.case.latitude, lng: item.case.longitude } : null;
}

export function planItemTitle(item: PlanItem): string {
  if (item.kind === "shift") return item.shift.event;
  return item.case.case_number ? `${item.case.case_number} — ${item.case.address ?? "Address not on file"}` : item.case.address ?? "Untitled case";
}

export function planItemSubtitle(item: PlanItem): string {
  if (item.kind === "shift") return item.shift.shift_type ? item.shift.shift_type.replace(/_/g, " ") : "Plan signal";
  return ENTITLEMENT_CASE_STATUS_LABEL[item.case.status];
}

// Merges the market's shifts (already category-filtered by the caller --
// see ACTIVE_SHIFT_CATEGORIES) and entitlement_cases into one
// chronological feed, newest first.
export function buildPlanItems(shifts: ShiftWithSource[], entitlementCases: EntitlementCaseWithSource[]): PlanItem[] {
  const items: PlanItem[] = [
    ...shifts.map((shift): PlanItem => ({ kind: "shift", id: shift.id, shift })),
    ...entitlementCases.map((entitlementCase): PlanItem => ({ kind: "entitlement", id: entitlementCase.id, case: entitlementCase })),
  ];
  return items.sort((a, b) => planItemDate(b).localeCompare(planItemDate(a)));
}
