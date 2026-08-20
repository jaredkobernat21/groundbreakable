import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import AskBar from "@/components/AskBar";
import DevelopmentIntelligenceView from "@/components/intelligence/DevelopmentIntelligenceView";
import { getMapLayerData } from "@/lib/queries/mapLayers";
import type { Market } from "@/lib/types";

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

// Static demo answer, not a live call -- /api/ask requires a signed-in
// session (see src/app/api/ask/route.ts), which this unauthenticated
// preview intentionally never has. Segments are plain text only (no
// type/id) so nothing here tries to link into the auth-gated /dashboard
// route, which would just bounce an anonymous tester to /login.
const demoAskAnswer = {
  question: "Where is early development happening?",
  segments: [
    {
      text: "Right now there's a mix of planning-stage rezonings and larger active builds spread across the city, with a cluster of activity in southwest Topeka. Several multimillion-dollar business expansions were also approved recently.",
    },
  ],
};

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

  const { projects, parcels, opportunities, catalysts, opportunityZones, growthAreas, potentialSites } =
    await getMapLayerData(supabase, market.id);

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

        <AskBar marketName={market.name} marketSlug={market.slug} demo={demoAskAnswer} />

        <DevelopmentIntelligenceView
          market={market}
          projects={projects}
          parcels={parcels}
          opportunities={opportunities}
          catalysts={catalysts}
          opportunityZones={opportunityZones}
          growthAreas={growthAreas}
          potentialSites={potentialSites}
          initialCategory="potential"
        />
      </main>
    </div>
  );
}
