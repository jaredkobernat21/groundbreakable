import type { SupabaseClient } from "@supabase/supabase-js";
import type { SladeOpportunity } from "./types";

// The nine checks from SLADE/docs/VERIFICATION.md, in the order they're
// documented there. Kept as a single ordered list so the gate's "what's
// missing" output always reads in the same order a person would work
// through it.
export const VERIFICATION_CHECKS = [
  { key: "verification_identity_ok", label: "Property identity (address, parcel, acreage) confirmed" },
  { key: "verification_ownership_ok", label: "Current ownership checked" },
  { key: "verification_listing_ok", label: "Listing status (listed vs. off-market, agent, broker) confirmed" },
  { key: "verification_conflict_ok", label: "Conflict check: recipient is not owner/agent/broker/already involved" },
  { key: "verification_planning_ok", label: "Zoning / planning / entitlement assumptions checked" },
  { key: "verification_infrastructure_ok", label: "Infrastructure status stated as verified/inferred/unknown, not assumed" },
  { key: "verification_client_fit_ok", label: "Matches the client's current active buy box" },
  { key: "verification_prior_history_ok", label: "Not already sent to this client; not previously rejected" },
  { key: "verification_sources_ok", label: "Every major claim has a traceable source" },
] as const satisfies readonly { key: keyof SladeOpportunity; label: string }[];

export interface VerificationGateResult {
  ready: boolean;
  missing: { key: string; label: string }[];
}

// Pure function -- no DB access -- so it's directly testable (see
// __tests__/verification.test.ts) and can be called before attempting a
// write, to explain *why* an opportunity isn't ready rather than letting
// the DB's CHECK constraint (slade_opportunities_ready_requires_verification)
// just reject the update.
export function evaluateVerificationGate(
  opportunity: Pick<SladeOpportunity, (typeof VERIFICATION_CHECKS)[number]["key"]>
): VerificationGateResult {
  const missing = VERIFICATION_CHECKS.filter((check) => !opportunity[check.key]).map((check) => ({
    key: check.key,
    label: check.label,
  }));
  return { ready: missing.length === 0, missing };
}

// Attempts to move an opportunity to ready_to_deliver. Checks the gate
// itself first so the caller gets back which checks are missing instead
// of a raw Postgres constraint-violation error.
export async function setOpportunityStatus(
  supabase: SupabaseClient,
  opportunityId: string,
  status: SladeOpportunity["opportunity_status"],
  opportunity?: Pick<SladeOpportunity, (typeof VERIFICATION_CHECKS)[number]["key"]>
): Promise<{ opportunity: SladeOpportunity } | { error: string; gate: VerificationGateResult }> {
  if (status === "ready_to_deliver") {
    let current = opportunity;
    if (!current) {
      const { data, error } = await supabase
        .from("slade_opportunities")
        .select(VERIFICATION_CHECKS.map((c) => c.key).join(","))
        .eq("id", opportunityId)
        .returns<Pick<SladeOpportunity, (typeof VERIFICATION_CHECKS)[number]["key"]>[]>();
      if (error) throw new Error(error.message);
      if (!data?.[0]) throw new Error(`slade_opportunities ${opportunityId} not found`);
      current = data[0];
    }

    const gate = evaluateVerificationGate(current);
    if (!gate.ready) {
      return {
        error: "Cannot mark ready_to_deliver — the verification gate has unresolved checks.",
        gate,
      };
    }
  }

  const { data, error } = await supabase
    .from("slade_opportunities")
    .update({ opportunity_status: status, updated_at: new Date().toISOString() })
    .eq("id", opportunityId)
    .select("*")
    .returns<SladeOpportunity[]>();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new Error(`slade_opportunities ${opportunityId} not found`);
  return { opportunity: data[0] };
}
