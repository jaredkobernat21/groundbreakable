import type { GblPropertyIntelligence } from "@/lib/leads/types";
import { upsertIntelligence } from "@/app/leads/[id]/actions";

const inputClass = "w-full rounded border border-[#1c1c1c]/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#B08D57]";
const labelClass = "mb-1 block text-xs text-[#1c1c1c]/45";
const confidenceOptions = (
  <>
    <option value="verified">Verified</option>
    <option value="likely">Likely</option>
    <option value="unknown">Unknown</option>
    <option value="needs_confirmation">Needs confirmation</option>
  </>
);

function Field({ label, name, children, confidenceName, confidenceValue }: { label: string; name: string; children: React.ReactNode; confidenceName: string; confidenceValue?: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-end gap-2">
      <div>
        <label className={labelClass}>{label}</label>
        {children}
      </div>
      <div className="w-36">
        <select name={confidenceName} defaultValue={confidenceValue ?? "unknown"} className={inputClass}>
          {confidenceOptions}
        </select>
      </div>
    </div>
  );
}

export default function PreBuildSnapshot({ propertyId, intelligence }: { propertyId: string; intelligence: GblPropertyIntelligence | null }) {
  const i = intelligence;
  const boundUpsert = upsertIntelligence.bind(null, propertyId);

  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
      <h2 className="mb-1 font-serif text-lg font-semibold text-[#1c1c1c]">Pre-Build Snapshot</h2>
      <p className="mb-4 text-xs text-[#1c1c1c]/40">Every field is Verified, Likely, Unknown, or Needs confirmation — nothing here is invented.</p>

      <form action={boundUpsert} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Water</legend>
          <Field label="Type" name="water_type" confidenceName="water_confidence" confidenceValue={i?.water_confidence}>
            <select name="water_type" defaultValue={i?.water_type ?? ""} className={inputClass}>
              <option value="">—</option>
              <option value="municipal">Municipal</option>
              <option value="rural_water">Rural water district</option>
              <option value="well_likely">Well likely</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>
          <input name="water_provider" defaultValue={i?.water_provider ?? ""} placeholder="Provider (if identifiable)" className={inputClass} />
        </fieldset>

        <fieldset className="space-y-2 border-t border-[#1c1c1c]/8 pt-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Sewer</legend>
          <Field label="Type" name="sewer_type" confidenceName="sewer_confidence" confidenceValue={i?.sewer_confidence}>
            <select name="sewer_type" defaultValue={i?.sewer_type ?? ""} className={inputClass}>
              <option value="">—</option>
              <option value="public_sewer">Public sewer</option>
              <option value="septic_likely">Septic likely</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>
        </fieldset>

        <fieldset className="space-y-2 border-t border-[#1c1c1c]/8 pt-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Electric</legend>
          <Field label="Likely provider" name="electric_provider" confidenceName="electric_confidence" confidenceValue={i?.electric_confidence}>
            <input name="electric_provider" defaultValue={i?.electric_provider ?? ""} className={inputClass} />
          </Field>
        </fieldset>

        <fieldset className="space-y-2 border-t border-[#1c1c1c]/8 pt-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Gas</legend>
          <Field label="Type" name="gas_type" confidenceName="gas_confidence" confidenceValue={i?.gas_confidence}>
            <select name="gas_type" defaultValue={i?.gas_type ?? ""} className={inputClass}>
              <option value="">—</option>
              <option value="utility">Utility</option>
              <option value="propane_likely">Propane likely</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>
        </fieldset>

        <fieldset className="space-y-2 border-t border-[#1c1c1c]/8 pt-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Road &amp; Access</legend>
          <Field label="Frontage" name="road_frontage" confidenceName="road_confidence" confidenceValue={i?.road_confidence}>
            <input name="road_frontage" defaultValue={i?.road_frontage ?? ""} className={inputClass} />
          </Field>
          <select name="road_access_type" defaultValue={i?.road_access_type ?? ""} className={inputClass}>
            <option value="">Access — unknown</option>
            <option value="public">Public road</option>
            <option value="private">Private road</option>
            <option value="unknown">Unknown</option>
          </select>
          <input name="road_notes" defaultValue={i?.road_notes ?? ""} placeholder="Access concerns" className={inputClass} />
        </fieldset>

        <fieldset className="space-y-2 border-t border-[#1c1c1c]/8 pt-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Site</legend>
          <Field label="Confidence covers all site fields below" name="site" confidenceName="site_confidence" confidenceValue={i?.site_confidence}>
            <span className="text-sm text-[#1c1c1c]/40">—</span>
          </Field>
          <input name="topography" defaultValue={i?.topography ?? ""} placeholder="Topography / slope" className={inputClass} />
          <input name="flood_zone" defaultValue={i?.flood_zone ?? ""} placeholder="Flood zone" className={inputClass} />
          <input name="drainage_notes" defaultValue={i?.drainage_notes ?? ""} placeholder="Drainage considerations" className={inputClass} />
          <input name="environmental_flags" defaultValue={i?.environmental_flags ?? ""} placeholder="Environmental flags" className={inputClass} />
          <input name="easements" defaultValue={i?.easements ?? ""} placeholder="Easements" className={inputClass} />
        </fieldset>

        <fieldset className="space-y-2 border-t border-[#1c1c1c]/8 pt-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Permits</legend>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm text-[#1c1c1c]/70">
              <input type="radio" name="permit_found" value="1" defaultChecked={i?.permit_found === true} /> Permit found
            </label>
            <label className="flex items-center gap-1.5 text-sm text-[#1c1c1c]/70">
              <input type="radio" name="permit_found" value="" defaultChecked={i?.permit_found === false} /> No permit found
            </label>
          </div>
          <Field label="Status" name="permit_status" confidenceName="permit_confidence" confidenceValue={i?.permit_confidence}>
            <input name="permit_status" defaultValue={i?.permit_status ?? ""} className={inputClass} />
          </Field>
          <input name="permit_date" type="date" defaultValue={i?.permit_date ?? ""} className={inputClass} />
          <input name="permit_jurisdiction" defaultValue={i?.permit_jurisdiction ?? ""} placeholder="Jurisdiction" className={inputClass} />
          <input name="permit_notes" defaultValue={i?.permit_notes ?? ""} placeholder="Other relevant permits" className={inputClass} />
        </fieldset>

        <button type="submit" className="rounded-full bg-[#1c1c1c] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1c1c1c]/85">
          Save Snapshot
        </button>
      </form>
    </div>
  );
}
