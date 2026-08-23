"use client";

import { useRef } from "react";
import { PIPELINE_STAGES, PIPELINE_STATUS_LABEL, type PipelineStatus } from "@/lib/leads/types";
import { updatePipelineStatus } from "@/app/leads/[id]/actions";

const ALL_STATUSES: PipelineStatus[] = [...PIPELINE_STAGES, "not_a_fit", "do_not_contact"];

export default function PipelineStatusSelect({ leadId, status }: { leadId: string; status: PipelineStatus }) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundAction = updatePipelineStatus.bind(null, leadId);

  return (
    <form ref={formRef} action={boundAction}>
      <select
        name="pipeline_status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-full border border-[#1c1c1c]/15 bg-white px-3 py-1.5 text-sm font-medium text-[#1c1c1c] outline-none focus:border-[#B08D57]"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {PIPELINE_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </form>
  );
}
