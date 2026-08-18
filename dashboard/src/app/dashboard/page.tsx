import { createClient } from "@/lib/supabase/server";
import NewsSection from "@/components/NewsSection";
import CatalystSpotlight from "@/components/CatalystSpotlight";
import AskBar from "@/components/AskBar";
import DevelopmentIntelligenceView, { type MapCategory } from "@/components/intelligence/DevelopmentIntelligenceView";
import { selectMarket } from "@/lib/selectMarket";
import { getMapLayerData } from "@/lib/queries/mapLayers";
import { getRecentProjectEvents } from "@/lib/queries/planIntelligence";
import type { Market, UpcomingDecisionWithSource } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: MapCategory[] = ["all", "plans", "opportunities", "potential"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { market?: string; category?: string; select?: string; selectType?: string };
}) {
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

  const category: MapCategory = VALID_CATEGORIES.includes(searchParams.category as MapCategory)
    ? (searchParams.category as MapCategory)
    : "plans";

  // Deep-link from the AskBar's "View on map" link -- pre-selects and
  // flies to a specific project/opportunity pin named by the AI's answer.
  const selectType = searchParams.selectType;
  const initialSelection: { type: "project" | "opportunity"; id: string } | null =
    searchParams.select && (selectType === "project" || selectType === "opportunity")
      ? { type: selectType, id: searchParams.select }
      : null;

  const [
    { projects, parcels, opportunities, catalysts, opportunityZones, growthAreas, potentialSites },
    { data: recentActivity },
    { data: decisions },
  ] = await Promise.all([
      getMapLayerData(supabase, market.id),
      // Recent Activity news headlines -- project_events is already an
      // append-only log (admin-made status changes, collection-pipeline
      // discoveries, everything), so News needs no separate data-entry
      // step of its own. Same rows Timeline reads, just the latest 5.
      getRecentProjectEvents(supabase, market.id, 5),
      supabase
        .from("upcoming_decisions")
        .select("*, source:sources(*)")
        .eq("market_id", market.id)
        .eq("status", "scheduled")
        .order("decision_date", { ascending: true })
        .limit(6)
        .returns<UpcomingDecisionWithSource[]>(),
    ]);

  // New Opportunities news headlines -- newest-added first, reusing the
  // same fetch as the map (no extra query needed).
  const newOpportunities = [...(opportunities ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Catalyst Spotlight is an editorial pick (admin-flagged via
  // is_spotlight); fall back to the highest-value catalyst so the section
  // isn't empty before an admin has made a pick.
  const spotlightCatalyst =
    (catalysts ?? []).find((c) => c.is_spotlight) ??
    [...(catalysts ?? [])].sort((a, b) => (b.estimated_value ?? 0) - (a.estimated_value ?? 0))[0] ??
    null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[#1c1c1c]">
        {market.name}, {market.state}
      </h1>

      <AskBar marketName={market.name} marketSlug={market.slug} />

      <DevelopmentIntelligenceView
        key={`${market.id}-${category}-${searchParams.select ?? ""}`}
        market={market}
        projects={projects ?? []}
        parcels={parcels ?? []}
        opportunities={opportunities ?? []}
        catalysts={catalysts ?? []}
        opportunityZones={opportunityZones ?? []}
        growthAreas={growthAreas ?? []}
        potentialSites={potentialSites ?? []}
        initialCategory={category}
        initialSelection={initialSelection}
      />

      <NewsSection
        recentActivity={recentActivity ?? []}
        newOpportunities={newOpportunities}
        decisions={decisions ?? []}
      />

      <CatalystSpotlight catalyst={spotlightCatalyst} />
    </div>
  );
}
