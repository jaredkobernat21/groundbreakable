import type { MarketEvent } from "@/lib/types";

const TYPE_LABEL: Record<MarketEvent["type"], string> = {
  development: "Development",
  permit: "Permit",
  infrastructure: "Infrastructure",
  risk: "Risk",
};

export default function EventFeed({ events }: { events: MarketEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-white/40">No market events entered yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id} className="border-b border-white/10 pb-3 last:border-0">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>{TYPE_LABEL[e.type]}</span>
            {e.event_date && <span>· {e.event_date}</span>}
          </div>
          <div className="font-medium text-white">{e.title}</div>
          {e.description && <p className="text-sm text-white/50">{e.description}</p>}
        </li>
      ))}
    </ul>
  );
}
