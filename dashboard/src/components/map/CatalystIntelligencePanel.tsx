"use client";

import { useEffect, useState } from "react";
import type { CatalystEvent, CatalystWithSources } from "@/lib/types";
import { CATALYST_STATUS_LABEL, CATALYST_TYPE_LABEL } from "@/lib/types";
import { formatCurrency, formatRelativeVerified } from "@/lib/format";
import {
  catalystColorHex,
  CATALYST_COLOR_GROUP_LABEL,
  catalystColorGroup,
  catalystImpactRadiusTier,
  IMPACT_RADIUS_TIER_LABEL,
} from "@/lib/catalystTypeColors";
import { createClient } from "@/lib/supabase/client";
import { getCatalystEvents } from "@/lib/queries/catalystEvents";

const CONFIDENCE_LABEL: Record<CatalystWithSources["confidence"], string> = {
  verified: "Verified",
  reported: "Reported",
  unconfirmed: "Unconfirmed",
};

type Tab = "overview" | "timeline" | "sources" | "impact";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "timeline", label: "Timeline" },
  { key: "sources", label: "Sources" },
  { key: "impact", label: "Impact" },
];

function StatBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#EDECE8]">{value}</p>
    </div>
  );
}

// Institutional redesign (Jared, 2026-09-30) -- premium, restrained
// intelligence-panel treatment: deeper translucent surface, quieter
// dividers, a type chip, Fraunces for the title (already loaded app-wide as
// font-serif, no new dependency), compact stat blocks, and tabs (Overview /
// Timeline / Sources / Impact -- "Nearby Opportunities" dropped, confirmed
// with Jared, since this map is deliberately Catalysts-only). Actions are
// Follow + View Source only -- "Create Opportunity Report" skipped, no such
// feature exists.
export default function CatalystIntelligencePanel({
  catalyst,
  isFollowing,
  onToggleFollow,
  onClose,
}: {
  catalyst: CatalystWithSources;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [events, setEvents] = useState<CatalystEvent[] | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    setTab("overview");
    setEvents(null);
  }, [catalyst.id]);

  useEffect(() => {
    if (tab !== "timeline" || events != null || loadingEvents) return;
    setLoadingEvents(true);
    getCatalystEvents(createClient(), catalyst.id)
      .then(setEvents)
      .finally(() => setLoadingEvents(false));
  }, [tab, catalyst.id, events, loadingEvents]);

  const color = catalystColorHex(catalyst);
  const sources = [catalyst.source, ...catalyst.additionalSources].filter((s): s is NonNullable<typeof s> => s != null);
  const isUnconfirmed = catalyst.confidence === "unconfirmed" || catalyst.catalyst_type === "potential_data_center";

  return (
    <div className="absolute right-3 top-3 bottom-3 z-30 w-[400px] max-w-[calc(100%-1.5rem)] overflow-hidden rounded-xl border border-white/[0.07] bg-[#0E0F12]/90 shadow-2xl backdrop-blur-2xl">
      <div className="flex h-full flex-col">
        <div className="shrink-0 px-6 pb-4 pt-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]"
              style={{ borderColor: `${color}40`, color, backgroundColor: `${color}14` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
              {CATALYST_COLOR_GROUP_LABEL[catalystColorGroup(catalyst)]}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="text-[#7A7E87] transition hover:text-[#EDECE8]">
              ✕
            </button>
          </div>

          <h2 className="font-serif text-xl font-medium leading-snug tracking-tight text-[#EDECE8]">{catalyst.title}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#9096A0]">
            <span>{CATALYST_TYPE_LABEL[catalyst.catalyst_type]}</span>
            <span className="text-[#43464D]">·</span>
            <span>{CATALYST_STATUS_LABEL[catalyst.status]}</span>
          </div>
          {catalyst.address && <div className="mt-1 text-[13px] text-[#6B6F78]">{catalyst.address}</div>}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] ${
                isUnconfirmed ? "border-white/10 text-[#9096A0]" : "border-white/10 text-[#9096A0]"
              }`}
              style={isUnconfirmed ? { borderStyle: "dashed" } : undefined}
            >
              {CONFIDENCE_LABEL[catalyst.confidence]}
            </span>
            {catalyst.catalyst_score != null && (
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[#9096A0]">
                Impact {catalyst.catalyst_score}/10
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-white/[0.06] px-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative px-1 pb-2.5 text-[13px] font-medium transition ${
                tab === t.key ? "text-[#EDECE8]" : "text-[#6B6F78] hover:text-[#9096A0]"
              }`}
            >
              {t.label}
              {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-[1.5px]" style={{ backgroundColor: color }} />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <StatBlock label="Investment" value={formatCurrency(catalyst.estimated_value)} />
                <StatBlock label="Scale" value={catalyst.estimated_scale_note} />
                <StatBlock label="Stage" value={CATALYST_STATUS_LABEL[catalyst.status]} />
                <StatBlock label="Timeline" value={catalyst.expected_timeline} />
              </div>

              {catalyst.why_it_matters && (
                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Why It Matters</p>
                  <p className="text-[13.5px] leading-relaxed text-[#C7C9CE]">{catalyst.why_it_matters}</p>
                </div>
              )}

              {catalyst.description && (
                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Description</p>
                  <p className="text-[13.5px] leading-relaxed text-[#C7C9CE]">{catalyst.description}</p>
                </div>
              )}

              {catalyst.related_context.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#7A7E87]">Detected Signals</p>
                  <ul className="space-y-1.5">
                    {catalyst.related_context.map((item, i) => (
                      <li key={i} className="flex gap-2 text-[13px] text-[#B0B3BA]">
                        <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === "timeline" && (
            <div className="space-y-4">
              {loadingEvents && <p className="text-[13px] text-[#6B6F78]">Loading…</p>}
              {!loadingEvents && events && events.length > 0 && (
                <ul className="space-y-4">
                  {events.map((e) => (
                    <li key={e.id} className="border-l border-white/[0.08] pl-3">
                      <p className="text-[11px] text-[#6B6F78]">{new Date(e.occurred_on).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                      <p className="mt-0.5 text-[13px] text-[#C7C9CE]">
                        {e.from_status && e.to_status
                          ? `${CATALYST_STATUS_LABEL[e.from_status] ?? e.from_status} → ${CATALYST_STATUS_LABEL[e.to_status] ?? e.to_status}`
                          : e.note ?? e.event_type}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {!loadingEvents && events && events.length === 0 && (
                <ul className="space-y-4">
                  <li className="border-l border-white/[0.08] pl-3">
                    <p className="text-[11px] text-[#6B6F78]">{new Date(catalyst.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                    <p className="mt-0.5 text-[13px] text-[#C7C9CE]">First detected</p>
                  </li>
                  <li className="border-l border-white/[0.08] pl-3">
                    <p className="text-[11px] text-[#6B6F78]">{formatRelativeVerified(catalyst.last_verified_at)}</p>
                    <p className="mt-0.5 text-[13px] text-[#C7C9CE]">Last verified</p>
                  </li>
                </ul>
              )}
            </div>
          )}

          {tab === "sources" && (
            <div className="space-y-2">
              {sources.length === 0 && <p className="text-[13px] text-[#6B6F78]">No sources on file.</p>}
              {sources.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition hover:border-white/[0.12]"
                >
                  <p className="text-[13px] font-medium text-[#EDECE8]">{source.agency}</p>
                  {source.title && <p className="mt-0.5 text-[12px] text-[#9096A0]">{source.title}</p>}
                </a>
              ))}
            </div>
          )}

          {tab === "impact" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <StatBlock label="Impact Tier" value={IMPACT_RADIUS_TIER_LABEL[catalystImpactRadiusTier(catalyst)]} />
                <StatBlock label="Radius" value={`${(catalyst.influence_radius_meters / 1609.34).toFixed(1)} mi`} />
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#6B6F78]">
                <span className="h-1.5 w-1.5 rounded-full border border-dashed" style={{ borderColor: color }} />
                Impact area shown on map as concentric rings around this marker.
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t border-white/[0.06] px-6 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleFollow}
              className={`flex-1 rounded-md px-3 py-2 text-[13px] font-medium transition ${
                isFollowing ? "bg-white/[0.06] text-[#EDECE8] hover:bg-white/[0.1]" : "bg-[#EDECE8] text-[#0E0F12] hover:bg-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            {sources[0] && (
              <a
                href={sources[0].url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex-1 rounded-md border border-white/[0.1] px-3 py-2 text-center text-[13px] font-medium text-[#C7C9CE] transition hover:border-white/20 hover:text-[#EDECE8]"
              >
                View Source
              </a>
            )}
          </div>
          <p className="text-[11px] text-[#6B6F78]">Last verified {formatRelativeVerified(catalyst.last_verified_at)}</p>
        </div>
      </div>
    </div>
  );
}
