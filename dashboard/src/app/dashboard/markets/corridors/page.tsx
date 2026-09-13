import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GROWTH_AREA_MOMENTUM_LABEL, type GrowthArea, type Market } from "@/lib/types";

export const dynamic = "force-dynamic";

const MOMENTUM_COLOR: Record<GrowthArea["momentum_state"], string> = {
  accelerating: "bg-emerald-600",
  emerging: "bg-amber-500",
  established: "bg-[#1c1c1c]/40",
};

export default async function CorridorsPage() {
  const supabase = createClient();
  const [{ data: corridorsData }, { data: marketsData }] = await Promise.all([
    supabase.from("growth_areas").select("*").order("name").returns<GrowthArea[]>(),
    supabase.from("markets").select("*").returns<Market[]>(),
  ]);
  const corridors = corridorsData ?? [];
  const marketById = new Map((marketsData ?? []).map((m) => [m.id, m]));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/markets" className="text-xs text-[#1c1c1c]/40 hover:text-[#1c1c1c]">
          ← Markets
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1c1c1c]">Corridor Intelligence</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#1c1c1c]/60">
          Named development corridors — where city direction, public investment, private momentum, and land are
          converging.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {corridors.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/markets/corridors/${c.id}`}
            className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm transition hover:border-[#1c1c1c]/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">{marketById.get(c.market_id)?.name ?? "—"}</span>
              <span className={`rounded-full ${MOMENTUM_COLOR[c.momentum_state]} px-2.5 py-1 text-[10px] font-semibold uppercase text-white`}>
                {GROWTH_AREA_MOMENTUM_LABEL[c.momentum_state]}
              </span>
            </div>
            <div className="mt-2 text-base font-medium text-[#1c1c1c]">{c.name}</div>
            {c.thesis && <p className="mt-2 text-sm text-[#1c1c1c]/60">{c.thesis}</p>}
          </Link>
        ))}
      </div>

      {corridors.length === 0 && <p className="text-sm text-[#1c1c1c]/40">No corridors defined yet.</p>}
    </div>
  );
}
