import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { queryContacts, listOrganizations, RELATIONSHIP_STATUS_LABEL, LEAD_STATUS_LABEL } from "@/lib/slade";
import { createContactAction, updateContactAction } from "./actions";

export const dynamic = "force-dynamic";

const RELATIONSHIP_TYPES = ["developer", "investor", "broker", "planner", "city_contact", "contractor", "friend_network", "other"];

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

export default async function SladeContactsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single() : { data: null };
  if (profile?.role !== "admin") redirect("/dashboard");

  const [contacts, organizations] = await Promise.all([queryContacts(supabase), listOrganizations(supabase)]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/admin/slade" className="text-xs text-white/40 hover:text-white">
          ← SLADE
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-white">Contacts</h1>
        <p className="text-sm text-white/50">
          Developers, investors, brokers, planners, city contacts, friends/network. Written through the same service
          functions SLADE chat uses — no separate copy of the data.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add a Contact</h2>
        <form action={createContactAction} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="first_name">First Name</label>
            <input id="first_name" name="first_name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="last_name">Last Name</label>
            <input id="last_name" name="last_name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="organization_id">Organization</label>
            <select id="organization_id" name="organization_id" className={inputClass} defaultValue="">
              <option value="">— none —</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="title">Title</label>
            <input id="title" name="title" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="linkedin_url">LinkedIn URL</label>
            <input id="linkedin_url" name="linkedin_url" type="url" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="relationship_type">Relationship Type</label>
            <select id="relationship_type" name="relationship_type" className={inputClass} defaultValue="">
              <option value="">— unspecified —</option>
              {RELATIONSHIP_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
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
          <div>
            <label className={labelClass} htmlFor="lead_status">Outreach Status</label>
            <select id="lead_status" name="lead_status" className={inputClass} defaultValue="never_contacted">
              {Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="next_follow_up_at">Next Follow-up</label>
            <input id="next_follow_up_at" name="next_follow_up_at" type="date" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={2} className={inputClass} />
          </div>
          <div className="col-span-2">
            <button type="submit" className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400">
              Add Contact
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">All Contacts ({contacts.length})</h2>
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/40">
                    {contact.relationship_type?.replace(/_/g, " ") ?? "unspecified type"}
                    {contact.organization && ` · ${contact.organization.name}`}
                  </div>
                  <div className="font-medium text-white">
                    {contact.first_name} {contact.last_name}
                  </div>
                  <div className="text-sm text-white/50">
                    {RELATIONSHIP_STATUS_LABEL[contact.relationship_status]} · {LEAD_STATUS_LABEL[contact.lead_status]}
                    {contact.next_follow_up_at && ` · follow up ${new Date(contact.next_follow_up_at).toLocaleDateString()}`}
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    {[contact.phone, contact.email].filter(Boolean).join(" · ") || "no contact info on file"}
                  </div>
                  {contact.notes && <div className="mt-1 text-sm text-white/60">{contact.notes}</div>}
                </div>
                <details className="shrink-0">
                  <summary className="cursor-pointer rounded border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white">
                    Edit
                  </summary>
                  <form action={updateContactAction} className="mt-3 grid w-72 grid-cols-1 gap-3 rounded border border-white/10 bg-black/30 p-3">
                    <input type="hidden" name="id" value={contact.id} />
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input name="first_name" defaultValue={contact.first_name} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input name="last_name" defaultValue={contact.last_name ?? ""} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Organization</label>
                      <select name="organization_id" defaultValue={contact.organization_id ?? ""} className={inputClass}>
                        <option value="">— none —</option>
                        {organizations.map((o) => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Title</label>
                      <input name="title" defaultValue={contact.title ?? ""} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input name="phone" type="tel" defaultValue={contact.phone ?? ""} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input name="email" type="email" defaultValue={contact.email ?? ""} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>LinkedIn URL</label>
                      <input name="linkedin_url" type="url" defaultValue={contact.linkedin_url ?? ""} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Relationship Type</label>
                      <select name="relationship_type" defaultValue={contact.relationship_type ?? ""} className={inputClass}>
                        <option value="">— unspecified —</option>
                        {RELATIONSHIP_TYPES.map((t) => (
                          <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Relationship Status</label>
                      <select name="relationship_status" defaultValue={contact.relationship_status} className={inputClass}>
                        {Object.entries(RELATIONSHIP_STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Outreach Status</label>
                      <select name="lead_status" defaultValue={contact.lead_status} className={inputClass}>
                        {Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Next Follow-up</label>
                      <input
                        name="next_follow_up_at"
                        type="date"
                        defaultValue={contact.next_follow_up_at ? contact.next_follow_up_at.slice(0, 10) : ""}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Notes</label>
                      <textarea name="notes" rows={2} defaultValue={contact.notes ?? ""} className={inputClass} />
                    </div>
                    <button type="submit" className="rounded bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-white/85">
                      Save
                    </button>
                  </form>
                </details>
              </div>
            </div>
          ))}
          {contacts.length === 0 && <p className="text-sm text-white/40">No contacts entered yet.</p>}
        </div>
      </section>
    </div>
  );
}
