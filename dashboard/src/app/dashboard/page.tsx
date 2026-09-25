import { createClient } from "@/lib/supabase/server";
import ShiftDashboardView from "@/components/shifts/ShiftDashboardView";
import { selectMarket } from "@/lib/selectMarket";
import { getShifts } from "@/lib/queries/shifts";
import { getActiveProjects } from "@/lib/queries/activeProjects";
import { getBuildabilityZones } from "@/lib/queries/buildability";
import { getInvestments } from "@/lib/queries/investments";
import { getGrowthAreas, getProjectEventsFeed } from "@/lib/queries/planIntelligence";
import { getProjectPeople } from "@/lib/queries/projectPeople";
import { getDevelopmentOpportunities } from "@/lib/queries/developmentOpportunities";
import { getMarketIndicators, getMarketOverview } from "@/lib/queries/marketOverview";
import { getDevelopmentFrictionSignals } from "@/lib/queries/developmentFriction";
import { getEntitlementCaseDetailsByMarket } from "@/lib/queries/entitlementCases";
import { getDevelopmentFrictionCases } from "@/lib/queries/developmentFrictionCases";
import { computeEntitlementRealityScore, type EntitlementRealityScoreResult } from "@/lib/entitlement/score";
import { shiftDateRangeToDate } from "@/lib/shiftConstants";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { market?: string } }) {
  const supabase = createClient();

  // RLS scopes this to markets the signed-in investor has access to.
  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();

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
  const developmentFrictionSignals = await getDevelopmentFrictionSignals(supabase, market.id);
  const entitlementCaseDetails = await getEntitlementCaseDetailsByMarket(supabase, market.id);
  const developmentFrictionCases = await getDevelopmentFrictionCases(supabase);
  const { data: projectEvents } = await getProjectEventsFeed(supabase, market.id);

  // Entitlement Reality Score (spec §9) computed for every case up front --
  // same reasoning as the rest of this page (fetch everything for the
  // market once, filter/select client-side) rather than a round trip per
  // click in PlanDetailPanel. A plain object, not a Map, since this
  // crosses the Server -> Client Component boundary as a prop.
  const entitlementRealityScoresEntries = await Promise.all(
    entitlementCaseDetails.map(async (entitlementCase) => {
      const score = await computeEntitlementRealityScore(supabase, market.id, {
        latitude: entitlementCase.latitude,
        longitude: entitlementCase.longitude,
        existingZoning: entitlementCase.existing_zoning,
        requestedZoning: entitlementCase.requested_zoning,
        proposedUse: entitlementCase.proposed_use,
        acreage: entitlementCase.acreage,
        proposedUnits: entitlementCase.proposed_units,
        planningArea: entitlementCase.planning_area,
        approvalTypeKey: entitlementCase.approval_type?.key ?? null,
        excludeCaseId: entitlementCase.id,
      });
      return [entitlementCase.id, score] as const;
    })
  );
  const entitlementRealityScores = Object.fromEntries(entitlementRealityScoresEntries) as Record<string, EntitlementRealityScoreResult>;

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
      developmentFrictionSignals={developmentFrictionSignals}
      entitlementCaseDetails={entitlementCaseDetails}
      developmentFrictionCases={developmentFrictionCases}
      projectEvents={projectEvents ?? []}
      entitlementRealityScores={entitlementRealityScores}
    />
  );
}
