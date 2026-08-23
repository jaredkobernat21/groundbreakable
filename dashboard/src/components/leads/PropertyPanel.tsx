import type { GblProperty } from "@/lib/leads/types";
import { PROPERTY_TYPE_LABEL } from "@/lib/leads/types";
import { formatCurrency, formatDate } from "@/lib/format";

const row = "flex items-center justify-between border-b border-[#1c1c1c]/5 py-2 text-sm last:border-0";
const labelCls = "text-[#1c1c1c]/45";
const valueCls = "font-medium text-[#1c1c1c]/85";

function Fact({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className={row}>
      <span className={labelCls}>{label}</span>
      <span className={valueCls}>{value ?? "Unknown"}</span>
    </div>
  );
}

function MapPreview({ property }: { property: GblProperty }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || property.latitude == null || property.longitude == null) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[#1c1c1c]/15 bg-[#F7F6F2] text-xs text-[#1c1c1c]/35">
        {!token ? "Map data source not connected" : "No coordinates on file for this parcel"}
      </div>
    );
  }
  const src = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s+B08D57(${property.longitude},${property.latitude})/${property.longitude},${property.latitude},14,0/560x220@2x?access_token=${token}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`Map of ${property.address}`} className="h-40 w-full rounded-xl border border-[#1c1c1c]/10 object-cover" />
  );
}

export default function PropertyPanel({ property }: { property: GblProperty }) {
  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
      <h2 className="mb-3 font-serif text-lg font-semibold text-[#1c1c1c]">Property</h2>
      <div className="mb-4">
        <MapPreview property={property} />
      </div>
      <Fact label="Parcel ID" value={property.parcel_id} />
      <Fact label="Address" value={property.address} />
      <Fact label="City" value={property.city} />
      <Fact label="County" value={property.county} />
      <Fact label="Jurisdiction" value={property.jurisdiction} />
      <Fact label="Acreage" value={property.acreage} />
      <Fact label="Sale date" value={formatDate(property.sale_date)} />
      <Fact label="Sale price" value={formatCurrency(property.sale_price)} />
      <Fact label="Assessed value" value={formatCurrency(property.assessed_value)} />
      <Fact label="Land classification" value={property.land_classification} />
      <Fact label="Zoning" value={property.zoning} />
      <Fact label="Property type" value={property.property_type ? PROPERTY_TYPE_LABEL[property.property_type] : null} />
      <Fact label="Existing structure" value={property.existing_structure === null ? null : property.existing_structure ? "Yes" : "No"} />
    </div>
  );
}
