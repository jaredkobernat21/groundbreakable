import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Market } from "@/lib/types";

// First-login state (Jared, 2026-09-29): shown once, before a new
// developer ever sees the full dashboard. middleware.ts sends an
// authenticated user here when investor_profiles.welcomed_at is still
// null; "Enter Dashboard" marks it seen and this page never appears again
// for that account. Deliberately not a wizard -- one screen, one button.
export default async function WelcomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("investor_profiles")
    .select("first_name, role, investor_markets(market_id)")
    .eq("id", user.id)
    .single();

  const marketIds = (profile?.investor_markets ?? []).map((im: { market_id: string }) => im.market_id);
  const { data: markets } =
    profile?.role === "admin"
      ? await supabase.from("markets").select("*").order("name").returns<Market[]>()
      : marketIds.length > 0
        ? await supabase.from("markets").select("*").in("id", marketIds).order("name").returns<Market[]>()
        : { data: [] as Market[] };

  async function enterDashboard() {
    "use server";
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("investor_profiles").update({ welcomed_at: new Date().toISOString() }).eq("id", user.id);
    }
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#1c1c1c]/10 bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
        </div>

        <h1 className="mb-2 text-xl font-semibold tracking-tight text-[#1c1c1c]">
          Welcome to Groundbreakable{profile?.first_name ? `, ${profile.first_name}` : ""}.
        </h1>

        {(markets ?? []).length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Your Markets</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {(markets ?? []).map((m) => (
                <span key={m.id} className="rounded-full bg-[#1c1c1c]/5 px-3 py-1 text-sm text-[#1c1c1c]">
                  {m.name}, {m.state}
                </span>
              ))}
            </div>
          </div>
        )}

        <form action={enterDashboard}>
          <button
            type="submit"
            className="w-full rounded bg-[#1c1c1c] py-2 text-sm font-medium text-white transition hover:bg-[#1c1c1c]/85"
          >
            Enter Dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
