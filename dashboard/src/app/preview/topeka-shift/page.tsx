import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import ShiftDashboardView from "@/components/shifts/ShiftDashboardView";
import MarketSwitcher from "@/components/MarketSwitcher";
import { getShifts } from "@/lib/queries/shifts";
import { getActiveProjects } from "@/lib/queries/activeProjects";
import { getBuildabilityZones } from "@/lib/queries/buildability";
import { getInvestments } from "@/lib/queries/investments";
import { getGrowthAreas } from "@/lib/queries/planIntelligence";
import { getProjectPeople } from "@/lib/queries/projectPeople";
import { getDevelopmentOpportunities } from "@/lib/queries/developmentOpportunities";
import { shiftDateRangeToDate } from "@/lib/shiftConstants";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

// Same pattern as /preview/topeka (see that file's comment): a share-with-
// anyone, no-login link that reads with the service-role client (bypasses
// RLS). Route path/filename kept as "topeka-shift" for backward
// compatibility with the link already handed out, but it now supports
// every market via ?market=<slug> (defaulting to Topeka) rather than
// being hardcoded to one -- still read-only, still just exposes whatever
// is already live in `shifts` for a real market row, nothing scoped to a
// signed-in user.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const DEFAULT_MARKET_SLUG = "topeka-ks";

export default async function ShiftPreviewPage({ searchParams }: { searchParams: { market?: string } }) {
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

  const { data: markets, error: marketsError } = await supabase.from("markets").select("*").order("name").returns<Market[]>();

  if (marketsError) {
    console.error("preview/topeka-shift: markets query failed", marketsError);
  }

  const requestedSlug = searchParams.market ?? DEFAULT_MARKET_SLUG;
  const market = (markets ?? []).find((m) => m.slug === requestedSlug) ?? (markets ?? []).find((m) => m.slug === DEFAULT_MARKET_SLUG);

  if (!market) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
        <p className="text-sm text-[#1c1c1c]/50">No markets found.</p>
      </main>
    );
  }

  const shifts = await getShifts(supabase, market.id, { since: shiftDateRangeToDate("all") });
  const projects = await getActiveProjects(supabase, market.id);
  const buildabilityZones = await getBuildabilityZones(supabase, market.id);
  const investments = await getInvestments(supabase, market.id);
  const { data: momentumAreas } = await getGrowthAreas(supabase, market.id);
  const projectPeople = await getProjectPeople(supabase, market.id);
  const opportunities = await getDevelopmentOpportunities(supabase, market.id);

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-[#1c1c1c]">
      <div className="border-b border-[#1c1c1c]/10 bg-[#1c1c1c] px-4 py-2 text-center text-xs font-medium text-white/70 sm:px-6">
        Preview — a shared, read-only look at the live Groundbreakable dashboard.
      </div>

      {/* No logo here -- ShiftDashboardView renders it at the top of its own
          far-left rail, same as the real /dashboard route. */}
      <header className="flex flex-wrap items-center justify-end gap-3 border-b border-[#1c1c1c]/10 bg-[#f4f2ee] px-4 py-3 sm:px-6 sm:py-4">
        <MarketSwitcher markets={markets ?? []} currentSlug={market.slug} />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
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
        />
      </main>
    </div>
  );
}
