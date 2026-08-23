import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

// Internal-only: same admin gate as /dashboard/admin/*. This is a separate
// product from the investor dashboard (a homeowner lead-gen CRM, not
// development intelligence) so it gets its own top-level nav and its own
// warm-white/charcoal/gold theme instead of living inside the dashboard
// shell.
export default async function LeadsLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (!user || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1c1c1c]">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[#1c1c1c]/10 bg-[#F7F6F2] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/leads" className="flex items-center gap-2">
            <img src="/groundbreakable-icon.svg" alt="" className="h-6 w-6" />
            <span className="font-serif text-base font-semibold tracking-tight text-[#1c1c1c]">
              Groundbreakable <span className="text-[#B08D57]">Leads</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-[#1c1c1c]/45">
            <Link href="/leads" className="hover:text-[#1c1c1c]">
              Leads
            </Link>
            <Link href="/leads/map" className="hover:text-[#1c1c1c]">
              Map
            </Link>
            <Link href="/leads/pipeline" className="hover:text-[#1c1c1c]">
              Pipeline
            </Link>
            <Link href="/leads/settings" className="hover:text-[#1c1c1c]">
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#1c1c1c]/45">
          <form action="/leads" method="get" className="hidden sm:block">
            <input
              type="search"
              name="q"
              placeholder="Search owner, address, parcel, phone…"
              className="w-56 rounded-full border border-[#1c1c1c]/15 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#B08D57]"
            />
          </form>
          <Link
            href="/leads/import"
            className="rounded-full bg-[#1c1c1c] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#1c1c1c]/85"
          >
            Import CSV
          </Link>
          <Link href="/dashboard" className="hidden hover:text-[#1c1c1c] sm:inline">
            ← Dashboard
          </Link>
          <span className="hidden sm:inline">{user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
