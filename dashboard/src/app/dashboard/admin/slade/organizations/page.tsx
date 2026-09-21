import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listOrganizations, RELATIONSHIP_STATUS_LABEL } from "@/lib/slade";
import type { Market } from "@/lib/types";
import { createOrganizationAction, updateOrganizationAction } from "./actions";

export const dynamic = "force-dynamic";

const ORG_TYPES = ["developer", "investor", "brokerage", "contractor", "planning_firm", "partner", "municipality", "other"];

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

export default async function SladeOrganizationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single() : { data: null };
  if (profile?.role !== "admin") redirect("/dashboard");

  const [organizations, { data: markets }] = await Promise.all([
    listOrganizations(supabase),
    supabase.from("markets").select("*").order("name").returns<Market[]>(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/admin/slade" className="text-xs text-white/40 hover:text-white">
          ← SLADE
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-white">Organizations</h1>
        <p className="text-sm text-white/50">
          Development companies, investors, brokerages, and other businesses in the network. Written through the same
          service functions SLADE chat uses.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add an Organization</h2>
        <form action={createOrganizationAction} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="name">Name</label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="type">Type</label>
            <select id="type" name="type" className={inputClass} defaultValue="">
              <option value="">— unspecified —</option>
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="website">Website</label>
            <input id="website" name="website" type="url" className={inputClass} placeholder="https://…" />
          </div>
          <div>
            <label className={labelClass} htmlFor="primary_market_id">Primary Market</label>
            <select id="primary_market_id" name="primary_market_id" className={inputClass} defaultValue="">
              <option value="">— none —</option>
              {(markets ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name}, {m.state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="relationship_status">Relationship Status</label>
            <select id="relationship_status" name="relationship_status" className={inputClass} defaultValue="unknown">
              {Object.entries(RELATIONSHIP_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={2} className={inputClass} />
          </div>
          <div className="col-span-2">
            <button type="submit" className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400">
              Add Organization
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">All Organizations ({organizations.length})</h2>
        <div className="space-y-3">
          {organizations.map((org) => (
            <div key={org.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/40">{org.type?.replace(/_/g, " ") ?? "unspecified type"}</div>
                  <div className="font-medium text-white">{org.name}</div>
                  <div className="text-sm text-white/50">
                    {RELATIONSHIP_STATUS_LABEL[org.relationship_status]}
                    {org.website && (
                      <>
                        {" · "}
                        <a href={org.website} target="_blank" rel="noreferrer noopener" className="underline decoration-white/20 hover:text-white">
                          {org.website}
                        </a>
                      </>
                    )}
                  </div>
                  {org.notes && <div className="mt-1 text-sm text-white/60">{org.notes}</div>}
                </div>
                <details className="shrink-0">
                  <summary className="cursor-pointer rounded border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white">
                    Edit
                  </summary>
                  <form action={updateOrganizationAction} className="mt-3 grid w-72 grid-cols-1 gap-3 rounded border border-white/10 bg-black/30 p-3">
                    <input type="hidden" name="id" value={org.id} />
                    <div>
                      <label className={labelClass}>Name</label>
                      <input name="name" defaultValue={org.name} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Type</label>
                      <select name="type" defaultValue={org.type ?? ""} className={inputClass}>
                        <option value="">— unspecified —</option>
                        {ORG_TYPES.map((t) => (
                          <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Website</label>
                      <input name="website" type="url" defaultValue={org.website ?? ""} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Primary Market</label>
                      <select name="primary_market_id" defaultValue={org.primary_market_id ?? ""} className={inputClass}>
                        <option value="">— none —</option>
                        {(markets ?? []).map((m) => (
                          <option key={m.id} value={m.id}>{m.name}, {m.state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Relationship Status</label>
                      <select name="relationship_status" defaultValue={org.relationship_status} className={inputClass}>
                        {Object.entries(RELATIONSHIP_STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Notes</label>
                      <textarea name="notes" rows={2} defaultValue={org.notes ?? ""} className={inputClass} />
                    </div>
                    <button type="submit" className="rounded bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-white/85">
                      Save
                    </button>
                  </form>
                </details>
              </div>
            </div>
          ))}
          {organizations.length === 0 && <p className="text-sm text-white/40">No organizations entered yet.</p>}
        </div>
      </section>
    </div>
  );
}
