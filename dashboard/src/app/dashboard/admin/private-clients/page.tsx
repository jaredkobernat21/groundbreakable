import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPrivateClients } from "@/lib/queries/privateClients";
import { PRIVATE_CLIENT_STATUS_LABEL, type PrivateClient } from "@/lib/types";
import { createPrivateClient } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

const STATUS_BADGE_COLOR: Record<PrivateClient["status"], string> = {
  prospect: "bg-white/10 text-white/60",
  contacted: "bg-amber-500/20 text-amber-300",
  qualified: "bg-blue-500/20 text-blue-300",
  onboarded: "bg-emerald-500/20 text-emerald-300",
  active: "bg-emerald-500/30 text-emerald-200",
  inactive: "bg-red-500/10 text-red-300",
};

export default async function AdminPrivateClientsPage() {
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

  const clients = await getPrivateClients(supabase);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Groundbreakable Private — Client Prospecting</h1>
        <p className="text-sm text-white/40">
          Prospect discovery + acquisition profiles for wealthy, accessible private developers and land investors
          (spec section 3). A client becomes a real dashboard account once `investor_profile_id` is set.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add a Prospect</h2>
        <form action={createPrivateClient} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="full_name">Full Name</label>
            <input id="full_name" name="full_name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="title">Title</label>
            <input id="title" name="title" className={inputClass} placeholder="Founder / Owner / Principal" />
          </div>
          <div>
            <label className={labelClass} htmlFor="company">Company</label>
            <input id="company" name="company" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="location">Location</label>
            <input id="location" name="location" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">Phone / Cell</label>
            <input id="phone" name="phone" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="linkedin_url">LinkedIn</label>
            <input id="linkedin_url" name="linkedin_url" type="url" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="website">Website</label>
            <input id="website" name="website" type="url" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="prospect" className={inputClass}>
              {Object.entries(PRIVATE_CLIENT_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="estimated_project_scale">Estimated Project Scale</label>
            <input id="estimated_project_scale" name="estimated_project_scale" className={inputClass} placeholder="e.g. 50-200 unit multifamily" />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="markets_active">Markets Active In (comma-separated)</label>
            <input id="markets_active" name="markets_active" className={inputClass} placeholder="Kansas City, Lawrence, Topeka" />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="deployable_capital_estimate">Deployable Capital Indicator</label>
            <input id="deployable_capital_estimate" name="deployable_capital_estimate" className={inputClass} placeholder="e.g. inferred $15-40M from recent land purchases" />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="notes">Notes / Source</label>
            <textarea id="notes" name="notes" rows={2} className={inputClass} />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
            >
              Add Prospect
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">All Private Clients ({clients.length})</h2>
        <div className="space-y-2">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/admin/private-clients/${c.id}`}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-white/30"
            >
              <div>
                <div className="font-medium text-white">{c.full_name}</div>
                <div className="text-sm text-white/50">
                  {[c.title, c.company].filter(Boolean).join(" · ") || "—"}
                  {c.location ? ` · ${c.location}` : ""}
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE_COLOR[c.status]}`}>
                {PRIVATE_CLIENT_STATUS_LABEL[c.status]}
              </span>
            </Link>
          ))}
          {clients.length === 0 && <p className="text-sm text-white/40">No private clients tracked yet.</p>}
        </div>
      </section>
    </div>
  );
}
