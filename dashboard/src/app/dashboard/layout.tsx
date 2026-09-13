import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestorProfile, tierAtLeast } from "@/lib/tiers";
import { SUBSCRIPTION_TIER_LABEL, SUBSCRIPTION_TIER_TAGLINE } from "@/lib/types";
import SignOutButton from "@/components/SignOutButton";
import MarketSwitcher from "@/components/MarketSwitcher";
import type { Market } from "@/lib/types";

const TIER_BADGE_COLOR = {
  access: "border-[#1c1c1c]/15 text-[#1c1c1c]/60",
  intelligence: "border-blue-400/50 text-blue-700",
  partner: "border-[#B08D57]/50 text-[#B08D57]",
} as const;

// The one shared Groundbreakable platform (3-tier product model, spec
// section "DASHBOARD STRUCTURE": "Create one shared Groundbreakable
// platform, not three separate apps"). This top nav is deliberately the
// ONLY new navigation surface -- ShiftDashboardView's existing internal
// rail (reached via "Overview") already covers Map/Activity/Markets/
// broad Opportunity Signals/Companies and stays untouched; the items
// here are the ones the 3-tier model actually adds: a personalized
// Opportunities feed, a self-service Profile, a Watchlist, the AI
// analyst, and (Partner only) the Partner Desk.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS scopes this to markets the signed-in investor has access to
  // (admins see every market).
  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();
  const account = await getCurrentInvestorProfile(supabase);
  const tier = account?.subscription_tier ?? "access";

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-[#1c1c1c]">
      {/* lg:pl-56 on both rows: ShiftDashboardView (rendered at /dashboard
          root only) has its own fixed-position left rail that overlays
          this header's left edge on large screens -- same offset `main`
          below already uses. Pages without that rail just get unused
          padding here, which is harmless. */}
      <header className="border-b border-[#1c1c1c]/10 bg-[#f4f2ee]">
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3 px-4 py-3 sm:px-6 sm:py-4 lg:pl-56">
          <div className="flex items-center gap-3 text-sm text-[#1c1c1c]/50">
            {account && (
              <span
                title={SUBSCRIPTION_TIER_TAGLINE[tier]}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${TIER_BADGE_COLOR[tier]}`}
              >
                {SUBSCRIPTION_TIER_LABEL[tier]}
              </span>
            )}
            <MarketSwitcher markets={markets ?? []} allMarketsHref={tierAtLeast(tier, "intelligence") ? "/dashboard" : undefined} />
            <span className="hidden sm:inline">{user?.email}</span>
            <SignOutButton />
          </div>
        </div>
        {account && (
          <nav className="flex flex-wrap gap-1 px-4 pb-3 text-sm sm:px-6 lg:pl-56">
            <Link href="/dashboard" className="rounded-full px-3 py-1.5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/5">
              Overview
            </Link>
            <Link href="/dashboard/opportunities" className="rounded-full px-3 py-1.5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/5">
              Opportunities
            </Link>
            <Link href="/dashboard/markets" className="rounded-full px-3 py-1.5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/5">
              Markets
            </Link>
            <Link href="/dashboard/watchlist" className="rounded-full px-3 py-1.5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/5">
              Watchlist
            </Link>
            <Link href="/dashboard/ask" className="rounded-full px-3 py-1.5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/5">
              Ask Groundbreakable
            </Link>
            {tierAtLeast(tier, "partner") && (
              <Link
                href="/dashboard/partner-desk"
                className="rounded-full border border-[#B08D57]/40 px-3 py-1.5 font-medium text-[#B08D57] hover:bg-[#B08D57]/10"
              >
                Partner Desk
              </Link>
            )}
            <Link href="/dashboard/profile" className="ml-auto rounded-full px-3 py-1.5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/5">
              My Profile
            </Link>
            {account.role === "admin" && (
              <Link href="/dashboard/admin/partner-requests" className="rounded-full px-3 py-1.5 text-xs text-[#1c1c1c]/40 hover:bg-[#1c1c1c]/5">
                Admin: Partner Requests →
              </Link>
            )}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
