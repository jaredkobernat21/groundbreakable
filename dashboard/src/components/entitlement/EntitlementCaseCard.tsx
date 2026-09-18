import Link from "next/link";
import type { EntitlementCaseWithSource } from "@/lib/types";
import { ENTITLEMENT_CASE_STATUS_COLOR, ENTITLEMENT_CASE_STATUS_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";

// Same card anatomy as DevelopmentFrictionCard (title/badge, a headline
// figure, a summary paragraph, a confidence+source footer) so the two
// sourced-signal card types read as one system on the dashboard.
export default function EntitlementCaseCard({ entitlementCase, marketSlug }: { entitlementCase: EntitlementCaseWithSource; marketSlug: string }) {
  const heading = entitlementCase.case_number
    ? `${entitlementCase.case_number} — ${entitlementCase.address ?? "Address not on file"}`
    : entitlementCase.address ?? "Untitled case";

  const card = (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-[#1c1c1c]">{heading}</p>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
          style={{ backgroundColor: ENTITLEMENT_CASE_STATUS_COLOR[entitlementCase.status] }}
        >
          {ENTITLEMENT_CASE_STATUS_LABEL[entitlementCase.status]}
        </span>
      </div>

      <p className="mt-1 text-xs text-[#1c1c1c]/50">
        {entitlementCase.acreage != null ? `${entitlementCase.acreage} ac` : null}
        {entitlementCase.proposed_use ? `${entitlementCase.acreage != null ? " · " : ""}${entitlementCase.proposed_use}` : null}
      </p>

      {entitlementCase.summary && <p className="mt-2 text-sm leading-relaxed text-[#1c1c1c]/70">{entitlementCase.summary}</p>}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-[#1c1c1c]/10 pt-2 text-[11px] text-[#1c1c1c]/50">
        {entitlementCase.planning_commission_hearing_date && <span>PC {formatDate(entitlementCase.planning_commission_hearing_date)}</span>}
        {entitlementCase.city_commission_hearing_date && <span>CC {formatDate(entitlementCase.city_commission_hearing_date)}</span>}
        {entitlementCase.days_to_decision != null && <span>{entitlementCase.days_to_decision} days to decision</span>}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[#1c1c1c]/40">
        <span>
          {entitlementCase.confidence === "verified" ? "Verified" : entitlementCase.confidence === "reported" ? "Reported" : "Unconfirmed"}
        </span>
        {entitlementCase.source && (
          <a
            href={entitlementCase.source.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 truncate underline decoration-[#1c1c1c]/30 underline-offset-2 hover:decoration-[#1c1c1c]"
          >
            {entitlementCase.source.agency}
          </a>
        )}
      </div>
    </div>
  );

  if (!entitlementCase.project_id) return card;

  return (
    <Link href={`/dashboard/projects/${entitlementCase.project_id}?market=${marketSlug}`} className="block hover:opacity-90">
      {card}
    </Link>
  );
}
