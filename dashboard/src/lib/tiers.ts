import type { SupabaseClient } from "@supabase/supabase-js";
import type { View } from "@/components/shifts/ShiftDashboardView";
import type { InvestorProfile, ProfessionalRole, SubscriptionTier } from "./types";

// Role-based Access dashboard (section "TIER 1 — ACCESS"): "which
// categories appear first" is the one thing role is allowed to affect --
// no filtering, no personalized matching (that's Intelligence). Each
// role maps to the single tab most representative of the spec's own
// per-role examples (e.g. "a contractor might see Projects and Permits
// emphasized" -> permits).
export const ROLE_DEFAULT_VIEW: Record<ProfessionalRole, View> = {
  investor: "market",
  developer: "buildability",
  builder: "projects",
  general_contractor: "permits",
  concrete_contractor: "permits",
  electrician: "permits",
  plumber: "permits",
  landscaper: "projects",
  realtor: "market",
  other: "momentum",
};

// The whole product's gating logic in one place -- three tiers, ranked,
// so every gate is just "is this account's tier at least X" rather than
// a scattered set of tier === comparisons that drift out of sync as
// tiers get added later (spec: "structure the product so these levels
// are technically possible" without building real billing yet).
const TIER_RANK: Record<SubscriptionTier, number> = { access: 0, intelligence: 1, partner: 2 };

export function tierAtLeast(tier: SubscriptionTier, minimum: SubscriptionTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[minimum];
}

// The signed-in account's own row -- role (admin/investor permission
// flag) + professional_role (onboarding persona) + subscription_tier
// (Access/Intelligence/Partner), all on investor_profiles. Returns null
// for a signed-out request or one where the auth user has no
// investor_profiles row yet (shouldn't happen post-onboarding, but the
// dashboard layout already handles "no access" for that case).
export async function getCurrentInvestorProfile(supabase: SupabaseClient): Promise<InvestorProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("investor_profiles").select("*").eq("id", user.id).returns<InvestorProfile[]>();
  return data?.[0] ?? null;
}
