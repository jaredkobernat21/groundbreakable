import { CITY_OPTIONS } from "@/lib/leads/types";
import { PURCHASE_WINDOW_LABEL, type LeadFilters } from "@/lib/leads/constants";

const selectClass =
  "rounded border border-[#1c1c1c]/15 bg-white px-2.5 py-1.5 text-sm text-[#1c1c1c] outline-none focus:border-[#B08D57]";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-[#1c1c1c]/40";

// A plain GET form -- filter state lives entirely in the URL (?city=&purchase=&...)
// so the page stays a server component and filters are shareable/bookmarkable,
// matching the query-param-driven convention already used by /dashboard/map
// and the old /dashboard/leads page.
export default function FilterForm({ filters }: { filters: LeadFilters }) {
  return (
    <form method="get" className="mb-6 rounded-2xl border border-[#1c1c1c]/10 bg-white p-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className={labelClass}>City</label>
          <div className="space-y-1">
            {CITY_OPTIONS.filter((c) => c !== "Other").map((city) => (
              <label key={city} className="flex items-center gap-1.5 text-sm text-[#1c1c1c]/80">
                <input type="checkbox" name="city" value={city} defaultChecked={filters.cities.includes(city)} />
                {city}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="purchase">Purchased</label>
          <select id="purchase" name="purchase" defaultValue={filters.purchaseWindow} className={selectClass}>
            {Object.entries(PURCHASE_WINDOW_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Owner type</label>
          <div className="space-y-1">
            {["individual", "couple", "trust", "llc"].map((t) => (
              <label key={t} className="flex items-center gap-1.5 text-sm capitalize text-[#1c1c1c]/80">
                <input type="checkbox" name="owner" value={t} defaultChecked={filters.ownerTypes.includes(t)} />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="permit">Build activity</label>
          <select id="permit" name="permit" defaultValue={filters.permitStatus} className={selectClass}>
            <option value="any">Any</option>
            <option value="no_permit">No residential permit found</option>
          </select>
          <label className="mt-3 flex items-center gap-1.5 text-sm text-[#1c1c1c]/80">
            <input type="checkbox" name="noStructure" value="1" defaultChecked={filters.noExistingStructure} />
            No existing structure
          </label>
        </div>

        <div>
          <label className={labelClass} htmlFor="minAcreage">Acreage min / max</label>
          <div className="flex gap-1.5">
            <input
              id="minAcreage"
              name="minAcreage"
              type="number"
              step="0.1"
              defaultValue={filters.minAcreage ?? ""}
              className={`${selectClass} w-16`}
              placeholder="Min"
            />
            <input
              name="maxAcreage"
              type="number"
              step="0.1"
              defaultValue={filters.maxAcreage ?? ""}
              className={`${selectClass} w-16`}
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="minPrice">Sale price min / max</label>
          <div className="flex gap-1.5">
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              defaultValue={filters.minPrice ?? ""}
              className={`${selectClass} w-16`}
              placeholder="Min"
            />
            <input
              name="maxPrice"
              type="number"
              defaultValue={filters.maxPrice ?? ""}
              className={`${selectClass} w-16`}
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button type="submit" className="rounded-full bg-[#1c1c1c] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1c1c1c]/85">
          Apply Filters
        </button>
        <a href="/leads?preset=kc_south" className="text-xs font-medium text-[#8a6a3d] hover:underline">
          KC South — Build Leads preset
        </a>
        <a href="/leads?cleared=1" className="text-xs text-[#1c1c1c]/40 hover:underline">
          Clear all
        </a>
      </div>
    </form>
  );
}
