import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EntitlementApprovalTypeWithSource,
  EntitlementCase,
  EntitlementCaseDetail,
  EntitlementCaseWithSource,
} from "@/lib/types";

export async function getEntitlementApprovalTypes(
  supabase: SupabaseClient,
  marketId: string
): Promise<EntitlementApprovalTypeWithSource[]> {
  const { data } = await supabase
    .from("entitlement_approval_types")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .order("key")
    .returns<EntitlementApprovalTypeWithSource[]>();

  return data ?? [];
}

export async function getEntitlementCases(
  supabase: SupabaseClient,
  marketId: string
): Promise<EntitlementCase[]> {
  const { data } = await supabase
    .from("entitlement_cases")
    .select("*")
    .eq("market_id", marketId)
    .order("created_at", { ascending: false })
    .returns<EntitlementCase[]>();

  return data ?? [];
}

export async function getEntitlementCasesWithSource(
  supabase: SupabaseClient,
  marketId: string
): Promise<EntitlementCaseWithSource[]> {
  const { data } = await supabase
    .from("entitlement_cases")
    .select("*, source:sources(*)")
    .eq("market_id", marketId)
    .order("created_at", { ascending: false })
    .returns<EntitlementCaseWithSource[]>();

  return data ?? [];
}

// One project can have at most one linked entitlement case today
// (entitlement_cases.project_id) -- used by the Project detail page to
// show the Entitlement section only when a link exists, rather than
// requiring a new dedicated case-detail route for v1.
export async function getEntitlementCaseDetailByProjectId(supabase: SupabaseClient, projectId: string) {
  const { data } = await supabase.from("entitlement_cases").select("id").eq("project_id", projectId).limit(1).returns<{ id: string }[]>();

  const caseId = data?.[0]?.id;
  if (!caseId) return { data: null, error: null };

  return getEntitlementCaseDetail(supabase, caseId);
}

// Full "request -> staff -> public response -> PC -> CC -> changes ->
// result -> timeline" shape for one case (spec §7's precedent-card shape,
// and the property-detail Entitlement tab). Nested PostgREST embeds --
// same pattern as getProjectDetail's parties:project_parties(*, company:
// companies(*)) -- rather than separate round trips.
export async function getEntitlementCaseDetail(
  supabase: SupabaseClient,
  caseId: string
) {
  const { data, error } = await supabase
    .from("entitlement_cases")
    .select(
      `*,
      source:sources(*),
      approval_type:entitlement_approval_types(*),
      events:entitlement_case_events(*, votes:entitlement_case_votes(*, commissioner:entitlement_commissioners(*))),
      changes:entitlement_case_changes(*),
      conditions:entitlement_case_conditions(*),
      public_comments:entitlement_public_comments(*),
      parties:entitlement_case_parties(*)`
    )
    .eq("id", caseId)
    .limit(1)
    .returns<EntitlementCaseDetail[]>();

  return { data: data?.[0] ?? null, error };
}
