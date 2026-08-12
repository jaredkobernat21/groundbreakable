import type { Competitor } from "@/lib/types";

export default function CompetitorList({ competitors }: { competitors: Competitor[] }) {
  if (competitors.length === 0) {
    return (
      <p className="text-sm text-white/40">
        No competitor activity logged yet for this market.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {competitors.map((c) => (
        <li key={c.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="font-medium text-white">{c.entity_name}</div>
          {c.property_address && (
            <div className="text-sm text-white/50">{c.property_address}</div>
          )}
          <div className="mt-1 flex gap-3 text-xs text-white/40">
            {c.purchase_date && <span>{c.purchase_date}</span>}
            {c.purchase_price != null && (
              <span>${c.purchase_price.toLocaleString()}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
