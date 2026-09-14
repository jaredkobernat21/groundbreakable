import type { DevelopmentFrictionSignalWithSource, FrictionKind } from "@/lib/types";
import DevelopmentFrictionCard from "./DevelopmentFrictionCard";

const KIND_LABEL: Record<FrictionKind, string> = {
  timeline: "How Long Things Are Taking",
  risk: "Biggest Holdups & Risks",
  context: "Market Context",
};

const KIND_ORDER: FrictionKind[] = ["timeline", "risk", "context"];

// Answers the two questions a developer actually asks about a market --
// "how long is this taking" and "what's likely to hold it up" -- plus a
// context bucket for market-wide dynamics that are neither. Grouped by
// kind rather than one flat list so the two questions stay visually
// separate; "context" only renders a header when there's something in it.
export default function DevelopmentFrictionSection({ signals }: { signals: DevelopmentFrictionSignalWithSource[] }) {
  if (signals.length === 0) {
    return (
      <p className="rounded-xl border border-[#1c1c1c]/10 bg-white p-4 text-sm text-[#1c1c1c]/40">
        No development timeline or risk research on file for this market yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {KIND_ORDER.map((kind) => {
        const kindSignals = signals.filter((s) => s.kind === kind);
        if (kindSignals.length === 0) return null;

        return (
          <div key={kind}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#1c1c1c]/40">{KIND_LABEL[kind]}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {kindSignals.map((signal) => (
                <DevelopmentFrictionCard key={signal.id} signal={signal} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
