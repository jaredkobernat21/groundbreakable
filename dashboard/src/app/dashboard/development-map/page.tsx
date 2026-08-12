import { createClient } from "@/lib/supabase/server";
import DevelopmentIntelligenceView from "@/components/intelligence/DevelopmentIntelligenceView";
import { selectMarket } from "@/lib/selectMarket";
import type { CatalystWithSource, Market, OpportunityWithSource, Parcel, ProjectWithSource } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DevelopmentMapPage({
  searchParams,
}: {
  searchParams: { market?: string };
}) {
  const supabase = createClient();

  // RLS scopes this to markets the signed-in investor has access to.
  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();

  const market = selectMarket(markets ?? [], searchParams.market);

  if (!market) {
    return (
      <p className="text-sm text-white/50">
        You don't have access to a market yet — an admin needs to grant you access
        in Supabase.
      </p>
    );
  }

  const [{ data: projects }, { data: parcels }, { data: opportunities }, { data: catalysts }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, source:sources(*)")
      .eq("market_id", market.id)
      .order("date_updated", { ascending: false })
      .returns<ProjectWithSource[]>(),
    supabase.from("parcels").select("*").eq("market_id", market.id).returns<Parcel[]>(),
    supabase
      .from("opportunities")
      .select("*, source:sources(*)")
      .eq("market_id", market.id)
      .order("last_verified_at", { ascending: false })
      .returns<OpportunityWithSource[]>(),
    supabase
      .from("catalysts")
      .select("*, source:sources(*)")
      .eq("market_id", market.id)
      .order("last_verified_at", { ascending: false })
      .returns<CatalystWithSource[]>(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {market.name}, {market.state} — Development Map
        </h1>
        <p className="text-sm text-white/40">
          Verified development, zoning, infrastructure, and land signals for this market.
        </p>
      </div>

      <DevelopmentIntelligenceView
        market={market}
        projects={projects ?? []}
        parcels={parcels ?? []}
        opportunities={opportunities ?? []}
        catalysts={catalysts ?? []}
      />
    </div>
  );
}
