import { createClient } from "@/lib/supabase/server";
import ShiftDashboardView from "@/components/shifts/ShiftDashboardView";
import PersonalizedOverview from "@/components/profile/PersonalizedOverview";
import { selectMarket } from "@/lib/selectMarket";
import { getShifts } from "@/lib/queries/shifts";
import { getActiveProjects } from "@/lib/queries/activeProjects";
import { getBuildabilityZones } from "@/lib/queries/buildability";
import { getInvestments } from "@/lib/queries/investments";
import { getGrowthAreas } from "@/lib/queries/planIntelligence";
import { getProjectPeople } from "@/lib/queries/projectPeople";
import { getDevelopmentOpportunities } from "@/lib/queries/developmentOpportunities";
import { getMarketIndicators, getMarketOverview } from "@/lib/queries/marketOverview";
import { shiftDateRangeToDate } from "@/lib/shiftConstants";
import { getCurrentInvestorProfile, ROLE_DEFAULT_VIEW, tierAtLeast } from "@/lib/tiers";
import { getOpportunityProfiles, getActiveOpportunityProfile } from "@/lib/queries/opportunityProfiles";
import { buildPersonalizedBrief, gatherMarketBundles, resolveBriefMarkets } from "@/lib/generatePersonalizedBrief";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { market?: string } }) {
  const supabase = createClient();

  // RLS scopes this to markets the signed-in investor has access to.
  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();

  const account = await getCurrentInvestorProfile(supabase);

  // Default landing for Intelligence/Partner accounts with a configured
  // Opportunity Profile: an aggregated view across every market they
  // have access to, not one market picked alphabetically (spec, Jared
  // 2026-09-07: "his default market should be 'all' his markets").
  // Explicitly picking a market from the header switcher (?market=) always
  // wins and drills into that single market's full activity feed below --
  // this only governs what shows with no market chosen.
  if (account && tierAtLeast(account.subscription_tier, "intelligence") && !searchParams.market) {
    const profiles = await getOpportunityProfiles(supabase, account.id);
    const activeProfile = getActiveOpportunityProfile(profiles);
    if (activeProfile) {
      const briefMarkets = resolveBriefMarkets(activeProfile, markets ?? []);
      const bundles = await gatherMarketBundles(supabase, briefMarkets);
      const content = buildPersonalizedBrief(account, activeProfile, bundles);
      return <PersonalizedOverview account={account} content={content} coverageMarkets={briefMarkets} />;
    }
  }

  const market = selectMarket(markets ?? [], searchParams.market);

  if (!market) {
    return (
      <p className="text-sm text-[#1c1c1c]/50">
        You don't have access to a market yet — an admin needs to grant you access
        in Supabase.
      </p>
    );
  }

  // Fetch the widest window the filter bar offers ("all") once, and let
  // ShiftDashboardView narrow to 7d/30d/90d/category/audience client-side,
  // no round-trip per filter change.
  const shifts = await getShifts(supabase, market.id, { since: shiftDateRangeToDate("all") });
  const projects = await getActiveProjects(supabase, market.id);
  const buildabilityZones = await getBuildabilityZones(supabase, market.id);
  const investments = await getInvestments(supabase, market.id);
  const { data: momentumAreas } = await getGrowthAreas(supabase, market.id);
  const projectPeople = await getProjectPeople(supabase, market.id);
  const opportunities = await getDevelopmentOpportunities(supabase, market.id);
  const marketIndicators = await getMarketIndicators(supabase, market.id);
  const marketOverview = await getMarketOverview(supabase, market.id);

  const initialView = account?.professional_role ? ROLE_DEFAULT_VIEW[account.professional_role] : undefined;

  return (
    <ShiftDashboardView
      key={market.id}
      market={market}
      shifts={shifts}
      projects={projects}
      buildabilityZones={buildabilityZones}
      investments={investments}
      momentumAreas={momentumAreas ?? []}
      projectPeople={projectPeople}
      opportunities={opportunities}
      marketIndicators={marketIndicators}
      marketOverview={marketOverview}
      initialView={initialView}
    />
  );
}
