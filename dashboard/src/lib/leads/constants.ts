import type { City } from "./types";

export interface LeadFilters {
  cities: City[];
  purchaseWindow: "30d" | "90d" | "6m" | "12m" | "18m" | "all";
  noExistingStructure: boolean;
  ownerTypes: string[];
  permitStatus: "no_permit" | "pending" | "recently_issued" | "any";
  minAcreage: number | null;
  maxAcreage: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

// Saved filter preset: "KC SOUTH — BUILD LEADS". The primary opportunity is
// recently-purchased land + plausible residential build + no house permit
// yet, favoring individuals/couples over developers.
export const KC_SOUTH_PRESET: LeadFilters = {
  cities: ["Spring Hill", "Gardner", "Olathe", "Unincorporated Johnson County"],
  purchaseWindow: "12m",
  noExistingStructure: true,
  ownerTypes: ["individual", "couple"],
  permitStatus: "no_permit",
  minAcreage: null,
  maxAcreage: null,
  minPrice: null,
  maxPrice: null,
};

export const PURCHASE_WINDOW_LABEL: Record<LeadFilters["purchaseWindow"], string> = {
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "6m": "Last 6 months",
  "12m": "Last 12 months",
  "18m": "Last 18 months",
  all: "Any time",
};

export function purchaseWindowToDate(window: LeadFilters["purchaseWindow"]): string | null {
  if (window === "all") return null;
  const days: Record<string, number> = { "30d": 30, "90d": 90, "6m": 182, "12m": 365, "18m": 548 };
  const d = new Date();
  d.setDate(d.getDate() - days[window]);
  return d.toISOString().slice(0, 10);
}
