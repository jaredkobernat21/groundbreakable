import { activeProvider } from "@/lib/leads/providers/contactEnrichment";

function ConnectorRow({ label, connected, note }: { label: string; connected: boolean; note?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1c1c1c]/5 py-3 last:border-0">
      <div>
        <div className="text-sm font-medium text-[#1c1c1c]/85">{label}</div>
        {note && <div className="text-xs text-[#1c1c1c]/40">{note}</div>}
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          connected ? "bg-emerald-50 text-emerald-700" : "bg-[#1c1c1c]/5 text-[#1c1c1c]/40"
        }`}
      >
        {connected ? "Connected" : "Data source not connected"}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const provider = activeProvider();
  const mapboxConnected = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#1c1c1c]">Settings</h1>
        <p className="text-sm text-[#1c1c1c]/45">Data connectors, saved filters, and compliance notes for this internal tool.</p>
      </div>

      <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
        <h2 className="mb-1 font-serif text-lg font-semibold text-[#1c1c1c]">Data Connectors</h2>
        <p className="mb-3 text-xs text-[#1c1c1c]/40">
          V1 is CSV-import-driven. These connect later without changing the schema — see the provider architecture in
          lib/leads/providers/.
        </p>
        <ConnectorRow label="County assessor / property records" connected={false} note="Currently sourced via CSV import" />
        <ConnectorRow label="Deed / transaction records" connected={false} note="Currently sourced via CSV import" />
        <ConnectorRow label="Building permits" connected={false} note="Entered manually on each lead's Pre-Build Snapshot" />
        <ConnectorRow label="Zoning" connected={false} note="Entered manually via Research or Pre-Build Snapshot" />
        <ConnectorRow label="Mapbox" connected={mapboxConnected} note="Powers the Map view and parcel preview" />
        <ConnectorRow label="Flood data" connected={false} />
        <ConnectorRow label="Utility data" connected={false} />
        <ConnectorRow label="Contact enrichment" connected={provider.name !== "Manual entry"} note={`Active provider: ${provider.name}`} />
      </div>

      <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
        <h2 className="mb-1 font-serif text-lg font-semibold text-[#1c1c1c]">Saved Filter Preset</h2>
        <p className="text-sm text-[#1c1c1c]/70">
          <span className="font-medium">KC South — Build Leads</span>: Spring Hill, Gardner, Olathe, Unincorporated Johnson County ·
          purchased in the last 12 months · no existing residence · individual/couple owner preferred · no detected residential
          building permit.
        </p>
        <p className="mt-2 text-xs text-[#1c1c1c]/40">Applied by default on the Leads dashboard. Adjust anytime from the filter bar.</p>
      </div>

      <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
        <h2 className="mb-1 font-serif text-lg font-semibold text-[#1c1c1c]">Outreach &amp; Compliance</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-[#1c1c1c]/70">
          <li>No automated mass texting or calling — every outreach action here is a manual, individually reviewed touch.</li>
          <li>Every lead supports a Do Not Contact flag with a checked date and notes.</li>
          <li>The Call action on a lead only ever uses a phone number already stored and verified in the system.</li>
        </ul>
      </div>
    </div>
  );
}
