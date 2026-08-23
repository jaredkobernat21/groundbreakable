import type { GblContact, GblLead } from "@/lib/leads/types";
import { CONFIDENCE_LABEL } from "@/lib/leads/types";
import { formatDate } from "@/lib/format";
import { addContact, updateDnc } from "@/app/leads/[id]/actions";

const inputClass = "w-full rounded border border-[#1c1c1c]/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#B08D57]";
const labelClass = "mb-1 block text-xs text-[#1c1c1c]/45";

export default function ContactsPanel({ lead, contacts }: { lead: GblLead; contacts: GblContact[] }) {
  const boundAddContact = addContact.bind(null, lead.id);
  const boundUpdateDnc = updateDnc.bind(null, lead.id);

  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
      <h2 className="mb-3 font-serif text-lg font-semibold text-[#1c1c1c]">Owner &amp; Contact Information</h2>

      {contacts.length === 0 && <p className="mb-3 text-sm text-[#1c1c1c]/40">No contact details on file yet.</p>}
      <ul className="mb-4 space-y-2">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg border border-[#1c1c1c]/8 px-3 py-2 text-sm">
            <div>
              <span className="font-medium text-[#1c1c1c]/85">{c.value}</span>
              <span className="ml-2 text-xs uppercase tracking-wide text-[#1c1c1c]/35">{c.type.replace("_", " ")}</span>
              {c.phone_type && <span className="ml-1 text-xs text-[#1c1c1c]/35">({c.phone_type})</span>}
            </div>
            <div className="text-right text-xs text-[#1c1c1c]/40">
              <div>{CONFIDENCE_LABEL[c.confidence]}{c.source ? ` · ${c.source}` : ""}</div>
              {c.verified_at && <div>Verified {formatDate(c.verified_at)}</div>}
            </div>
          </li>
        ))}
      </ul>

      <form action={boundAddContact} className="mb-6 grid grid-cols-2 gap-2 border-t border-[#1c1c1c]/10 pt-4">
        <div>
          <label className={labelClass}>Type</label>
          <select name="type" className={inputClass}>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="mailing_address">Mailing address</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Value</label>
          <input name="value" required className={inputClass} placeholder="(913) 555-0100" />
        </div>
        <div>
          <label className={labelClass}>Phone type (if phone)</label>
          <select name="phone_type" className={inputClass} defaultValue="">
            <option value="">—</option>
            <option value="mobile">Mobile</option>
            <option value="landline">Landline</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Confidence</label>
          <select name="confidence" className={inputClass} defaultValue="unknown">
            <option value="verified">Verified</option>
            <option value="likely">Likely</option>
            <option value="unknown">Unknown</option>
            <option value="needs_confirmation">Needs confirmation</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Source</label>
          <input name="source" className={inputClass} placeholder="Manual / provider name" />
        </div>
        <div>
          <label className={labelClass}>Verified date</label>
          <input name="verified_at" type="date" className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Notes</label>
          <input name="notes" className={inputClass} />
        </div>
        <div className="col-span-2">
          <button type="submit" className="rounded-full bg-[#1c1c1c] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1c1c1c]/85">
            Add Contact
          </button>
        </div>
      </form>

      <form action={boundUpdateDnc} className="rounded-lg border border-red-100 bg-red-50/50 p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-red-800">
          <input type="checkbox" name="dnc_status" defaultChecked={lead.dnc_status} />
          Do Not Contact
        </label>
        <input
          name="dnc_notes"
          defaultValue={lead.dnc_notes ?? ""}
          placeholder="Opt-out / permission notes"
          className="mt-2 w-full rounded border border-red-200 bg-white px-2.5 py-1.5 text-sm outline-none"
        />
        {lead.dnc_checked_at && <p className="mt-1 text-xs text-red-600/60">Last checked {formatDate(lead.dnc_checked_at)}</p>}
        <button type="submit" className="mt-2 rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
          Save
        </button>
      </form>
    </div>
  );
}
