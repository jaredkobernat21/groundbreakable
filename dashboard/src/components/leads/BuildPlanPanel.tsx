import type { GblBuildProject } from "@/lib/leads/types";
import { formatCurrency } from "@/lib/format";
import { createBuildProject } from "@/app/leads/[id]/actions";

const inputClass = "w-full rounded border border-[#1c1c1c]/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#B08D57]";
const labelClass = "mb-1 block text-xs text-[#1c1c1c]/45";

export default function BuildPlanPanel({ leadId, propertyId, project }: { leadId: string; propertyId: string; project: GblBuildProject | null }) {
  if (project) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
        <h2 className="mb-3 font-serif text-lg font-semibold text-[#1c1c1c]">Build Plan Project</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-[#1c1c1c]/75">
          <div>Timeline: {project.timeline ?? "—"}</div>
          <div>Budget: {project.budget ?? "—"}</div>
          <div>Size: {project.desired_sqft ? `${project.desired_sqft} sq ft` : "—"}</div>
          <div>Beds / Baths: {project.bedrooms ?? "—"} / {project.bathrooms ?? "—"}</div>
          <div>Garage: {project.garage ?? "—"}</div>
          <div>Basement: {project.basement ?? "—"}</div>
          <div>Style: {project.style ?? "—"}</div>
          <div>Architect: {project.architect_status ?? "—"}</div>
          <div>Builder: {project.builder_status ?? "—"}</div>
          <div>Lender: {project.lender_status ?? "—"}</div>
        </div>
        {project.goals && <p className="mt-3 text-sm text-[#1c1c1c]/70"><span className="font-medium">Goals: </span>{project.goals}</p>}
        {project.uncertainties && <p className="mt-1 text-sm text-[#1c1c1c]/70"><span className="font-medium">Uncertainties: </span>{project.uncertainties}</p>}
      </div>
    );
  }

  const boundCreate = createBuildProject.bind(null, leadId, propertyId);

  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
      <h2 className="mb-1 font-serif text-lg font-semibold text-[#1c1c1c]">Create Build Plan</h2>
      <p className="mb-4 text-xs text-[#1c1c1c]/40">
        For a homeowner ready to move forward — creates the Groundbreakable Build Plan project record and moves this lead to Build Plan.
      </p>
      <form action={boundCreate} className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Timeline</label>
          <input name="timeline" className={inputClass} placeholder="e.g. Spring 2027" />
        </div>
        <div>
          <label className={labelClass}>Budget</label>
          <input name="budget" className={inputClass} placeholder="e.g. $600K–$750K" />
        </div>
        <div>
          <label className={labelClass}>Desired sq ft</label>
          <input name="desired_sqft" type="number" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Style</label>
          <input name="style" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bedrooms</label>
          <input name="bedrooms" type="number" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bathrooms</label>
          <input name="bathrooms" type="number" step="0.5" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Garage</label>
          <input name="garage" className={inputClass} placeholder="e.g. 3-car attached" />
        </div>
        <div>
          <label className={labelClass}>Basement</label>
          <input name="basement" className={inputClass} placeholder="e.g. Walkout finished" />
        </div>
        <div>
          <label className={labelClass}>Architect status</label>
          <input name="architect_status" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Builder status</label>
          <input name="builder_status" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lender status</label>
          <input name="lender_status" className={inputClass} />
        </div>
        <div />
        <div className="col-span-2">
          <label className={labelClass}>Major goals</label>
          <textarea name="goals" rows={2} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Biggest uncertainties</label>
          <textarea name="uncertainties" rows={2} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Notes</label>
          <textarea name="notes" rows={2} className={inputClass} />
        </div>
        <div className="col-span-2">
          <button type="submit" className="rounded-full bg-[#1c1c1c] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1c1c1c]/85">
            Create Build Plan
          </button>
        </div>
      </form>
    </div>
  );
}
