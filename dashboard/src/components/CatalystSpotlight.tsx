import { CATALYST_STATUS_LABEL, CATALYST_TYPE_LABEL, CATALYSTS_COLOR, type CatalystWithSource } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

// Exactly one catalyst at a time -- the single development most likely to
// move this market -- so it gets a large, spacious card rather than
// competing for space in a list. Deliberately not the same visual weight
// as News/Upcoming Decisions.
export default function CatalystSpotlight({ catalyst }: { catalyst: CatalystWithSource | null }) {
  if (!catalyst) return null;

  const metric = formatCurrency(catalyst.estimated_value);

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/45">Catalyst Spotlight</h2>
      <div className="rounded-2xl border border-[#1c1c1c]/10 bg-[#1c1c1c] px-8 py-10 text-white sm:px-12 sm:py-14">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide" style={{ color: CATALYSTS_COLOR }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATALYSTS_COLOR }} />
          {CATALYST_TYPE_LABEL[catalyst.catalyst_type]}
        </div>
        <h3 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{catalyst.title}</h3>
        {catalyst.description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">{catalyst.description}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/50">
          <span>{CATALYST_STATUS_LABEL[catalyst.status]}</span>
          {catalyst.address && <span>{catalyst.address}</span>}
          {metric && <span className="font-medium text-white/80">{metric}</span>}
          {catalyst.source && (
            <a
              href={catalyst.source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              {catalyst.source.agency}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
