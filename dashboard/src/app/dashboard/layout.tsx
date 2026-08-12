import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import MarketSwitcher from "@/components/MarketSwitcher";
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

  const { data: profile } = user
    ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  // RLS scopes this to markets the signed-in investor has access to
  // (admins see every market).
  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-white">
            ROQ Outlook
          </Link>
          <nav className="flex gap-4 text-sm text-white/60">
            <Link href="/dashboard" className="hover:text-white">
              Overview
            </Link>
            <Link href="/dashboard/development-map" className="hover:text-white">
              Development Map
            </Link>
            <Link href="/dashboard/leads" className="hover:text-white">
              Leads
            </Link>
            {isAdmin && (
              <Link href="/dashboard/admin/intelligence" className="hover:text-white">
                Admin
              </Link>
            )}
            {isAdmin && (
              <Link href="/dashboard/admin/opportunities" className="hover:text-white">
                Opportunities
              </Link>
            )}
            {isAdmin && (
              <Link href="/dashboard/admin/catalysts" className="hover:text-white">
                Catalysts
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/50">
          <MarketSwitcher markets={markets ?? []} />
          <span>{user?.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
