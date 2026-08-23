"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { GblLeadWithProperty } from "@/lib/leads/types";
import { scoreTier } from "@/lib/leads/scoring";

// Johnson County South, KS -- centered roughly between Spring Hill, Gardner,
// and Olathe.
const DEFAULT_CENTER: [number, number] = [-94.87, 38.79];
const DEFAULT_ZOOM = 10.5;

const TONE_COLOR: Record<"high" | "medium" | "low", string> = {
  high: "#1c1c1c",
  medium: "#B08D57",
  low: "#b9b3a6",
};

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function pinSvg(color: string): string {
  return `<svg width="22" height="28" viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg"><path d="M11 0C4.9 0 0 4.9 0 11c0 8.25 11 17 11 17s11-8.75 11-17c0-6.1-4.9-11-11-11z" fill="${color}"/><circle cx="11" cy="11" r="4" fill="white"/></svg>`;
}

export default function LeadsMap({ leads }: { leads: GblLeadWithProperty[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const plottable = leads.filter((l) => l.property.latitude != null && l.property.longitude != null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;
    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;
      mapboxgl.default.accessToken = token;
      const map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;
        plottable.forEach((lead) => {
          const tone = scoreTier(lead.score).tone;
          const color = TONE_COLOR[tone];
          const el = document.createElement("div");
          el.className = "gbl-marker";
          el.innerHTML = `
            <div class="gbl-marker-card">
              <span class="gbl-marker-card-title">${escapeHtml(lead.owner_name)}</span>
              <span class="gbl-marker-card-sub">${escapeHtml(lead.property.address)}</span>
              <span class="gbl-marker-card-score" style="color:${color}">Score ${lead.score}</span>
            </div>
            <div class="gbl-marker-line"></div>
            <div class="gbl-marker-pin">${pinSvg(color)}</div>
          `;
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelectedId(lead.id);
          });
          new mapboxgl.default.Marker({ element: el, anchor: "bottom" })
            .setLngLat([lead.property.longitude!, lead.property.latitude!])
            .addTo(map);
        });
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = plottable.find((l) => l.id === selectedId) ?? null;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-2xl border border-dashed border-[#1c1c1c]/15 bg-white text-sm text-[#1c1c1c]/40">
        Map data source not connected — set NEXT_PUBLIC_MAPBOX_TOKEN.
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={containerRef} className="gbl-map h-[600px] w-full overflow-hidden rounded-2xl border border-[#1c1c1c]/10" />
      {plottable.length < leads.length && (
        <p className="mt-2 text-xs text-[#1c1c1c]/35">
          {leads.length - plottable.length} of {leads.length} leads have no coordinates on file and aren&rsquo;t shown.
        </p>
      )}
      {selected && (
        <div className="absolute right-4 top-4 w-64 rounded-xl border border-[#1c1c1c]/10 bg-white p-4 shadow-lg">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1c1c1c]">{selected.owner_name}</span>
            <button onClick={() => setSelectedId(null)} className="text-xs text-[#1c1c1c]/30 hover:text-[#1c1c1c]">✕</button>
          </div>
          <p className="mb-2 text-xs text-[#1c1c1c]/50">{selected.property.address}</p>
          <div className="mb-3 space-y-0.5 text-xs text-[#1c1c1c]/60">
            <div>Score: {selected.score}</div>
            <div>Acreage: {selected.property.acreage ?? "Unknown"}</div>
            <div>Purchased: {selected.property.sale_date ?? "Unknown"}</div>
          </div>
          <a href={`/leads/${selected.id}`} className="block rounded-full bg-[#1c1c1c] px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-[#1c1c1c]/85">
            View Lead
          </a>
        </div>
      )}
    </div>
  );
}
