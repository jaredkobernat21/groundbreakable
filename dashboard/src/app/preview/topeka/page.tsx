import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import NewsSection from "@/components/NewsSection";
import CatalystSpotlight from "@/components/CatalystSpotlight";
import DevelopmentIntelligenceView from "@/components/intelligence/DevelopmentIntelligenceView";
import type {
  CatalystWithSource,
  Market,
  OpportunityWithSource,
  OpportunityZoneWithSource,
  Parcel,
  ProjectUpdateWithProject,
  ProjectWithSource,
  UpcomingDecisionWithSource,
} from "@/lib/types";

export const dynamic = "force-dynamic";

// Not linked in-app anywhere, and outside middleware.ts's /dashboard/:path*
// auth gate on purpose -- this is a share-with-anyone link for testers to
// see the real, live Topeka dashboard without an account. It reads with
// the service-role client (bypasses RLS) but the market is hardcoded to
// Topeka only -- there is no market param, so this route can never expose
// any other market's data. Read-only: nothing here writes to the DB.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const MARKET_SLUG = "topeka-ks";

export default async function TopekaPreviewPage() {
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

  const { data: market, error: marketError } = await supabase
    .from("markets")
    .select("*")
    .eq("slug", MARKET_SLUG)
    .single<Market>();

  if (marketError) {
    console.error("preview/topeka: markets query failed", marketError);
  }

  if (!market) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
        <p className="text-sm text-[#1c1c1c]/50">Topeka market not found.</p>
      </main>
    );
  }

  const [
    { data: projects },
    { data: parcels },
    { data: opportunities },
    { data: catalysts },
    { data: opportunityZones },
    { data: recentActivity },
    { data: decisions },
  ] = await Promise.all([
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
    supabase
      .from("opportunity_zones")
      .select("*, source:sources(*)")
      .eq("market_id", market.id)
      .order("last_verified_at", { ascending: false })
      .returns<OpportunityZoneWithSource[]>(),
    supabase
      .from("project_updates")
      .select("*, project:projects!inner(id, title, category, market_id)")
      .eq("project.market_id", market.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<ProjectUpdateWithProject[]>(),
    supabase
      .from("upcoming_decisions")
      .select("*, source:sources(*)")
      .eq("market_id", market.id)
      .eq("status", "scheduled")
      .order("decision_date", { ascending: true })
      .limit(6)
      .returns<UpcomingDecisionWithSource[]>(),
  ]);

  const newOpportunities = [...(opportunities ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const spotlightCatalyst =
    (catalysts ?? []).find((c) => c.is_spotlight) ??
    [...(catalysts ?? [])].sort((a, b) => (b.estimated_value ?? 0) - (a.estimated_value ?? 0))[0] ??
    null;

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-[#1c1c1c]">
      <div className="border-b border-[#1c1c1c]/10 bg-[#1c1c1c] px-4 py-2 text-center text-xs font-medium text-white/70 sm:px-6">
        Preview — a shared, read-only look at the live {market.name} dashboard.
      </div>

      <header className="flex items-center gap-2 border-b border-[#1c1c1c]/10 bg-[#f4f2ee] px-4 py-3 sm:px-6 sm:py-4">
        <img src="/groundbreakable-icon.svg" alt="" className="h-7 w-7" />
        <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-semibold text-[#1c1c1c]">
          {market.name}, {market.state}
        </h1>

        <DevelopmentIntelligenceView
          market={market}
          projects={projects ?? []}
          parcels={parcels ?? []}
          opportunities={opportunities ?? []}
          catalysts={catalysts ?? []}
          opportunityZones={opportunityZones ?? []}
          initialCategory="activity"
        />

        <NewsSection
          recentActivity={recentActivity ?? []}
          newOpportunities={newOpportunities}
          decisions={decisions ?? []}
        />

        <CatalystSpotlight catalyst={spotlightCatalyst} />
      </main>
    </div>
  );
}
