import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import PersonalizedOverview from "@/components/profile/PersonalizedOverview";
import { getOpportunityProfiles, getActiveOpportunityProfile } from "@/lib/queries/opportunityProfiles";
import { buildPersonalizedBrief, gatherMarketBundles, resolveBriefMarkets } from "@/lib/generatePersonalizedBrief";
import type { InvestorProfile, Market } from "@/lib/types";

export const dynamic = "force-dynamic";

// Not linked in-app anywhere, and outside middleware.ts's /dashboard/:path*
// auth gate on purpose -- a share-with-anyone link so Dan Lynch (or Jared)
// can see his real, live personalized dashboard without needing his
// Supabase Auth login. Modeled on preview/topeka/page.tsx: reads with the
// service-role client (bypasses RLS), but is hardcoded to the one investor
// row looked up by name below -- there is no id/slug param, so this route
// can never expose any other investor's data. Read-only: nothing here
// writes to the DB.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const INVESTOR_FULL_NAME = "Dan Lynch";

export default async function DanLynchPreviewPage() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
        <p className="max-w-sm text-center text-sm text-[#1c1c1c]/50">
          This preview isn't configured yet — SUPABASE_SERVICE_ROLE_KEY is missing from the server environment.
        </p>
      </main>
    );
  }

  const supabase = createAdminClient();

  const { data: account, error: accountError } = await supabase
    .from("investor_profiles")
    .select("*")
    .eq("full_name", INVESTOR_FULL_NAME)
    .single<InvestorProfile>();

  if (accountError) {
    console.error("preview/dan-lynch: investor_profiles query failed", accountError);
  }

  if (!account) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
        <p className="text-sm text-[#1c1c1c]/50">{INVESTOR_FULL_NAME} not found.</p>
      </main>
    );
  }

  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();

  const profiles = await getOpportunityProfiles(supabase, account.id);
  const activeProfile = getActiveOpportunityProfile(profiles);
  const briefMarkets = resolveBriefMarkets(activeProfile, markets ?? []);
  const bundles = await gatherMarketBundles(supabase, briefMarkets);
  const content = buildPersonalizedBrief(account, activeProfile, bundles);

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-[#1c1c1c]">
      <div className="border-b border-[#1c1c1c]/10 bg-[#1c1c1c] px-4 py-2 text-center text-xs font-medium text-white/70 sm:px-6">
        Preview — a shared, read-only look at {INVESTOR_FULL_NAME}'s live personalized dashboard. Links below lead into
        the full app and require signing in.
      </div>

      <header className="flex items-center gap-2 border-b border-[#1c1c1c]/10 bg-[#f4f2ee] px-4 py-3 sm:px-6 sm:py-4">
        <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
        <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        <PersonalizedOverview account={account} content={content} coverageMarkets={briefMarkets} />
      </main>
    </div>
  );
}
