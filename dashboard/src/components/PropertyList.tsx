import type { Property } from "@/lib/types";

const STATUS_LABEL: Record<Property["status"], string> = {
  owned: "Owned",
  target: "Target",
  watchlist: "Watchlist",
};

export default function PropertyList({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return (
      <p className="text-sm text-white/40">
        No properties tracked yet — owned, targeted, or watchlisted properties will
        show up here.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {properties.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <div>
            <div className="font-medium text-white">{p.address}</div>
            {p.price != null && (
              <div className="text-xs text-white/40">${p.price.toLocaleString()}</div>
            )}
          </div>
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">
            {STATUS_LABEL[p.status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
