import { createClient } from "@/lib/supabase/server";
import AskBar from "@/components/AskBar";
import DevelopmentIntelligenceView, { type MapCategory } from "@/components/intelligence/DevelopmentIntelligenceView";
import { selectMarket } from "@/lib/selectMarket";
import { getMapLayerData } from "@/lib/queries/mapLayers";
import type { Market } from "@/lib/types";

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
    : "potential";

  // Deep-link from the AskBar's "View on map" link -- pre-selects and
  // flies to a specific project/opportunity pin named by the AI's answer.
  const selectType = searchParams.selectType;
  const initialSelection: { type: "project" | "opportunity"; id: string } | null =
    searchParams.select && (selectType === "project" || selectType === "opportunity")
      ? { type: selectType, id: searchParams.select }
      : null;

  const { projects, parcels, opportunities, catalysts, opportunityZones, growthAreas, potentialSites } =
    await getMapLayerData(supabase, market.id);

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
    </div>
  );
}
