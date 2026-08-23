import type { SupabaseClient } from "@supabase/supabase-js";
import type { City, GblLeadWithProperty, PipelineStatus } from "./types";
import type { LeadFilters } from "./constants";
import { purchaseWindowToDate } from "./constants";

export interface LeadQueryOptions {
  cities?: City[];
  purchaseAfter?: string | null;
  noExistingStructure?: boolean;
  ownerTypes?: string[];
  permitFoundIsFalse?: boolean;
  minAcreage?: number | null;
  maxAcreage?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  pipelineStatuses?: PipelineStatus[];
  excludeStatuses?: PipelineStatus[];
  search?: string | null;
}

export function filtersToQueryOptions(filters: Partial<LeadFilters>): LeadQueryOptions {
  return {
    cities: filters.cities,
    purchaseAfter: filters.purchaseWindow ? purchaseWindowToDate(filters.purchaseWindow) : null,
    noExistingStructure: filters.noExistingStructure,
    ownerTypes: filters.ownerTypes,
    permitFoundIsFalse: filters.permitStatus === "no_permit",
    minAcreage: filters.minAcreage,
    maxAcreage: filters.maxAcreage,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };
}

// gbl_property_intelligence is joined in (not filtered server-side on
// permit_found) because Supabase's postgrest query builder can't easily
// express "no intelligence row OR permit_found = false" as an OR across a
// joined table -- so permit filtering happens client-side in queryLeads
// after the fetch. Volume here is intentionally small (10s-100s of rows,
// per the "optimize for 10-25 leads, not thousands" product principle), so
// this is fine.
export async function queryLeads(supabase: SupabaseClient, options: LeadQueryOptions = {}): Promise<GblLeadWithProperty[]> {
  let query = supabase
    .from("gbl_leads")
    .select("*, property:gbl_properties(*)")
    .order("score", { ascending: false });

  if (options.pipelineStatuses?.length) {
    query = query.in("pipeline_status", options.pipelineStatuses);
  }
  if (options.excludeStatuses?.length) {
    query = query.not("pipeline_status", "in", `(${options.excludeStatuses.join(",")})`);
  }
  if (options.ownerTypes?.length) {
    query = query.in("owner_type", options.ownerTypes);
  }
  if (options.search) {
    const term = `%${options.search}%`;
    query = query.ilike("owner_name", term);
  }

  const { data, error } = await query.returns<GblLeadWithProperty[]>();
  if (error) throw new Error(error.message);
  let rows = data ?? [];

  if (options.cities?.length) {
    rows = rows.filter((r) => options.cities!.includes(r.property.city));
  }
  if (options.purchaseAfter) {
    rows = rows.filter((r) => r.property.sale_date && r.property.sale_date >= options.purchaseAfter!);
  }
  if (options.noExistingStructure) {
    rows = rows.filter((r) => r.property.existing_structure === false);
  }
  if (options.minAcreage != null) {
    rows = rows.filter((r) => (r.property.acreage ?? 0) >= options.minAcreage!);
  }
  if (options.maxAcreage != null) {
    rows = rows.filter((r) => (r.property.acreage ?? Infinity) <= options.maxAcreage!);
  }
  if (options.minPrice != null) {
    rows = rows.filter((r) => (r.property.sale_price ?? 0) >= options.minPrice!);
  }
  if (options.maxPrice != null) {
    rows = rows.filter((r) => (r.property.sale_price ?? Infinity) <= options.maxPrice!);
  }

  return rows;
}
