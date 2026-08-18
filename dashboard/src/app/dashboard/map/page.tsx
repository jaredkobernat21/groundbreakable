import { createClient } from "@/lib/supabase/server";
import { selectMarket } from "@/lib/selectMarket";
import { getMapLayerData } from "@/lib/queries/mapLayers";
import DevelopmentIntelligenceView, { type MapCategory } from "@/components/intelligence/DevelopmentIntelligenceView";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: MapCategory[] = ["all", "plans", "opportunities", "potential"];

// The dedicated Map view (Phase 3 of the architecture review) -- same
// DevelopmentIntelligenceView component and the same getMapLayerData
// fetch the Overview page's embedded map already uses, just given the
// full page instead of sharing it with News/Spotlight. Deep-links from
// AskBar and the Projects page point here now.
export default async function MapPage({
  searchParams,
}: {
  searchParams: { market?: string; category?: string; select?: string; selectType?: string };
}) {
  const supabase = createClient();

  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const market = selectMarket(markets ?? [], searchParams.market);

  if (!market) {
    return (
      <p className="text-sm text-[#1c1c1c]/50">
        You don't have access to a market yet — an admin needs to grant you access in Supabase.
      </p>
    );
  }

  const category: MapCategory = VALID_CATEGORIES.includes(searchParams.category as MapCategory)
    ? (searchParams.category as MapCategory)
    : "plans";

  const selectType = searchParams.selectType;
  const initialSelection: { type: "project" | "opportunity"; id: string } | null =
    searchParams.select && (selectType === "project" || selectType === "opportunity")
      ? { type: selectType, id: searchParams.select }
      : null;

  const { projects, parcels, opportunities, catalysts, opportunityZones, growthAreas, potentialSites } =
    await getMapLayerData(supabase, market.id);

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-semibold text-[#1c1c1c]">Map</h1>
        <p className="mt-1 text-sm text-[#1c1c1c]/50">
          Where development is happening in {market.name}, {market.state}.
        </p>
      </div>

      <DevelopmentIntelligenceView
        key={`${market.id}-${category}-${searchParams.select ?? ""}`}
        market={market}
        projects={projects}
        parcels={parcels}
        opportunities={opportunities}
        catalysts={catalysts}
        opportunityZones={opportunityZones}
        growthAreas={growthAreas}
        potentialSites={potentialSites}
        initialCategory={category}
        initialSelection={initialSelection}
      />
    </div>
  );
}
