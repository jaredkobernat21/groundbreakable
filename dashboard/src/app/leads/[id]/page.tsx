import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  GblBuildProject,
  GblContact,
  GblInteraction,
  GblLeadWithProperty,
  GblPropertyIntelligence,
  GblResearch,
} from "@/lib/leads/types";
import { OWNER_TYPE_LABEL } from "@/lib/leads/types";
import ScoreBadge from "@/components/leads/ScoreBadge";
import StatusPill from "@/components/leads/StatusPill";
import PipelineStatusSelect from "@/components/leads/PipelineStatusSelect";
import RecalculateScoreButton from "@/components/leads/RecalculateScoreButton";
import PropertyPanel from "@/components/leads/PropertyPanel";
import WhyThisLead from "@/components/leads/WhyThisLead";
import PreBuildSnapshot from "@/components/leads/PreBuildSnapshot";
import ContactsPanel from "@/components/leads/ContactsPanel";
import OutreachCard from "@/components/leads/OutreachCard";
import ResearchPanel from "@/components/leads/ResearchPanel";
import ActivityTimeline from "@/components/leads/ActivityTimeline";
import BuildPlanPanel from "@/components/leads/BuildPlanPanel";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: lead } = await supabase
    .from("gbl_leads")
    .select("*, property:gbl_properties(*)")
    .eq("id", params.id)
    .maybeSingle<GblLeadWithProperty>();

  if (!lead) notFound();

  const [{ data: intelligence }, { data: contacts }, { data: interactions }, { data: research }, { data: buildProject }] =
    await Promise.all([
      supabase.from("gbl_property_intelligence").select("*").eq("property_id", lead.property_id).maybeSingle<GblPropertyIntelligence>(),
      supabase.from("gbl_contacts").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }).returns<GblContact[]>(),
      supabase.from("gbl_interactions").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }).returns<GblInteraction[]>(),
      supabase.from("gbl_research").select("*").eq("property_id", lead.property_id).order("created_at", { ascending: false }).returns<GblResearch[]>(),
      supabase.from("gbl_build_projects").select("*").eq("lead_id", lead.id).maybeSingle<GblBuildProject>(),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
        <div className="flex items-center gap-4">
          <ScoreBadge score={lead.score} size="lg" />
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#1c1c1c]">{lead.owner_name}</h1>
            <p className="text-sm text-[#1c1c1c]/50">
              {lead.property.address}, {lead.property.city}, {lead.property.state} · {OWNER_TYPE_LABEL[lead.owner_type]}
            </p>
            <RecalculateScoreButton leadId={lead.id} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={lead.pipeline_status} />
          <PipelineStatusSelect leadId={lead.id} status={lead.pipeline_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <WhyThisLead lead={lead} intelligence={intelligence ?? null} />
          <PropertyPanel property={lead.property} />
          <PreBuildSnapshot propertyId={lead.property_id} intelligence={intelligence ?? null} />
          <ResearchPanel propertyId={lead.property_id} research={research ?? []} />
        </div>
        <div className="space-y-6">
          <OutreachCard lead={lead} intelligence={intelligence ?? null} />
          <ContactsPanel lead={lead} contacts={contacts ?? []} />
          <ActivityTimeline lead={lead} interactions={interactions ?? []} />
          <BuildPlanPanel leadId={lead.id} propertyId={lead.property_id} project={buildProject ?? null} />
        </div>
      </div>
    </div>
  );
}
