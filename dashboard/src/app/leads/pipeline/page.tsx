import { createClient } from "@/lib/supabase/server";
import { queryLeads } from "@/lib/leads/queries";
import { PIPELINE_STAGES, PIPELINE_STATUS_LABEL } from "@/lib/leads/types";
import PipelineCard from "@/components/leads/PipelineCard";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const supabase = createClient();
  const leads = await queryLeads(supabase);

  const byStage = new Map(PIPELINE_STAGES.map((s) => [s, leads.filter((l) => l.pipeline_status === s)]));
  const notAFit = leads.filter((l) => l.pipeline_status === "not_a_fit");
  const dnc = leads.filter((l) => l.pipeline_status === "do_not_contact");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#1c1c1c]">Pipeline</h1>
        <p className="text-sm text-[#1c1c1c]/45">Discovered → Qualified → Ready to Contact → Contacted → Interested → Build Plan → Customer</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = byStage.get(stage) ?? [];
          return (
            <div key={stage} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-[#1c1c1c]/50">{PIPELINE_STATUS_LABEL[stage]}</h2>
                <span className="text-xs text-[#1c1c1c]/30">{stageLeads.length}</span>
              </div>
              <div className="space-y-2">
                {stageLeads.map((lead) => (
                  <PipelineCard key={lead.id} lead={lead} />
                ))}
                {stageLeads.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[#1c1c1c]/10 p-4 text-center text-xs text-[#1c1c1c]/25">Empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(notAFit.length > 0 || dnc.length > 0) && (
        <details className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-4">
          <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">
            Not a Fit ({notAFit.length}) &amp; Do Not Contact ({dnc.length})
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[...notAFit, ...dnc].map((lead) => (
              <PipelineCard key={lead.id} lead={lead} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
