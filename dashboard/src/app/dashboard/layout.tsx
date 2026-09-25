import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import MarketSwitcher from "@/components/MarketSwitcher";
import { isAdmin } from "@/lib/auth/admin";
import type { Market } from "@/lib/types";

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
  // (admins see every market). Fetched alongside the admin check so this
  // stays one round trip instead of two sequential ones.
  const [{ data: markets }, admin] = await Promise.all([
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    isAdmin(supabase, user?.id),
  ]);

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-[#1c1c1c]">
      {/* Logo + the Plans/Projects/Permits/Infrastructure/Investment nav now
          live in ShiftDashboardView's own far-left rail (under the logo,
          full page height) instead of here -- this header is just the
          controls that apply regardless of which dashboard page you're on.
          The rail is fixed-position, so it overlays this header's left edge
          on pages that render it; everything below just needs to not put
          anything there, hence justify-end. */}
      <header className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3 border-b border-[#1c1c1c]/10 bg-[#f4f2ee] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3 text-sm text-[#1c1c1c]/50">
          {admin && (
            <Link
              href="/dashboard/admin/opportunities"
              className="rounded-full border border-[#1c1c1c]/15 px-3 py-1 text-xs font-medium text-[#1c1c1c]/60 transition hover:border-[#1c1c1c]/30 hover:text-[#1c1c1c]"
            >
              Admin
            </Link>
          )}
          <MarketSwitcher markets={markets ?? []} />
          <span className="hidden sm:inline">{user?.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
