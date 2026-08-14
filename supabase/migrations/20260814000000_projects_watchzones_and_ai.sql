-- Three additions in support of the redesigned dashboard:
--
-- 1. projects.contractor / projects.investor -- parallel to the existing
--    developer column. contractor is nullable by design: a planning-stage
--    project legitimately has no contractor yet, and "not yet assigned" is
--    itself a signal the dashboard surfaces (see ProjectDetailPanel).
--
-- 2. catalysts.boundary -- an optional admin-traced GeoJSON polygon for the
--    catalyst's watch-zone outline, same shape/convention as
--    parcels.boundary. When null, the map keeps deriving a circle from the
--    existing influence_radius_meters (circlePolygon in src/lib/geo.ts), so
--    every existing catalyst keeps rendering without edits.
--
-- 3. opportunity_zones -- green-outlined favorable-zoning *areas*, distinct
--    from the existing point-based `opportunities` (individual properties).
--    Same source-citation discipline and RLS shape as catalysts/
--    opportunities: admin-traced boundary (like a catalyst), not an
--    imported GIS layer -- that stays a future effort pending a real
--    municipal zoning dataset.

alter table projects
  add column contractor text,
  add column investor text;

alter table catalysts
  add column boundary jsonb;

create table opportunity_zones (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  title text not null,
  description text,
  zoning_district text,
  rezoning_notes text,
  boundary jsonb not null, -- geojson polygon/multipolygon in WGS84 -- required, this table exists only to hold polygons

  source_id uuid not null references sources (id) on delete restrict,
  confidence text not null default 'reported' check (
    confidence in ('verified', 'reported', 'unconfirmed')
  ),
  last_verified_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

alter table opportunity_zones enable row level security;

create policy "opportunity_zones_select_with_access" on opportunity_zones
  for select using (public.has_market_access(market_id));
create policy "opportunity_zones_write_admin" on opportunity_zones
  for all using (public.is_admin()) with check (public.is_admin());

create index opportunity_zones_market_idx on opportunity_zones (market_id);
