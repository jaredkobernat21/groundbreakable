import { PIPELINE_STATUS_LABEL, type PipelineStatus } from "@/lib/leads/types";

const TONE: Record<PipelineStatus, string> = {
  discovered: "bg-[#1c1c1c]/5 text-[#1c1c1c]/60",
  qualified: "bg-[#1c1c1c]/5 text-[#1c1c1c]/60",
  ready_to_contact: "bg-[#B08D57]/15 text-[#8a6a3d]",
  contacted: "bg-blue-50 text-blue-700",
  interested: "bg-emerald-50 text-emerald-700",
  build_plan: "bg-emerald-100 text-emerald-800",
  customer: "bg-[#1c1c1c] text-white",
  not_a_fit: "bg-[#1c1c1c]/5 text-[#1c1c1c]/35",
  do_not_contact: "bg-red-50 text-red-700",
};

export default function StatusPill({ status }: { status: PipelineStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONE[status]}`}>
      {PIPELINE_STATUS_LABEL[status]}
    </span>
  );
}
