// Infrastructure sub-typing and structured-field extraction. Infrastructure
// shifts don't have their own table (see ShiftDashboardView's category-
// filtered infrastructure view) -- these are display-layer helpers over
// the existing `shifts.shift_type`/`raw_data` fields, not a schema change,
// so nothing here can show a value the underlying source didn't actually
// report.

export type InfrastructureType =
  | "roads"
  | "water"
  | "sewer"
  | "utilities"
  | "stormwater"
  | "public_facilities"
  | "transit"
  | "other";

export const INFRASTRUCTURE_TYPE_LABEL: Record<InfrastructureType, string> = {
  roads: "Roads",
  water: "Water",
  sewer: "Sewer",
  utilities: "Utilities",
  stormwater: "Stormwater",
  public_facilities: "Public Facilities",
  transit: "Transit / Transportation",
  other: "Other",
};

export const INFRASTRUCTURE_TYPE_COLOR: Record<InfrastructureType, string> = {
  roads: "#94a3b8",
  water: "#38bdf8",
  sewer: "#0ea5e9",
  utilities: "#eab308",
  stormwater: "#818cf8",
  public_facilities: "#22c55e",
  transit: "#f97316",
  other: "#a1a1aa",
};

// `shift_type` is free text and its vocabulary keeps growing as more
// public-record sources get added (same reasoning as shifts.shift_type's
// schema comment) -- this maps the values seen so far onto the spec's
// 7-way taxonomy. A funding grant or an adopted CIP can span any physical
// type, so those (and anything not yet mapped) fall back to "Other"
// rather than a guessed bucket.
const SHIFT_TYPE_TO_INFRASTRUCTURE_TYPE: Record<string, InfrastructureType> = {
  road_project: "roads",
  street_resurfacing: "roads",
  sewer_project: "sewer",
  water_project: "water",
  utility_project: "utilities",
  stormwater_project: "stormwater",
  park_project: "public_facilities",
  public_facility_project: "public_facilities",
  transit_project: "transit",
  transit_grant: "transit",
};

export function inferInfrastructureType(shiftType: string): InfrastructureType {
  return SHIFT_TYPE_TO_INFRASTRUCTURE_TYPE[shiftType] ?? "other";
}

// Cost figures arrive under different raw_data keys depending on the
// source document (a bid award uses "contract_usd", a grant uses
// "grant_amount", a CIP line uses "grants_secured"...) -- checked in a
// fixed priority order. Returns null (rendered as "Not available"), never
// a guess, when none are present.
const COST_KEYS = ["budget", "contract_usd", "grant_amount", "funding_usd", "grants_secured"] as const;

export function extractInfrastructureCost(rawData: Record<string, unknown> | null): number | null {
  if (!rawData) return null;
  for (const key of COST_KEYS) {
    const value = rawData[key];
    if (typeof value === "number") return value;
  }
  return null;
}

export function extractInfrastructureField(rawData: Record<string, unknown> | null, key: string): string | null {
  if (!rawData) return null;
  const value = rawData[key];
  return typeof value === "string" ? value : null;
}
