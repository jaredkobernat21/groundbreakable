import type { GblContact, GblLeadWithProperty } from "@/lib/leads/types";
import LeadCard from "./LeadCard";

export default function TodayBestLeads({ leads, contacts }: { leads: GblLeadWithProperty[]; contacts: GblContact[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1c1c1c]/15 bg-white/60 p-8 text-center text-sm text-[#1c1c1c]/45">
        No qualified leads yet. Import a CSV of land-sale records to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} contacts={contacts} />
      ))}
    </div>
  );
}
