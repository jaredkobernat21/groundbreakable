import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Market } from "@/lib/types";
import { createUser, setUserMarkets, updateUser } from "./actions";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  role: string;
  status: string;
  created_at: string;
  investor_markets: { market_id: string }[];
};

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-[11px] uppercase tracking-wide text-white/40";

// Developer account management (Jared, 2026-09-29). The account/market-
// access data model (investor_profiles, investor_markets, is_admin(),
// has_market_access()) already existed and already gates every
// market-scoped table in the app -- this page is the missing admin UI on
// top of it. Same page pattern as every other /dashboard/admin/* route:
// inline role check via the regular server client, RLS is the real gate.
export default async function UsersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const [{ data: profiles }, { data: markets }] = await Promise.all([
    supabase
      .from("investor_profiles")
      .select("id, first_name, last_name, company_name, role, status, created_at, investor_markets(market_id)")
      .order("created_at", { ascending: false })
      .returns<Profile[]>(),
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
  ]);

  // Email lives on auth.users, not investor_profiles -- fetched once via
  // the service-role client (this page is already admin-gated above) and
  // merged in app code, rather than denormalizing/duplicating email onto
  // investor_profiles where it could drift out of sync. Same "server-only,
  // explicit scope" convention as /preview/topeka's use of this client.
  const {
    data: { users: authUsers },
  } = await createAdminClient().auth.admin.listUsers();
  const emailById = new Map(authUsers.map((u) => [u.id, u.email ?? ""]));

  const marketById = new Map((markets ?? []).map((m) => [m.id, m]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Users — Admin</h1>
        <p className="text-sm text-white/40">
          Create developer accounts and control which markets each one can see. New accounts get a
          Supabase invite email to set their own password.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">Add User</h2>
        <form action={createUser} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="first_name">First Name</label>
            <input id="first_name" name="first_name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="last_name">Last Name</label>
            <input id="last_name" name="last_name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="company_name">Company</label>
            <input id="company_name" name="company_name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Assigned Markets</label>
            <div className="flex flex-wrap gap-3 rounded border border-white/10 bg-black/20 p-3">
              {(markets ?? []).map((m) => (
                <label key={m.id} className="flex items-center gap-1.5 text-sm text-white/70">
                  <input type="checkbox" name="market_ids" value={m.id} className="accent-[#eab308]" />
                  {m.name}, {m.state}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded bg-[#eab308] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#eab308]/85"
            >
              Create User
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/40">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Assigned Markets</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => {
              const assignedIds = new Set(p.investor_markets.map((im) => im.market_id));
              return (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white">
                    {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                    {p.role === "admin" && (
                      <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-white/50">Admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60">{p.company_name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/60">{emailById.get(p.id) ?? "—"}</td>
                  <td className="px-4 py-3 text-white/60">
                    {p.role === "admin"
                      ? "All markets"
                      : p.investor_markets.length === 0
                        ? "None"
                        : p.investor_markets.map((im) => marketById.get(im.market_id)?.name ?? "?").join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                        p.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/40"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <details className="relative">
                      <summary className="cursor-pointer text-white/50 hover:text-white">Edit</summary>
                      <div className="mt-3 w-80 space-y-4 rounded border border-white/10 bg-[#12161f] p-4">
                        <form action={updateUser} className="space-y-2">
                          <input type="hidden" name="user_id" value={p.id} />
                          <label className={labelClass} htmlFor={`company-${p.id}`}>Company</label>
                          <input
                            id={`company-${p.id}`}
                            name="company_name"
                            defaultValue={p.company_name ?? ""}
                            className={inputClass}
                          />
                          <label className={labelClass}>Status</label>
                          <select name="status" defaultValue={p.status} className={inputClass}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <button
                            type="submit"
                            className="w-full rounded border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/40"
                          >
                            Save
                          </button>
                        </form>

                        {p.role !== "admin" && (
                          <form action={setUserMarkets} className="space-y-2 border-t border-white/10 pt-3">
                            <input type="hidden" name="user_id" value={p.id} />
                            <label className={labelClass}>Assigned Markets</label>
                            <div className="flex flex-wrap gap-2">
                              {(markets ?? []).map((m) => (
                                <label key={m.id} className="flex items-center gap-1.5 text-xs text-white/70">
                                  <input
                                    type="checkbox"
                                    name="market_ids"
                                    value={m.id}
                                    defaultChecked={assignedIds.has(m.id)}
                                    className="accent-[#eab308]"
                                  />
                                  {m.name}
                                </label>
                              ))}
                            </div>
                            <button
                              type="submit"
                              className="w-full rounded border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/40"
                            >
                              Save Markets
                            </button>
                          </form>
                        )}
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
