import { createClient } from "@/lib/supabase/server";
import ShiftDashboardView from "@/components/shifts/ShiftDashboardView";
import { selectMarket } from "@/lib/selectMarket";
import { getShifts } from "@/lib/queries/shifts";
import { shiftDateRangeToDate } from "@/lib/shiftConstants";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { market?: string } }) {
  const supabase = createClient();

  // RLS scopes this to markets the signed-in investor has access to.
  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();

  const market = selectMarket(markets ?? [], searchParams.market);

  if (!market) {
    return (
      <p className="text-sm text-[#1c1c1c]/50">
        You don't have access to a market yet — an admin needs to grant you access
        in Supabase.
      </p>
    );
  }

  // Fetch the 30-day superset once -- the widest window the filter bar
  // offers -- and let ShiftDashboardView narrow to 7d/category/audience
  // client-side, no round-trip per filter change.
  const shifts = await getShifts(supabase, market.id, { since: shiftDateRangeToDate("30d") });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[#1c1c1c]">
        {market.name}, {market.state}
      </h1>

      <ShiftDashboardView key={market.id} market={market} shifts={shifts} />
    </div>
  );
}
