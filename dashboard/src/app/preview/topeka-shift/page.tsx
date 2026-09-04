import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import ShiftDashboardView from "@/components/shifts/ShiftDashboardView";
import { getShifts } from "@/lib/queries/shifts";
import { shiftDateRangeToDate } from "@/lib/shiftConstants";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

// Same pattern as /preview/topeka (see that file's comment): a share-with-
// anyone, no-login link that reads with the service-role client (bypasses
// RLS), market hardcoded to Topeka so this route can never expose any
// other market's data. Read-only.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const MARKET_SLUG = "topeka-ks";

export default async function TopekaShiftPreviewPage() {
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
    console.error("preview/topeka-shift: markets query failed", marketError);
  }

  if (!market) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
        <p className="text-sm text-[#1c1c1c]/50">Topeka market not found.</p>
      </main>
    );
  }

  const shifts = await getShifts(supabase, market.id, { since: shiftDateRangeToDate("30d") });

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-[#1c1c1c]">
      <div className="border-b border-[#1c1c1c]/10 bg-[#1c1c1c] px-4 py-2 text-center text-xs font-medium text-white/70 sm:px-6">
        Preview — a shared, read-only look at the live ROQ Shift {market.name} dashboard.
      </div>

      <header className="flex items-center gap-2 border-b border-[#1c1c1c]/10 bg-[#f4f2ee] px-4 py-3 sm:px-6 sm:py-4">
        <img src="/groundbreakable-icon.svg" alt="" className="h-7 w-7" />
        <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">ROQ Shift</span>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-semibold text-[#1c1c1c]">
          {market.name}, {market.state}
        </h1>

        <ShiftDashboardView market={market} shifts={shifts} />
      </main>
    </div>
  );
}
