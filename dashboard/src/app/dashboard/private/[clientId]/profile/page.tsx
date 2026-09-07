import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPrivateClient, getActiveAcquisitionProfile } from "@/lib/queries/privateClients";
import {
  ACQUISITION_DEVELOPMENT_STAGE_LABEL,
  ACQUISITION_PROPERTY_TYPE_LABEL,
  ACQUISITION_STRATEGIC_PREFERENCE_LABEL,
  PRIVATE_CLIENT_STATUS_LABEL,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-[#1c1c1c]/10 bg-white p-5 shadow-sm";
const labelClass = "text-xs uppercase tracking-wide text-[#1c1c1c]/40";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <div className={labelClass}>{label}</div>
      <div className="text-sm text-[#1c1c1c]/80">{value}</div>
    </div>
  );
}

function Pills({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div>
      <div className={labelClass}>{label}</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="rounded-full bg-[#1c1c1c]/5 px-2.5 py-1 text-xs text-[#1c1c1c]/70">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function PrivateClientProfilePage({ params }: { params: { clientId: string } }) {
  const supabase = createClient();
  const client = await getPrivateClient(supabase, params.clientId);
  if (!client) notFound();
  const profile = getActiveAcquisitionProfile(client);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/dashboard/private/${client.id}`} className="text-xs text-[#1c1c1c]/40 hover:text-[#1c1c1c]">
            ← Private Brief
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1c1c1c]">{client.full_name}</h1>
          <p className="text-sm text-[#1c1c1c]/50">{PRIVATE_CLIENT_STATUS_LABEL[client.status]}</p>
        </div>
        <Link
          href={`/dashboard/admin/private-clients/${client.id}`}
          className="rounded-full border border-[#1c1c1c]/15 px-3 py-1.5 text-xs text-[#1c1c1c]/60 hover:border-[#1c1c1c]/30"
        >
          Edit in Admin →
        </Link>
      </div>

      <section className={cardClass}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">Private Client Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" value={client.title} />
          <Field label="Company" value={client.company} />
          <Field label="Location" value={client.location} />
          <Field label="Company Size" value={client.company_size} />
          <Field label="Email" value={client.email} />
          <Field label="Phone" value={client.phone} />
          <Field label="LinkedIn" value={client.linkedin_url} />
          <Field label="Website" value={client.website} />
          <Field label="Estimated Project Scale" value={client.estimated_project_scale} />
          <Field label="Deployable Capital Indicator" value={client.deployable_capital_estimate} />
          <Pills label="Markets Active In" values={client.markets_active} />
          <Pills label="Development Type" values={client.development_type} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Expansion Behavior" value={client.expansion_behavior} />
          <Field label="Publicly Stated Preferences" value={client.publicly_stated_preferences} />
          <Field label="Current Projects" value={client.current_projects} />
          <Field label="Known Partners" value={client.known_partners} />
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/50">Acquisition Profile</h2>
        {!profile ? (
          <p className="text-sm text-[#1c1c1c]/50">
            No acquisition profile configured yet.{" "}
            <Link href={`/dashboard/admin/private-clients/${client.id}`} className="underline underline-offset-2">
              Set one up →
            </Link>
          </p>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Pills label="Target States" values={profile.target_states} />
              <Pills label="Target Metros" values={profile.target_metros} />
              <Pills label="Target Cities" values={profile.target_cities} />
              <Pills label="Target Counties" values={profile.target_counties} />
              <Field label="Max Distance From Major City" value={profile.max_distance_major_city_mi != null ? `${profile.max_distance_major_city_mi} mi` : null} />
              <Field label="Max Distance From Interstate" value={profile.max_distance_interstate_mi != null ? `${profile.max_distance_interstate_mi} mi` : null} />
              <Field label="Avoided Geographies" value={profile.avoided_geographies} />
            </div>

            <Pills label="Property Types" values={profile.property_types.map((p) => ACQUISITION_PROPERTY_TYPE_LABEL[p])} />

            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Min Acres" value={profile.min_acres?.toString()} />
              <Field label="Max Acres" value={profile.max_acres?.toString()} />
              <Field label="Min Units" value={profile.min_units?.toString()} />
              <Field label="Max Units" value={profile.max_units?.toString()} />
            </div>

            <Pills label="Development Stages" values={profile.development_stages.map((s) => ACQUISITION_DEVELOPMENT_STAGE_LABEL[s])} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Entitlement Strategy" value={profile.entitlement_strategy} />
              <Field label="Development Strategy" value={profile.development_strategy} />
              <Field label="Max Land Price" value={profile.max_land_price != null ? `$${profile.max_land_price.toLocaleString()}` : null} />
              <Field label="Target IRR" value={profile.target_irr_pct != null ? `${profile.target_irr_pct}%` : null} />
              <Field label="Hold Period" value={profile.hold_period_years != null ? `${profile.hold_period_years} yrs` : null} />
            </div>

            <Pills label="Strategic Preferences" values={profile.strategic_preferences.map((s) => ACQUISITION_STRATEGIC_PREFERENCE_LABEL[s])} />
          </div>
        )}
      </section>
    </div>
  );
}
