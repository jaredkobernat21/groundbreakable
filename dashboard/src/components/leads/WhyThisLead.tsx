import type { GblLeadWithProperty, GblPropertyIntelligence } from "@/lib/leads/types";
import { formatCurrency, formatDate } from "@/lib/format";

function monthsAgo(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const months = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  return Math.round(months);
}

// Plain-language summary generated from what's actually on record. Always
// hedged ("appears", "may", "worth contacting") -- this system never claims
// to know a homeowner's intent, only surfaces indicators worth a call.
export default function WhyThisLead({ lead, intelligence }: { lead: GblLeadWithProperty; intelligence: GblPropertyIntelligence | null }) {
  const p = lead.property;
  const months = monthsAgo(p.sale_date);
  const ownerLabel = lead.owner_type === "couple" ? "purchased" : "purchased";
  const acreageText = p.acreage ? `${p.acreage}-acre` : "";
  const structureText =
    p.existing_structure === false
      ? "No residence is currently shown on the parcel"
      : p.existing_structure === true
        ? "A structure is already present on the parcel"
        : "It's unknown whether a residence is present on the parcel";
  const permitText =
    intelligence?.permit_found === false
      ? "no residential building permit has been detected"
      : intelligence?.permit_found === true
        ? "a residential building permit has been detected"
        : "permit status has not been verified";

  const summary = [
    `${lead.owner_name} ${ownerLabel} this ${acreageText} ${p.property_type ? p.property_type.replace(/_/g, " ") : "residential"} parcel${
      months !== null ? ` ${months} month${months === 1 ? "" : "s"} ago` : ""
    }${p.sale_price ? ` for ${formatCurrency(p.sale_price)}` : ""}.`,
    `${structureText}, and ${permitText}.`,
  ].join(" ");

  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
      <h2 className="mb-3 font-serif text-lg font-semibold text-[#1c1c1c]">Why Groundbreakable flagged this property</h2>
      <p className="mb-3 text-sm leading-relaxed text-[#1c1c1c]/75">{summary}</p>
      <p className="text-sm text-[#1c1c1c]/60">
        <span className="font-medium text-[#1c1c1c]/80">Likely opportunity: </span>
        early-stage custom-home planning may be worth exploring — this is a prioritization signal, not a confirmed intent.
      </p>

      {lead.score_reasons.length > 0 && (
        <div className="mt-5 border-t border-[#1c1c1c]/10 pt-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">Why the score</div>
          <ul className="space-y-1.5">
            {lead.score_reasons.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className={r.direction === "positive" ? "text-emerald-600" : "text-red-500"}>
                  {r.direction === "positive" ? "✓" : "✗"}
                </span>
                <span className="text-[#1c1c1c]/75">{r.label}</span>
                <span className="ml-auto text-xs text-[#1c1c1c]/35">{r.points > 0 ? `+${r.points}` : r.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
