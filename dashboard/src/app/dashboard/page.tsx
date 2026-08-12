import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import MarketMap from "@/components/MarketMap";
import SubmarketList from "@/components/SubmarketList";
import EventFeed from "@/components/EventFeed";
import PropertyList from "@/components/PropertyList";
import CompetitorList from "@/components/CompetitorList";
import { selectMarket } from "@/lib/selectMarket";
import type {
  Competitor,
  Market,
  MarketEvent,
  MarketMetrics,
  Property,
  Submarket,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
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

  const [{ data: metrics }, { data: submarkets }, { data: events }, { data: properties }, { data: competitors }] =
    await Promise.all([
      supabase
        .from("market_metrics")
        .select("*")
        .eq("market_id", market.id)
        .order("period", { ascending: false })
        .limit(1)
        .returns<MarketMetrics[]>(),
      supabase
        .from("submarkets")
        .select("*")
        .eq("market_id", market.id)
        .order("sort_order")
        .returns<Submarket[]>(),
      supabase
        .from("market_events")
        .select("*")
        .eq("market_id", market.id)
        .order("event_date", { ascending: false })
        .limit(20)
        .returns<MarketEvent[]>(),
      supabase.from("properties").select("*").order("created_at", { ascending: false }).returns<Property[]>(),
      supabase
        .from("competitors")
        .select("*")
        .eq("market_id", market.id)
        .order("purchase_date", { ascending: false })
        .limit(10)
        .returns<Competitor[]>(),
    ]);

  const latestMetrics = metrics?.[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {market.name}, {market.state}
        </h1>
        <p className="text-sm text-white/40">Local market intelligence</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Population Growth"
          value={latestMetrics?.population_growth_pct != null ? `${latestMetrics.population_growth_pct}%` : "—"}
        />
        <StatCard
          label="Permit Activity"
          value={latestMetrics?.permit_activity_index?.toString() ?? "—"}
        />
        <StatCard
          label="Price Momentum"
          value={latestMetrics?.price_momentum_index?.toString() ?? "—"}
        />
        <StatCard
          label="Days on Market"
          value={latestMetrics?.days_on_market?.toString() ?? "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/40">
            Development &amp; Opportunity Map
          </h2>
          <MarketMap market={market} events={events ?? []} />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/40">
            Submarkets
          </h2>
          <SubmarketList submarkets={submarkets ?? []} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/40">
            Latest Market Events
          </h2>
          <EventFeed events={events ?? []} />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/40">
            Your Properties
          </h2>
          <PropertyList properties={properties ?? []} />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/40">
            Competitor Activity
          </h2>
          <CompetitorList competitors={competitors ?? []} />
        </div>
      </div>
    </div>
  );
}
