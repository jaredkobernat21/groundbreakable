import { createClient } from "@/lib/supabase/server";
import { queryLeads } from "@/lib/leads/queries";
import LeadsMap from "@/components/leads/LeadsMap";

export const dynamic = "force-dynamic";

export default async function LeadsMapPage() {
  const supabase = createClient();
  const leads = await queryLeads(supabase, { excludeStatuses: ["not_a_fit", "do_not_contact"] });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#1c1c1c]">Map</h1>
        <p className="text-sm text-[#1c1c1c]/45">Spring Hill, Gardner, Olathe, and Johnson County — colored by Groundbreakable Score.</p>
      </div>
      <LeadsMap leads={leads} />
    </div>
  );
}
