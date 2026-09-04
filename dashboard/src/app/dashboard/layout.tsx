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

  // RLS scopes this to markets the signed-in investor has access to
  // (admins see every market).
  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-[#1c1c1c]">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[#1c1c1c]/10 bg-[#f4f2ee] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/roq-icon-black.png" alt="" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Shift</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-[#1c1c1c]/50">
            <Link href="/dashboard" className="hover:text-[#1c1c1c]">
              Overview
            </Link>
            <Link href="/dashboard/timeline" className="hover:text-[#1c1c1c]">
              Timeline
            </Link>
            <Link href="/dashboard/projects" className="hover:text-[#1c1c1c]">
              Projects
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#1c1c1c]/50">
          <Link
            href="/leads"
            className="rounded-full border border-[#B08D57]/40 bg-[#B08D57]/10 px-3 py-1 text-xs font-medium text-[#8a6a3d] hover:bg-[#B08D57]/20"
          >
            Groundbreakable Leads →
          </Link>
          <MarketSwitcher markets={markets ?? []} />
          <span className="hidden sm:inline">{user?.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
