import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Groundbreakable Private (section 12): the premium intelligence tier,
// visually distinguished from the plain-sans investor dashboard the way
// the Leads CRM already distinguishes itself with font-serif + a gold
// accent -- same device, applied here instead to mark "premium service"
// rather than "editorial warmth."
//
// Admin-gated for now: no private client has real dashboard login access
// yet (investor_profile_id is null on every seeded row), so there's no
// self-serve viewer to allow through. Once a client is onboarded with a
// real account, this gate should widen to "is_admin() or you own this
// client record" -- the RLS policies on every private_* table already
// support that; only this route-level check needs to change.
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: role } = user
    ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (role?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 border-b border-[#1c1c1c]/10 pb-4">
        <Link
          href="/dashboard/private"
          className="rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-[#B08D57]"
        >
          Groundbreakable Private
        </Link>
        <span className="text-[#1c1c1c]/20">/</span>
        <Link href="/dashboard/private" className="rounded-full px-3 py-1.5 text-sm text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/5">
          Clients
        </Link>
        <Link href="/dashboard/private/markets" className="rounded-full px-3 py-1.5 text-sm text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/5">
          Emerging Markets
        </Link>
        <Link href="/dashboard/private/corridors" className="rounded-full px-3 py-1.5 text-sm text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/5">
          Corridor Intelligence
        </Link>
        <Link
          href="/dashboard/admin/private-clients"
          className="ml-auto rounded-full px-3 py-1.5 text-xs text-[#1c1c1c]/40 hover:bg-[#1c1c1c]/5"
        >
          Admin: Prospecting CRM →
        </Link>
      </nav>
      {children}
    </div>
  );
}
