import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { queryContacts, listBuyBoxes } from "@/lib/slade";
import { createBuyBoxAction, updateBuyBoxAction } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-white/40";

function TriBoolField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: boolean | null }) {
  const current = defaultValue === true ? "true" : defaultValue === false ? "false" : "";
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select name={name} defaultValue={current} className={inputClass}>
        <option value="">Unspecified</option>
        <option value="true">Required</option>
        <option value="false">Not required</option>
      </select>
    </div>
  );
}

function fmtRange(min: number | null, max: number | null, unit = ""): string {
  if (min === null && max === null) return "any";
  if (min !== null && max !== null) return `${min}–${max}${unit}`;
  if (min !== null) return `${min}${unit}+`;
  return `up to ${max}${unit}`;
}

export default async function SladeBuyBoxesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user ? await supabase.from("investor_profiles").select("role").eq("id", user.id).single() : { data: null };
  if (profile?.role !== "admin") redirect("/dashboard");

  const [contacts, buyBoxes] = await Promise.all([queryContacts(supabase), listBuyBoxes(supabase)]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/admin/slade" className="text-xs text-white/40 hover:text-white">
          ← SLADE
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-white">Buy Boxes</h1>
        <p className="text-sm text-white/50">
          Structured developer/investor acquisition criteria — never buried in notes. Written through the same
          service functions SLADE chat uses.
        </p>
      </div>

      {contacts.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/50">
          Add a <Link href="/dashboard/admin/slade/contacts" className="underline hover:text-white">contact</Link> first — every buy box belongs to one.
        </p>
      ) : (
        <section className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">Add a Buy Box</h2>
          <form action={createBuyBoxAction} className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="contact_id">Contact</label>
              <select id="contact_id" name="contact_id" required className={inputClass} defaultValue="">
                <option value="" disabled>— select —</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name} {c.organization ? `(${c.organization.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="name">Name</label>
              <input id="name" name="name" defaultValue="Primary" className={inputClass} placeholder="Primary" />
              <p className="mt-1 text-xs text-white/30">Distinguishes multiple buy boxes for the same contact.</p>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input id="active" name="active" type="checkbox" defaultChecked className="h-4 w-4" />
              <label htmlFor="active" className="text-sm text-white/70">Active</label>
            </div>
            <div>
              <label className={labelClass} htmlFor="source">Source</label>
              <input id="source" name="source" className={inputClass} placeholder="call, email, form, inferred…" />
            </div>

            <div>
              <label className={labelClass} htmlFor="target_markets">Target Markets (comma-separated)</label>
              <input id="target_markets" name="target_markets" className={inputClass} placeholder="Topeka, Lawrence" />
            </div>
            <div>
              <label className={labelClass} htmlFor="asset_types">Asset Types (comma-separated)</label>
              <input id="asset_types" name="asset_types" className={inputClass} placeholder="multifamily, industrial" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="min_acres">Min Acres</label>
                <input id="min_acres" name="min_acres" type="number" step="any" className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="max_acres">Max Acres</label>
                <input id="max_acres" name="max_acres" type="number" step="any" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="min_price">Min Price ($)</label>
                <input id="min_price" name="min_price" type="number" step="any" className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="max_price">Max Price ($)</label>
                <input id="max_price" name="max_price" type="number" step="any" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="preferred_deal_types">Preferred Deal Types (comma-separated)</label>
              <input id="preferred_deal_types" name="preferred_deal_types" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="preferred_distress_signals">Preferred Distress Signals (comma-separated)</label>
              <input id="preferred_distress_signals" name="preferred_distress_signals" className={inputClass} />
            </div>

            <div>
              <label className={labelClass} htmlFor="zoning_preferences">Zoning Preferences (comma-separated)</label>
              <input id="zoning_preferences" name="zoning_preferences" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="excluded_uses">Excluded Uses (comma-separated)</label>
              <input id="excluded_uses" name="excluded_uses" className={inputClass} />
            </div>

            <div className="col-span-2">
              <label className={labelClass} htmlFor="entitlement_preferences">Entitlement Preferences</label>
              <input id="entitlement_preferences" name="entitlement_preferences" className={inputClass} />
            </div>

            <div className="col-span-2 grid grid-cols-4 gap-4 border-t border-white/10 pt-4">
              <TriBoolField name="requires_sewer" label="Sewer" />
              <TriBoolField name="requires_water" label="Water" />
              <TriBoolField name="requires_highway_access" label="Highway Access" />
              <TriBoolField name="requires_rail_access" label="Rail Access" />
            </div>

            <div className="col-span-2">
              <label className={labelClass} htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" rows={2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="last_verified_at">Last Verified</label>
              <input id="last_verified_at" name="last_verified_at" type="date" className={inputClass} />
            </div>

            <div className="col-span-2">
              <button type="submit" className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400">
                Add Buy Box
              </button>
            </div>
          </form>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-white/60">All Buy Boxes ({buyBoxes.length})</h2>
        <div className="space-y-3">
          {buyBoxes.map((bb) => (
            <div key={bb.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/40">
                    {bb.contact ? `${bb.contact.first_name} ${bb.contact.last_name ?? ""}`.trim() : "unknown contact"}
                    {!bb.active && " · inactive"}
                  </div>
                  <div className="font-medium text-white">{bb.name}</div>
                  <div className="text-sm text-white/50">
                    {fmtRange(bb.min_acres, bb.max_acres, " ac")} · {fmtRange(bb.min_price, bb.max_price, "$")}
                    {bb.asset_types.length > 0 && ` · ${bb.asset_types.join(", ")}`}
                  </div>
                  {bb.target_markets.length > 0 && <div className="text-sm text-white/50">Markets: {bb.target_markets.join(", ")}</div>}
                  {bb.notes && <div className="mt-1 text-sm text-white/60">{bb.notes}</div>}
                </div>
                <details className="shrink-0">
                  <summary className="cursor-pointer rounded border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white">
                    Edit
                  </summary>
                  <form action={updateBuyBoxAction} className="mt-3 grid w-80 grid-cols-1 gap-3 rounded border border-white/10 bg-black/30 p-3">
                    <input type="hidden" name="id" value={bb.id} />
                    <div>
                      <label className={labelClass}>Name</label>
                      <input name="name" defaultValue={bb.name} className={inputClass} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input id={`active-${bb.id}`} name="active" type="checkbox" defaultChecked={bb.active} className="h-4 w-4" />
                      <label htmlFor={`active-${bb.id}`} className="text-sm text-white/70">Active</label>
                    </div>
                    <div>
                      <label className={labelClass}>Target Markets</label>
                      <input name="target_markets" defaultValue={bb.target_markets.join(", ")} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Asset Types</label>
                      <input name="asset_types" defaultValue={bb.asset_types.join(", ")} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Min Acres</label>
                        <input name="min_acres" type="number" step="any" defaultValue={bb.min_acres ?? ""} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Max Acres</label>
                        <input name="max_acres" type="number" step="any" defaultValue={bb.max_acres ?? ""} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Min Price</label>
                        <input name="min_price" type="number" step="any" defaultValue={bb.min_price ?? ""} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Max Price</label>
                        <input name="max_price" type="number" step="any" defaultValue={bb.max_price ?? ""} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Preferred Deal Types</label>
                      <input name="preferred_deal_types" defaultValue={bb.preferred_deal_types.join(", ")} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Preferred Distress Signals</label>
                      <input name="preferred_distress_signals" defaultValue={bb.preferred_distress_signals.join(", ")} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Zoning Preferences</label>
                      <input name="zoning_preferences" defaultValue={bb.zoning_preferences.join(", ")} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Excluded Uses</label>
                      <input name="excluded_uses" defaultValue={bb.excluded_uses.join(", ")} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Entitlement Preferences</label>
                      <input name="entitlement_preferences" defaultValue={bb.entitlement_preferences ?? ""} className={inputClass} />
                    </div>
                    <TriBoolField name="requires_sewer" label="Sewer" defaultValue={bb.requires_sewer} />
                    <TriBoolField name="requires_water" label="Water" defaultValue={bb.requires_water} />
                    <TriBoolField name="requires_highway_access" label="Highway Access" defaultValue={bb.requires_highway_access} />
                    <TriBoolField name="requires_rail_access" label="Rail Access" defaultValue={bb.requires_rail_access} />
                    <div>
                      <label className={labelClass}>Notes</label>
                      <textarea name="notes" rows={2} defaultValue={bb.notes ?? ""} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Verified</label>
                      <input
                        name="last_verified_at"
                        type="date"
                        defaultValue={bb.last_verified_at ? bb.last_verified_at.slice(0, 10) : ""}
                        className={inputClass}
                      />
                    </div>
                    <button type="submit" className="rounded bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-white/85">
                      Save
                    </button>
                  </form>
                </details>
              </div>
            </div>
          ))}
          {buyBoxes.length === 0 && <p className="text-sm text-white/40">No buy boxes entered yet.</p>}
        </div>
      </section>
    </div>
  );
}
