import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { queryOpportunities, OPPORTUNITY_STATUS_LABEL, VERIFICATION_CHECKS } from "@/lib/slade";
import type { OpportunityStatus } from "@/lib/slade";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

const OPPORTUNITY_STATUSES = Object.keys(OPPORTUNITY_STATUS_LABEL) as OpportunityStatus[];
// Archived/rejected are dead-end statuses -- not worth surfacing by
// default, but still reachable by checking them explicitly.
const DEFAULT_STATUSES: OpportunityStatus[] = OPPORTUNITY_STATUSES.filter((s) => s !== "archived" && s !== "rejected");

// Read/filter only -- LODE.md is explicit that discovery/verification/
// delivery are separate deliberate actions, not something to edit inline
// from a browse table. No actions.ts.
export default async function SladeLodePage({
  searchParams,
}: {
  searchParams: { market?: string; status?: string | string[] };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single() : { data: null };
  if (profile?.role !== "admin") redirect("/dashboard");

  // Only fall back to the default status set on first visit (no ?status
  // key in the URL at all) -- once the form has been submitted, respect
  // exactly what's selected, including "nothing" if every box was cleared.
  const statuses: OpportunityStatus[] =
    searchParams.status === undefined
      ? DEFAULT_STATUSES
      : ((Array.isArray(searchParams.status) ? searchParams.status : [searchParams.status]) as OpportunityStatus[]);

  const [{ data: markets }, opportunities] = await Promise.all([
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
    queryOpportunities(supabase, {
      marketIds: searchParams.market ? [searchParams.market] : undefined,
      statuses: statuses.length ? statuses : undefined,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/admin/slade" className="text-xs text-white/40 hover:text-white">
          ← SLADE
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-white">LODE</h1>
        <p className="text-sm text-white/50">
          Off-market opportunities matched to a client or buy box. Raw discovered sites not yet tied to a client live
          outside this view — LODE only shows sites that have become slade_opportunities.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/40" htmlFor="market">
            Market
          </label>
          <select
            id="market"
            name="market"
            defaultValue={searchParams.market ?? ""}
            className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="">All markets</option>
            {(markets ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}, {m.state}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="mb-1 block text-xs uppercase tracking-wide text-white/40">Status</legend>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {OPPORTUNITY_STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-1.5 text-xs text-white/70">
                <input type="checkbox" name="status" value={s} defaultChecked={statuses.includes(s)} className="accent-emerald-500" />
                {OPPORTUNITY_STATUS_LABEL[s]}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400">
          Apply
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[900px] divide-y divide-white/10 text-sm">
          <thead className="bg-white/5">
            <tr className="text-left text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Market</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Verification</th>
              <th className="px-4 py-3 font-medium">Thesis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {opportunities.map((o) => {
              const verifiedCount = VERIFICATION_CHECKS.filter((c) => o[c.key]).length;
              return (
                <tr key={o.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white">
                    {o.site?.address ?? "unknown address"}
                    <div className="text-xs text-white/40">{[o.site?.city, o.site?.state].filter(Boolean).join(", ")}</div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{o.market ? `${o.market.name}, ${o.market.state}` : "—"}</td>
                  <td className="px-4 py-3 text-white/60">
                    {o.contact ? `${o.contact.first_name} ${o.contact.last_name ?? ""}`.trim() : "unassigned"}
                  </td>
                  <td className="px-4 py-3 text-white/70">{OPPORTUNITY_STATUS_LABEL[o.opportunity_status]}</td>
                  <td className="px-4 py-3 text-white/60">
                    {verifiedCount}/{VERIFICATION_CHECKS.length}
                  </td>
                  <td className="px-4 py-3 text-white/50">{o.thesis ? (o.thesis.length > 80 ? `${o.thesis.slice(0, 80)}…` : o.thesis) : "—"}</td>
                </tr>
              );
            })}
            {opportunities.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-white/40">
                  No opportunities match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
