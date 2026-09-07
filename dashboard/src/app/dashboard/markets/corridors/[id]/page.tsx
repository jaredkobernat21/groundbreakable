import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getShifts } from "@/lib/queries/shifts";
import { getDevelopmentOpportunities } from "@/lib/queries/developmentOpportunities";
import { shiftDateRangeToDate } from "@/lib/shiftConstants";
import { pointInPolygon } from "@/lib/geo";
import { GROWTH_AREA_MOMENTUM_LABEL, type GrowthArea, type Market } from "@/lib/types";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";

const MOMENTUM_COLOR: Record<GrowthArea["momentum_state"], string> = {
  accelerating: "bg-emerald-600",
  emerging: "bg-amber-500",
  established: "bg-[#1c1c1c]/40",
};

const STATUS_LABEL: Record<"occurred" | "planned", string> = {
  occurred: "Occurred",
  planned: "Planned",
};

export default async function CorridorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: corridors } = await supabase.from("growth_areas").select("*").eq("id", params.id).returns<GrowthArea[]>();
  const corridor = corridors?.[0];
  if (!corridor) notFound();

  const { data: markets } = await supabase.from("markets").select("*").eq("id", corridor.market_id).returns<Market[]>();
  const market = markets?.[0];

  const [shifts, opportunities] = await Promise.all([
    getShifts(supabase, corridor.market_id, { since: shiftDateRangeToDate("90d") }),
    getDevelopmentOpportunities(supabase, corridor.market_id),
  ]);

  const withinCorridor = <T extends { lat?: number | null; lng?: number | null; latitude?: number | null; longitude?: number | null }>(
    items: T[]
  ) =>
    items.filter((item) => {
      const lat = "lat" in item ? item.lat : item.latitude;
      const lng = "lng" in item ? item.lng : item.longitude;
      if (lat == null || lng == null) return false;
      return pointInPolygon({ lat, lng }, corridor.geom);
    });

  const corridorShifts = withinCorridor(shifts);
  const corridorOpportunities = withinCorridor(opportunities);
  const timeline = [...corridor.catalyst_timeline].sort((a, b) => a.year.localeCompare(b.year));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/markets/corridors" className="text-xs text-[#1c1c1c]/40 hover:text-[#1c1c1c]">
          ← All Corridors
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">{corridor.name}</h1>
          <span className={`rounded-full ${MOMENTUM_COLOR[corridor.momentum_state]} px-2.5 py-1 text-[10px] font-semibold uppercase text-white`}>
            {GROWTH_AREA_MOMENTUM_LABEL[corridor.momentum_state]}
          </span>
        </div>
        <p className="text-sm text-[#1c1c1c]/50">{market ? `${market.name}, ${market.state}` : "—"}</p>
      </div>

      {corridor.thesis && (
        <section className={`${cardClass} border-[#1c1c1c]/20 bg-[#1c1c1c] text-white`}>
          <div className="text-xs uppercase tracking-wide text-white/50">Groundbreakable Thesis</div>
          <p className="mt-1 text-sm text-white/90">{corridor.thesis}</p>
        </section>
      )}

      {corridor.narrative && (
        <section className={cardClass}>
          <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">Why We're Watching</div>
          <p className="mt-1 whitespace-pre-line text-sm text-[#1c1c1c]/80">{corridor.narrative}</p>
        </section>
      )}

      {timeline.length > 0 && (
        <section className={cardClass}>
          <div className="mb-3 text-xs uppercase tracking-wide text-[#1c1c1c]/40">Catalyst Timeline</div>
          <ol className="space-y-3 border-l border-[#1c1c1c]/10 pl-4">
            {timeline.map((entry, i) => (
              <li key={i}>
                <div className="text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">
                  {entry.year} · {STATUS_LABEL[entry.status]}
                </div>
                <div className="text-sm text-[#1c1c1c]/80">{entry.label}</div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className={cardClass}>
        <div className="mb-3 text-xs uppercase tracking-wide text-[#1c1c1c]/40">
          Recent Activity Within This Corridor (last 90 days)
        </div>
        {corridorShifts.length === 0 ? (
          <p className="text-sm text-[#1c1c1c]/40">No geolocated signals fell within this corridor's boundary in the last 90 days.</p>
        ) : (
          <ul className="space-y-2">
            {corridorShifts.map((s) => (
              <li key={s.id} className="text-sm text-[#1c1c1c]/80">
                <span className="text-xs uppercase tracking-wide text-[#1c1c1c]/40">{s.category}</span> — {s.event}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={cardClass}>
        <div className="mb-3 text-xs uppercase tracking-wide text-[#1c1c1c]/40">Parcels &amp; Opportunities in Scope</div>
        {corridorOpportunities.length === 0 ? (
          <p className="text-sm text-[#1c1c1c]/40">No development opportunities currently fall within this corridor's boundary.</p>
        ) : (
          <ul className="space-y-2">
            {corridorOpportunities.map((o) => (
              <li key={o.id} className="text-sm text-[#1c1c1c]/80">
                {o.address} — <span className="text-[#1c1c1c]/50">{o.opportunity_type}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
