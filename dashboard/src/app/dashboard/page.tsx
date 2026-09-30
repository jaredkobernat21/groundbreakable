import { createClient } from "@/lib/supabase/server";
import { getNationalCatalystsWithSource } from "@/lib/queries/catalysts";
import { getFollowedCatalystIds } from "@/lib/queries/catalystFollows";
import { getFollowedMarketIds } from "@/lib/queries/marketFollows";
import { isAdmin } from "@/lib/auth/admin";
import NationalMapExperience from "@/components/map/NationalMapExperience";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

// National map redesign (Jared, 2026-09-30): the investor dashboard is now
// one full-screen map, not a per-market tabbed view -- see
// docs/DATA_INTELLIGENCE_PIPELINE.md and the 2026-09-30 plan file for the
// full rationale. RLS scopes both queries below to markets/follows this
// signed-in investor actually has access to; no market_id param needed
// anymore (dashboard/src/app/dashboard/map/page.tsx's old redirect back to
// here stays correct as-is).
export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // isAdmin() only controls whether the "Admin" nav pill shows -- a failure
  // here must never take down the whole map (it briefly did: Promise.all
  // rejects as a whole if any one promise rejects, which surfaced the
  // stale pre-redesign error boundary and, with it, the old hidden-behind-
  // the-map header). Caught and defaulted to false instead.
  const [{ data: markets }, catalysts, followedCatalystIds, followedMarketIds, admin] = await Promise.all([
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    getNationalCatalystsWithSource(supabase),
    user ? getFollowedCatalystIds(supabase, user.id) : Promise.resolve(new Set<string>()),
    user ? getFollowedMarketIds(supabase, user.id) : Promise.resolve(new Set<string>()),
    isAdmin(supabase, user?.id).catch(() => false),
  ]);

  return (
    <NationalMapExperience
      markets={markets ?? []}
      catalysts={catalysts}
      userId={user?.id ?? ""}
      userEmail={user?.email ?? null}
      isAdmin={admin}
      initialFollowedCatalystIds={Array.from(followedCatalystIds)}
      initialFollowedMarketIds={Array.from(followedMarketIds)}
    />
  );
}
