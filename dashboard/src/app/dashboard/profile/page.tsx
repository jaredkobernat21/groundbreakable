import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestorProfile, tierAtLeast } from "@/lib/tiers";
import { getOpportunityProfiles, getActiveOpportunityProfile } from "@/lib/queries/opportunityProfiles";
import {
  CONTRACTOR_ROLES,
  PROFESSIONAL_ROLE_LABEL,
  SUBSCRIPTION_TIER_LABEL,
  SUBSCRIPTION_TIER_TAGLINE,
  type Market,
  type ProfessionalRole,
  type SubscriptionTier,
} from "@/lib/types";
import OpportunityProfileForm from "@/components/profile/OpportunityProfileForm";
import { updateRoleAndTier, upsertOpportunityProfile } from "./actions";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";
const inputClass =
  "w-full rounded-lg border border-[#1c1c1c]/15 bg-white px-3 py-2 text-sm text-[#1c1c1c] outline-none focus:border-[#1c1c1c]/40";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-[#1c1c1c]/40";

const TIER_ORDER: SubscriptionTier[] = ["access", "intelligence", "partner"];

export default async function ProfilePage({ searchParams }: { searchParams: { onboarding?: string } }) {
  const supabase = createClient();
  const account = await getCurrentInvestorProfile(supabase);
  if (!account) redirect("/login");

  const { data: marketsData } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const markets = marketsData ?? [];

  const profiles = tierAtLeast(account.subscription_tier, "intelligence")
    ? await getOpportunityProfiles(supabase, account.id)
    : [];
  const activeProfile = getActiveOpportunityProfile(profiles);

  const defaultProfileType = account.professional_role && CONTRACTOR_ROLES.includes(account.professional_role) ? "contractor" : "investor_developer";
  const upsertProfileAction = upsertOpportunityProfile.bind(null, activeProfile?.id ?? null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">My Profile</h1>
        <p className="mt-1 text-sm text-[#1c1c1c]/60">
          Your role shapes what the dashboard emphasizes. Your Opportunity Profile (Intelligence and Partner) tells
          Groundbreakable exactly what to look for.
        </p>
      </div>

      {searchParams.onboarding === "1" && (
        <div className="rounded-2xl border border-[#B08D57]/30 bg-[#B08D57]/10 p-4 text-sm text-[#8a6a3f]">
          Welcome to Groundbreakable — pick your role below to get started. Everything else in the dashboard adjusts
          to fit it.
        </div>
      )}

      <section className={cardClass}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">Role & Plan</h2>
        <form action={updateRoleAndTier} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="professional_role">Your Role</label>
            <select id="professional_role" name="professional_role" defaultValue={account.professional_role ?? ""} required className={inputClass}>
              <option value="" disabled>
                Choose a role…
              </option>
              {Object.entries(PROFESSIONAL_ROLE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="subscription_tier">Plan</label>
            <select id="subscription_tier" name="subscription_tier" defaultValue={account.subscription_tier} className={inputClass}>
              {TIER_ORDER.map((t) => (
                <option key={t} value={t}>
                  {SUBSCRIPTION_TIER_LABEL[t]} — {SUBSCRIPTION_TIER_TAGLINE[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <button type="submit" className="rounded-full bg-[#1c1c1c] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1c1c1c]/85">
              Save
            </button>
          </div>
        </form>
      </section>

      {tierAtLeast(account.subscription_tier, "intelligence") ? (
        <section className={cardClass}>
          <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">Detailed Opportunity Profile</h2>
          <p className="mb-4 text-xs text-[#1c1c1c]/50">
            This drives your personalized Opportunities feed, Match Scores, and the AI analyst — the more specific,
            the better the matches.
          </p>
          <OpportunityProfileForm
            action={upsertProfileAction}
            profile={activeProfile}
            markets={markets}
            defaultProfileType={defaultProfileType as never}
          />
        </section>
      ) : (
        <section className={cardClass}>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">Detailed Opportunity Profile</h2>
          <p className="text-sm text-[#1c1c1c]/60">
            Upgrade to <span className="font-medium text-[#1c1c1c]">Intelligence</span> to define exactly what you
            want Groundbreakable to look for — target geography, asset types, size, development stage, and more —
            and get a personalized, scored Opportunities feed built from it.
          </p>
        </section>
      )}
    </div>
  );
}
