-- Refine Catalysts (Jared, 2026-09-30): implements the scoring/history gaps
-- docs/DATA_INTELLIGENCE_PIPELINE.md §6.6/§9/§11 already flagged as missing,
-- plus a granular pre-permit stage pipeline, an "unconfirmed potential data
-- center" investigation sub-model, and a real geography column so compound-
-- catalyst clustering can use PostGIS (ST_DWithin) instead of client-side JS.
-- Additive only -- no drops of data, no renamed columns. Confirmed via a
-- full-codebase sweep that `status`/`catalyst_type` are purely label-lookup
-- rendered everywhere (no component branches on a specific value), so
-- widening their allowed values is safe once dashboard/src/lib/types.ts is
-- kept in sync.

-- Drop the old constraint entirely first (table briefly unconstrained),
-- remap every row that needs it, THEN add the new constraint -- adding a
-- CHECK constraint validates every existing row immediately, and this
-- table has 5 more pre-existing catalysts (Topeka/Lawrence, status
-- 'operating') beyond the 5 created this session, so the constraint can't
-- be re-added until every row already holds a value the new list allows.
alter table catalysts drop constraint catalysts_status_check;

-- Remap the 5 real catalyst rows created this session to the new, more
-- granular vocabulary. 'operating' (5 pre-existing rows) and 'cancelled'
-- need no remap -- both stay valid in the new list as-is.
update catalysts set status = 'planning_entitlement' where title = 'Northeast Sewer Interceptor Phase 1';
update catalysts set status = 'under_study' where title = 'SW Grain Valley Sewer System Extension';
update catalysts set status = 'funding_incentives' where title = 'I-70 / Lefholz Road Interchange (proposed)';
update catalysts set status = 'approved' where title = 'Spring Hill Wastewater Treatment Plant Expansion';
-- Scenic Valley RV Resort stays 'cancelled' -- no change needed.

alter table catalysts add constraint catalysts_status_check check (
  status in (
    'rumored', 'under_study', 'site_selection', 'funding_incentives', 'land_acquired',
    'planning_entitlement', 'approved', 'construction_pending', 'under_construction',
    'operating', 'completed', 'cancelled'
  )
);
-- Detect-before-permits philosophy: a freshly created catalyst should default
-- to the earliest, most conservative claim, not silently imply it's already
-- planned/committed.
alter table catalysts alter column status set default 'rumored';

-- 'potential_data_center' is deliberately distinct from the existing
-- confirmed 'data_center' value -- the whole point of the investigation
-- sub-model below is that these must never be visually or semantically
-- conflated with a confirmed project.
alter table catalysts drop constraint catalysts_catalyst_type_check;
alter table catalysts add constraint catalysts_catalyst_type_check check (
  catalyst_type in (
    'major_employer', 'infrastructure_project', 'institutional', 'public_facility',
    'mixed_use_anchor', 'data_center', 'potential_data_center', 'housing_development',
    'industrial_logistics', 'incentive_district', 'annexation_rezoning', 'other'
  )
);

-- Explainable catalyst scoring (docs/DATA_INTELLIGENCE_PIPELINE.md §6.6/§9) --
-- computed at admin-entry time as a starting suggestion via
-- lib/catalysts/score.ts, stored here as the human-curated final call, same
-- "computed recommendation, human decides" convention as is_spotlight.
alter table catalysts add column catalyst_score int;
alter table catalysts add column reason_for_catalyst_classification text;

-- Potential-data-center investigation fields. signal_categories is a
-- controlled vocabulary (see lib/catalysts/dataCenterSignal.ts) rather than
-- free text, because the confidence tiering needs to count independent
-- evidence categories, not parse prose. Both columns are meaningless/empty
-- for every other catalyst_type.
alter table catalysts add column signal_categories text[] not null default '{}';
alter table catalysts add column signal_confidence text check (
  signal_confidence in ('low', 'medium', 'high', 'very_high')
);

-- Power/load magnitude (Jared's 2026-09-30 clarification, "Priority #1:
-- Detect Large Power Demand Before the Project Is Named") -- a quantified
-- MW figure from a utility/RTO/ISO/regulator source, when one is stated,
-- rather than treating "power" as a plain checkbox. Drives the MW-threshold
-- tiers in computeDataCenterSignalConfidence. Nullable -- most power
-- signals won't have a precise public MW figure, and the function falls
-- back to category-combination logic when this is absent.
alter table catalysts add column power_load_mw numeric;

-- Real point geography, generated directly from the lat/lng columns that
-- already exist -- always in sync, no trigger, no drift possible. Enables
-- ST_DWithin-based compound-catalyst cluster detection (see
-- lib/catalysts/clusters.ts) instead of hand-rolled client-side distance
-- math, per docs/DATA_INTELLIGENCE_PIPELINE.md §7's own recommendation.
alter table catalysts add column geog geography(Point, 4326)
  generated always as (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) stored;
create index catalysts_geog_idx on catalysts using gist (geog);

-- Stage/signal history -- the exact gap docs/DATA_INTELLIGENCE_PIPELINE.md
-- §11 flags ("Catalysts... don't have their own event/history child table
-- today -- a catalyst's status changes currently just overwrite the one
-- status column with no history kept"). Mirrors entitlement_case_events'
-- shape. A catalyst's "date first detected" is its own created_at (or this
-- table's earliest row); "latest update" is this table's most recent row,
-- or last_verified_at if no events exist yet -- both derived, not new flat
-- columns.
create table catalyst_events (
  id uuid primary key default gen_random_uuid(),
  catalyst_id uuid not null references catalysts (id) on delete cascade,

  event_type text not null check (event_type in ('stage_change', 'signal_added', 'source_added', 'note')),
  from_status text,
  to_status text,
  note text,

  source_id uuid references sources (id) on delete set null,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index catalyst_events_catalyst_idx on catalyst_events (catalyst_id, occurred_on);

alter table catalyst_events enable row level security;
create policy "catalyst_events_select_with_access" on catalyst_events
  for select using (
    exists (select 1 from catalysts c where c.id = catalyst_events.catalyst_id and public.has_market_access(c.market_id))
  );
create policy "catalyst_events_write_admin" on catalyst_events
  for all using (public.is_admin()) with check (public.is_admin());
