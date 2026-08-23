import Link from "next/link";
import type { GblLeadWithProperty } from "@/lib/leads/types";
import { formatDate } from "@/lib/format";
import ScoreBadge from "./ScoreBadge";
import PipelineStatusSelect from "./PipelineStatusSelect";

export default function PipelineCard({ lead }: { lead: GblLeadWithProperty }) {
  return (
    <div className="rounded-xl border border-[#1c1c1c]/10 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <ScoreBadge score={lead.score} size="sm" />
        <div className="min-w-0 flex-1">
          <Link href={`/leads/${lead.id}`} className="block truncate text-sm font-medium text-[#1c1c1c] hover:underline">
            {lead.owner_name}
          </Link>
          <p className="truncate text-xs text-[#1c1c1c]/45">{lead.property.city}, KS</p>
        </div>
      </div>
      <p className="mb-2 text-xs text-[#1c1c1c]/40">
        Last contact: {lead.last_contacted_at ? formatDate(lead.last_contacted_at.slice(0, 10)) : "Never"}
        {lead.next_follow_up ? ` · Follow up ${formatDate(lead.next_follow_up)}` : ""}
      </p>
      <PipelineStatusSelect leadId={lead.id} status={lead.pipeline_status} />
    </div>
  );
}
