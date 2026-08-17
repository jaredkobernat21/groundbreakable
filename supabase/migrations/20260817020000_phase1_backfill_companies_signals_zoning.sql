-- Phase 1 continued: backfills companies/project_parties from the
-- existing developer/contractor/investor text columns, signals from
-- opportunities.signals[], and zoning_land_use from opportunity_zones.
-- Also adds PostGIS geometry to parcels. Source columns
-- (projects.developer etc., opportunities.signals, opportunity_zones.*)
-- are left untouched -- nothing is dropped in this migration.

-- --- Companies & project_parties, from projects.developer ---------------
-- Checked against the real data first: 30 distinct developer values, 0
-- contractor and 0 investor values currently populated, so this backfill
-- only has developer rows to create. contractor/investor stay covered by
-- the project_parties.role vocabulary (builder_gc / owner) for when that
-- data starts arriving via Phase 2's updated admin form.
--
-- Some developer values are compound/messy free text (e.g. "Clock Tower
-- LLC (Jim Klausman); seller Sunflower Development Group"). Deliberately
-- not parsed or split here -- inventing structure that isn't already
-- explicit in the source would be exactly the kind of fabrication the
-- product principle warns against. One companies row per distinct raw
-- string, verbatim; cleanup is a future curation pass, not a migration.

insert into companies (name)
select distinct developer from projects where developer is not null;

insert into project_parties (project_id, company_id, role)
select p.id, c.id, 'developer'
from projects p
join companies c on c.name = p.developer
where p.developer is not null;

-- --- Signals, from opportunities.signals[] --------------------------------
-- One row per element instead of one array per property -- see the
-- schema note in the prior migration. parcel_id stays null throughout
-- (opportunities never carried a parcel_id); resolved_date stays null,
-- i.e. every existing signal is treated as still active as of cutover.

insert into signals (market_id, opportunity_id, address, latitude, longitude, signal_type, detected_date, source_id, confidence, created_at)
select o.market_id, o.id, o.address, o.latitude, o.longitude, unnest(o.signals), o.date_identified, o.source_id, o.confidence, o.created_at
from opportunities o;

-- --- Zoning/land use, from opportunity_zones ------------------------------
-- All 3 existing rows are real, sourced, verified Polygon geometry from
-- the City of Topeka's own GIS layer (see the seed migration) --
-- ST_Multi wraps them into the MultiPolygon column type without altering
-- a single coordinate.

insert into zoning_land_use (market_id, layer_type, title, description, district_code, regulatory_notes, geom, source_id, confidence, last_verified_at, created_at)
select
  market_id,
  'current_zoning',
  title,
  description,
  zoning_district,
  rezoning_notes,
  ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(boundary::text), 4326)),
  source_id,
  confidence,
  last_verified_at,
  created_at
from opportunity_zones;

-- --- Parcels: add real geometry -------------------------------------------
-- parcels has 0 rows in production today, so there's nothing to backfill
-- -- this just adds the column + spatial index + a sync trigger so any
-- future insert/update that sets the existing `boundary` jsonb column
-- automatically gets a matching PostGIS geometry, without requiring the
-- (currently nonexistent) parcels admin UI to be rewritten first.

alter table parcels add column geom geometry(MultiPolygon, 4326);
create index parcels_geom_idx on parcels using gist (geom);

create or replace function public.sync_parcel_geom()
returns trigger
language plpgsql
as $$
begin
  if new.boundary is not null then
    new.geom := ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(new.boundary::text), 4326));
  end if;
  return new;
end;
$$;

create trigger parcels_sync_geom
  before insert or update on parcels
  for each row execute procedure public.sync_parcel_geom();
