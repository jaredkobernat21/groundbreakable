import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import { selectMarket } from "@/lib/selectMarket";
import type { Lead, Market } from "@/lib/types";

export const dynamic = "force-dynamic";

type Segment = "tenure" | "out-of-state" | "out-of-state-excl-il";

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: "tenure", label: "10+ Year Ownership" },
  { key: "out-of-state", label: "Out-of-State (incl. IL)" },
  { key: "out-of-state-excl-il", label: "Out-of-State (excl. IL)" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { segment?: string; market?: string };
}) {
  const supabase = createClient();
  const segment = (searchParams.segment as Segment) ?? "tenure";

  const { data: markets } = await supabase.from("markets").select("*").order("name").returns<Market[]>();

  const market = selectMarket(markets ?? [], searchParams.market);

  if (!market) {
    return (
      <p className="text-sm text-white/50">
        You don't have access to a market yet — an admin needs to grant you access
        in Supabase.
      </p>
    );
  }

  let query = supabase.from("leads").select("*").eq("market_id", market.id);

  if (segment === "tenure") {
    query = query.gte("years_owned", 10);
  } else if (segment === "out-of-state") {
    query = query.eq("is_absentee", true).not("owner_mailing_state", "eq", "IA");
  } else {
    query = query
      .eq("is_absentee", true)
      .not("owner_mailing_state", "eq", "IA")
      .not("owner_mailing_state", "eq", "IL");
  }

  const { data: leads } = await query
    .order("assessed_value", { ascending: false })
    .limit(200)
    .returns<Lead[]>();

  const rows = leads ?? [];
  const avgYears =
    rows.length > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + (r.years_owned ?? 0), 0) / rows.length
        )
      : 0;
  const avgValue =
    rows.length > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + (r.assessed_value ?? 0), 0) / rows.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {market.name} Target-Market Properties
        </h1>
        <p className="text-sm text-white/40">
          Sourced from county assessor &amp; recorder public records.
        </p>
      </div>

      <div className="flex gap-2">
        {SEGMENTS.map((s) => (
          <Link
            key={s.key}
            href={`/dashboard/leads?segment=${s.key}${searchParams.market ? `&market=${searchParams.market}` : ""}`}
            className={`rounded px-3 py-1.5 text-sm ${
              segment === s.key
                ? "bg-amber-500 text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Properties" value={rows.length.toString()} />
        <StatCard label="Avg. Years Owned" value={avgYears.toString()} />
        <StatCard label="Avg. Assessed Value" value={`$${avgValue.toLocaleString()}`} />
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-white/40">
          No leads entered yet for this market — import county parcel data to
          populate this list.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-4 py-2">Property</th>
                <th className="px-4 py-2">Owner of Record</th>
                <th className="px-4 py-2">Mailing Location</th>
                <th className="px-4 py-2">Yrs Owned</th>
                <th className="px-4 py-2">Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id} className="border-t border-white/5">
                  <td className="px-4 py-2">
                    <div className="text-white">{lead.address}</div>
                    {lead.is_absentee && (
                      <div className="text-xs text-amber-400">ABSENTEE</div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-white/70">{lead.owner_name}</td>
                  <td className="px-4 py-2 text-white/70">
                    {[lead.owner_mailing_city, lead.owner_mailing_state]
                      .filter(Boolean)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-2 text-white/70">
                    {lead.years_owned_display ?? lead.years_owned ?? "—"}
                  </td>
                  <td className="px-4 py-2 font-medium text-white">
                    {lead.assessed_value != null
                      ? `$${lead.assessed_value.toLocaleString()}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
