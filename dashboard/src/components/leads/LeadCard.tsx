import Link from "next/link";
import type { GblContact, GblLeadWithProperty } from "@/lib/leads/types";
import { formatDate, formatRelativeVerified } from "@/lib/format";
import { primaryContact } from "@/lib/leads/contactHelpers";
import ScoreBadge from "./ScoreBadge";

function whyNow(lead: GblLeadWithProperty): string {
  const top = [...lead.score_reasons].filter((r) => r.direction === "positive").sort((a, b) => b.points - a.points);
  if (top.length === 0) return "Flagged by the Groundbreakable Score — review the reasons on the lead page.";
  return top
    .slice(0, 2)
    .map((r) => r.label)
    .join(". ");
}

export default function LeadCard({ lead, contacts }: { lead: GblLeadWithProperty; contacts: GblContact[] }) {
  const phone = primaryContact(contacts, lead.id, "phone");
  const purchased = lead.property.sale_date ? formatRelativeVerified(lead.property.sale_date) : "Purchase date unknown";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-[0_1px_2px_rgba(28,28,28,0.04)]">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <ScoreBadge score={lead.score} size="lg" />
          <div className="flex-1">
            <div className="font-serif text-lg font-semibold leading-tight text-[#1c1c1c]">{lead.owner_name}</div>
            <div className="text-sm text-[#1c1c1c]/50">
              {lead.property.acreage ? `${lead.property.acreage} acres • ` : ""}
              {lead.property.city}, KS
            </div>
          </div>
        </div>
        <div className="mb-3 space-y-1 text-sm text-[#1c1c1c]/70">
          <div>Purchased {purchased}{lead.property.sale_date ? ` (${formatDate(lead.property.sale_date)})` : ""}</div>
          <div>{lead.property.existing_structure === false ? "No residence" : lead.property.existing_structure === true ? "Existing structure present" : "Structure status unknown"}</div>
        </div>
        <p className="mb-4 text-sm leading-snug text-[#1c1c1c]/60">
          <span className="font-medium text-[#1c1c1c]/80">Why now: </span>
          {whyNow(lead)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/leads/${lead.id}`}
          className="flex-1 rounded-full border border-[#1c1c1c]/15 px-3 py-1.5 text-center text-xs font-medium text-[#1c1c1c] hover:bg-[#1c1c1c]/5"
        >
          View
        </Link>
        {phone ? (
          <a
            href={`tel:${phone.value}`}
            className="flex-1 rounded-full bg-[#1c1c1c] px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-[#1c1c1c]/85"
          >
            Call {phone.value}
          </a>
        ) : (
          <span className="flex-1 rounded-full bg-[#1c1c1c]/5 px-3 py-1.5 text-center text-xs font-medium text-[#1c1c1c]/30">
            No verified number
          </span>
        )}
      </div>
    </div>
  );
}
