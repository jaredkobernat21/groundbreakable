import { createClient } from "@/lib/supabase/server";
import { queryLeads } from "@/lib/leads/queries";
import { KC_SOUTH_PRESET, purchaseWindowToDate, type LeadFilters } from "@/lib/leads/constants";
import type { City, GblContact, GblPropertyIntelligence } from "@/lib/leads/types";
import TodayBestLeads from "@/components/leads/TodayBestLeads";
import FilterForm from "@/components/leads/FilterForm";
import LeadsTable from "@/components/leads/LeadsTable";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function arr(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function parseFilters(sp: SearchParams): LeadFilters {
  const hasAnyParam = Object.keys(sp).some((k) => k !== "sort" && k !== "dir");
  if (!hasAnyParam) return KC_SOUTH_PRESET;
  if (sp.preset === "kc_south") return KC_SOUTH_PRESET;
  if (sp.cleared === "1") {
    return {
      cities: [],
      purchaseWindow: "all",
      noExistingStructure: false,
      ownerTypes: [],
      permitStatus: "any",
      minAcreage: null,
      maxAcreage: null,
      minPrice: null,
      maxPrice: null,
    };
  }

  const num = (v: string | string[] | undefined) => {
    const s = Array.isArray(v) ? v[0] : v;
    return s ? Number(s) : null;
  };

  return {
    cities: arr(sp.city) as City[],
    purchaseWindow: (Array.isArray(sp.purchase) ? sp.purchase[0] : sp.purchase) as LeadFilters["purchaseWindow"] ?? "all",
    noExistingStructure: sp.noStructure === "1",
    ownerTypes: arr(sp.owner),
    permitStatus: (Array.isArray(sp.permit) ? sp.permit[0] : sp.permit) as LeadFilters["permitStatus"] ?? "any",
    minAcreage: num(sp.minAcreage),
    maxAcreage: num(sp.maxAcreage),
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
  };
}

function sortLeads<T extends { score: number; last_contacted_at: string | null; property: { sale_date: string | null; sale_price: number | null; acreage: number | null } }>(
  leads: T[],
  sort: string | undefined,
  dir: string | undefined
): T[] {
  const factor = dir === "asc" ? 1 : -1;
  const key = sort ?? "score";
  return [...leads].sort((a, b) => {
    let av: number | string | null = null;
    let bv: number | string | null = null;
    switch (key) {
      case "sale_date":
        av = a.property.sale_date;
        bv = b.property.sale_date;
        break;
      case "sale_price":
        av = a.property.sale_price;
        bv = b.property.sale_price;
        break;
      case "acreage":
        av = a.property.acreage;
        bv = b.property.acreage;
        break;
      default:
        av = a.score;
        bv = b.score;
    }
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    return av > bv ? factor : av < bv ? -factor : 0;
  });
}

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();
  const filters = parseFilters(searchParams);
  const searchTerm = (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q)?.trim().toLowerCase();

  // A global search looks for a specific known record -- it bypasses the
  // active filter preset entirely rather than combining with it.
  const leads = await queryLeads(
    supabase,
    searchTerm
      ? {}
      : {
          cities: filters.cities.length ? filters.cities : undefined,
          purchaseAfter: purchaseWindowToDate(filters.purchaseWindow),
          noExistingStructure: filters.noExistingStructure || undefined,
          ownerTypes: filters.ownerTypes.length ? filters.ownerTypes : undefined,
          minAcreage: filters.minAcreage,
          maxAcreage: filters.maxAcreage,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        }
  );

  const propertyIds = leads.map((l) => l.property_id);
  const leadIds = leads.map((l) => l.id);

  const [{ data: contacts }, { data: intelligenceRows }] = await Promise.all([
    leadIds.length
      ? supabase.from("gbl_contacts").select("*").in("lead_id", leadIds).returns<GblContact[]>()
      : Promise.resolve({ data: [] as GblContact[] }),
    propertyIds.length
      ? supabase.from("gbl_property_intelligence").select("*").in("property_id", propertyIds).returns<GblPropertyIntelligence[]>()
      : Promise.resolve({ data: [] as GblPropertyIntelligence[] }),
  ]);

  let visibleLeads = leads;
  if (!searchTerm && filters.permitStatus === "no_permit") {
    const intelByProperty = new Map((intelligenceRows ?? []).map((i) => [i.property_id, i]));
    visibleLeads = visibleLeads.filter((l) => intelByProperty.get(l.property_id)?.permit_found !== true);
  }
  if (searchTerm) {
    const contactsByLead = new Map<string, GblContact[]>();
    (contacts ?? []).forEach((c) => contactsByLead.set(c.lead_id, [...(contactsByLead.get(c.lead_id) ?? []), c]));
    visibleLeads = visibleLeads.filter((l) => {
      const haystack = [l.owner_name, l.property.address, l.property.parcel_id, l.property.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (haystack.includes(searchTerm)) return true;
      return (contactsByLead.get(l.id) ?? []).some((c) => c.value.toLowerCase().includes(searchTerm));
    });
  }

  const sort = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort;
  const dir = Array.isArray(searchParams.dir) ? searchParams.dir[0] : searchParams.dir;
  const sortedLeads = sortLeads(visibleLeads, sort, dir);

  const todaysBest = [...visibleLeads]
    .filter((l) => !["not_a_fit", "do_not_contact", "customer"].includes(l.pipeline_status))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const intelligenceByProperty = new Map((intelligenceRows ?? []).map((i) => [i.property_id, i]));
  const queryString = new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) =>
      v === undefined ? [] : (Array.isArray(v) ? v : [v]).map((val) => [k, val] as [string, string])
    )
  ).toString();

  const today = new Date().toISOString().slice(0, 10);
  const followUpsToday = leads.filter((l) => l.next_follow_up && l.next_follow_up <= today);

  return (
    <div className="space-y-10">
      {followUpsToday.length > 0 && (
        <div className="rounded-2xl border border-[#B08D57]/30 bg-[#B08D57]/[0.06] p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8a6a3d]">
            Follow Ups Today ({followUpsToday.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {followUpsToday.map((l) => (
              <a
                key={l.id}
                href={`/leads/${l.id}`}
                className="rounded-full border border-[#B08D57]/30 bg-white px-3 py-1 text-xs font-medium text-[#1c1c1c] hover:bg-[#B08D57]/10"
              >
                {l.owner_name} · {l.property.city}
              </a>
            ))}
          </div>
        </div>
      )}

      {!searchTerm && (
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#1c1c1c]">Today&rsquo;s Best Leads</h1>
          <p className="mb-4 text-sm text-[#1c1c1c]/45">Who to contact today, ranked by Groundbreakable Score.</p>
          <TodayBestLeads leads={todaysBest} contacts={contacts ?? []} />
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold tracking-tight text-[#1c1c1c]">
            {searchTerm ? `Search results for "${searchTerm}"` : "All Leads"}
          </h2>
          <span className="text-sm text-[#1c1c1c]/40">{sortedLeads.length} properties</span>
        </div>
        {!searchTerm && <FilterForm filters={filters} />}
        <LeadsTable
          leads={sortedLeads}
          contacts={contacts ?? []}
          intelligenceByProperty={intelligenceByProperty}
          sort={sort}
          dir={dir}
          query={queryString}
        />
      </div>
    </div>
  );
}
