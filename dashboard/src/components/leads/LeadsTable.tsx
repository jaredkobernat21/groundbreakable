import Link from "next/link";
import type { GblContact, GblLeadWithProperty, GblPropertyIntelligence } from "@/lib/leads/types";
import { OWNER_TYPE_LABEL } from "@/lib/leads/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { primaryContact } from "@/lib/leads/contactHelpers";
import ScoreBadge from "./ScoreBadge";
import StatusPill from "./StatusPill";

const th = "px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40 whitespace-nowrap";
const td = "px-3 py-2.5 text-sm text-[#1c1c1c]/80 whitespace-nowrap";

function SortLink({ column, label, sort, dir, query }: { column: string; label: string; sort?: string; dir?: string; query: string }) {
  const nextDir = sort === column && dir !== "asc" ? "asc" : "desc";
  const params = new URLSearchParams(query);
  params.set("sort", column);
  params.set("dir", nextDir);
  return (
    <Link href={`/leads?${params.toString()}`} className="hover:text-[#1c1c1c]">
      {label}
      {sort === column ? (dir === "asc" ? " ↑" : " ↓") : ""}
    </Link>
  );
}

export default function LeadsTable({
  leads,
  contacts,
  intelligenceByProperty,
  sort,
  dir,
  query,
}: {
  leads: GblLeadWithProperty[];
  contacts: GblContact[];
  intelligenceByProperty: Map<string, GblPropertyIntelligence>;
  sort?: string;
  dir?: string;
  query: string;
}) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1c1c1c]/15 bg-white/60 p-8 text-center text-sm text-[#1c1c1c]/45">
        No leads match these filters yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1c1c1c]/10 bg-white">
      <table className="w-full border-collapse">
        <thead className="border-b border-[#1c1c1c]/10">
          <tr>
            <th className={th}><SortLink column="score" label="Score" sort={sort} dir={dir} query={query} /></th>
            <th className={th}>Owner</th>
            <th className={th}>Address</th>
            <th className={th}>City</th>
            <th className={th}>County</th>
            <th className={th}><SortLink column="sale_date" label="Purchased" sort={sort} dir={dir} query={query} /></th>
            <th className={th}><SortLink column="sale_price" label="Price" sort={sort} dir={dir} query={query} /></th>
            <th className={th}><SortLink column="acreage" label="Acreage" sort={sort} dir={dir} query={query} /></th>
            <th className={th}>Classification</th>
            <th className={th}>Zoning</th>
            <th className={th}>Owner Type</th>
            <th className={th}>Structure</th>
            <th className={th}>Permit</th>
            <th className={th}>Phone</th>
            <th className={th}>Email</th>
            <th className={th}>Contact Conf.</th>
            <th className={th}>Status</th>
            <th className={th}>Last Contacted</th>
            <th className={th}>Note</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const phone = primaryContact(contacts, lead.id, "phone");
            const email = primaryContact(contacts, lead.id, "email");
            const bestConfidence = [phone, email].filter(Boolean).length;
            const permitFound = intelligenceByProperty.get(lead.property_id)?.permit_found;
            const permitLabel = permitFound === null || permitFound === undefined ? "Unknown" : permitFound ? "Yes" : "No";
            return (
              <tr
                key={lead.id}
                className={`border-b border-[#1c1c1c]/5 last:border-0 hover:bg-[#F7F6F2]/60 ${lead.score >= 75 ? "bg-[#B08D57]/[0.04]" : ""}`}
              >
                <td className={td}><ScoreBadge score={lead.score} size="sm" /></td>
                <td className={td}>
                  <Link href={`/leads/${lead.id}`} className="font-medium text-[#1c1c1c] hover:underline">
                    {lead.owner_name}
                  </Link>
                </td>
                <td className={td}>{lead.property.address}</td>
                <td className={td}>{lead.property.city}</td>
                <td className={td}>{lead.property.county}</td>
                <td className={td}>{formatDate(lead.property.sale_date) ?? "—"}</td>
                <td className={td}>{formatCurrency(lead.property.sale_price) ?? "—"}</td>
                <td className={td}>{lead.property.acreage ?? "—"}</td>
                <td className={td}>{lead.property.land_classification ?? "—"}</td>
                <td className={td}>{lead.property.zoning ?? "—"}</td>
                <td className={td}>{OWNER_TYPE_LABEL[lead.owner_type]}</td>
                <td className={td}>{lead.property.existing_structure === null ? "Unknown" : lead.property.existing_structure ? "Yes" : "No"}</td>
                <td className={td}>{permitLabel}</td>
                <td className={td}>{phone ? phone.value : "—"}</td>
                <td className={td}>{email ? email.value : "—"}</td>
                <td className={td}>{bestConfidence > 0 ? "See lead" : "—"}</td>
                <td className={td}><StatusPill status={lead.pipeline_status} /></td>
                <td className={td}>{lead.last_contacted_at ? formatDate(lead.last_contacted_at.slice(0, 10)) : "Never"}</td>
                <td className={`${td} max-w-[160px] truncate`}>{lead.note ?? ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
