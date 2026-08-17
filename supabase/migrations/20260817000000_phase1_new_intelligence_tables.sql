-- Phase 1 of the Plans/Potential restructure (see architecture review, Aug
-- 17 2026). Purely additive: new extensions, new tables, RLS wired to the
-- existing is_admin()/has_market_access() functions. Nothing existing is
-- altered or dropped in this file -- projects/opportunities/catalysts/
-- opportunity_zones/etc. keep working exactly as they do today. Backfill
-- from those tables into the new ones happens in the migrations that
-- follow this one.
--
-- Two concepts going forward: Plans (projects + project_events, next
-- migration) and Potential (growth_areas + potential_sites + signals +
-- site_constraints, this file). companies/project_parties normalize the
-- developer/contractor/investor free text that today lives directly on
-- projects. intake_records/intake_review_queue are staging tables for the
-- collection pipeline described in the review -- nothing writes to them
-- yet, they just need to exist before that pipeline is built in a later
-- phase.

create extension if not exists postgis;
create extension if not exists pg_trgm;

-- --- People & Companies -----------------------------------------------
-- Replaces the free-text developer/contractor/investor columns on
-- projects with real rows a name/address/case-number entity-resolution
-- pass can match against. One company can play different roles on
-- different projects (or the same project), so the role lives on
-- project_parties, not on the company itself.

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  notes text,
  created_at timestamptz not null default now()
);

create index companies_name_trgm_idx on companies using gin (name gin_trgm_ops);

create table project_parties (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  role text not null check (role in ('developer', 'builder_gc', 'owner', 'architect_engineer', 'applicant')),
  created_at timestamptz not null default now(),
  unique (project_id, company_id, role)
);

create index project_parties_project_idx on project_parties (project_id);
create index project_parties_company_idx on project_parties (company_id);

alter table companies enable row level security;
alter table project_parties enable row level security;

-- Companies aren't market-scoped (a firm can work across markets) --
-- same "readable by any signed-in user" shape as `sources`.
create policy "companies_select_authenticated" on companies
  for select using (auth.role() = 'authenticated');
create policy "companies_write_admin" on companies
  for all using (public.is_admin()) with check (public.is_admin());

create policy "project_parties_select_with_access" on project_parties
  for select using (
    exists (select 1 from projects p where p.id = project_parties.project_id and public.has_market_access(p.market_id))
  );
create policy "project_parties_write_admin" on project_parties
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Land: parcel assemblage --------------------------------------------
-- A project can span multiple parcels (assemblage); a parcel can be cited
-- by more than one project over its history. Join table, not a FK on
-- either side.

create table project_parcels (
  project_id uuid not null references projects (id) on delete cascade,
  parcel_id uuid not null references parcels (id) on delete cascade,
  primary key (project_id, parcel_id)
);

alter table project_parcels enable row level security;

create policy "project_parcels_select_with_access" on project_parcels
  for select using (
    exists (select 1 from projects p where p.id = project_parcels.project_id and public.has_market_access(p.market_id))
  );
create policy "project_parcels_write_admin" on project_parcels
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Land: zoning & future land use -------------------------------------
-- Generalizes opportunity_zones (which only ever held "favorable current
-- zoning" polygons) into a layered buildability reference: current
-- zoning, future land use, and overlays are the same shape with a
-- discriminator, not three different tables. Real PostGIS geometry
-- (opportunity_zones stored raw GeoJSON in jsonb with no spatial index).

create table zoning_land_use (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  layer_type text not null check (layer_type in ('current_zoning', 'future_land_use', 'overlay')),
  title text not null,
  description text,
  district_code text, -- e.g. "D3", "PUD (R3;M2;OI3;C2)"
  permitted_uses text,
  regulatory_notes text, -- density/height/setback/rezoning-path notes, free text -- no structured density/height data exists in any current source, so this stays one field rather than three speculative empty columns
  geom geometry(MultiPolygon, 4326) not null,
  source_id uuid not null references sources (id) on delete restrict,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index zoning_land_use_market_idx on zoning_land_use (market_id);
create index zoning_land_use_geom_idx on zoning_land_use using gist (geom);

alter table zoning_land_use enable row level security;

create policy "zoning_land_use_select_with_access" on zoning_land_use
  for select using (public.has_market_access(market_id));
create policy "zoning_land_use_write_admin" on zoning_land_use
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Potential: Growth Areas ---------------------------------------------
-- Net new -- no table today represents "a geographic area where multiple
-- development indicators are converging." growth_area_snapshots is
-- append-only so momentum-over-time is reconstructable later (never
-- overwrite momentum_state in place on the parent row's history).

create table growth_areas (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  name text not null,
  momentum_state text not null default 'emerging' check (momentum_state in ('emerging', 'accelerating', 'established')),
  narrative text, -- the "why we're watching" bullets, editorial
  geom geometry(MultiPolygon, 4326) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index growth_areas_market_idx on growth_areas (market_id);
create index growth_areas_geom_idx on growth_areas using gist (geom);

create table growth_area_snapshots (
  id uuid primary key default gen_random_uuid(),
  growth_area_id uuid not null references growth_areas (id) on delete cascade,
  captured_at date not null default current_date,
  momentum_state text not null check (momentum_state in ('emerging', 'accelerating', 'established')),
  active_project_count int,
  recent_rezoning_count int,
  public_investment_total numeric,
  potential_site_count int,
  notes text,
  created_at timestamptz not null default now()
);

create index growth_area_snapshots_area_idx on growth_area_snapshots (growth_area_id, captured_at);

alter table growth_areas enable row level security;
alter table growth_area_snapshots enable row level security;

create policy "growth_areas_select_with_access" on growth_areas
  for select using (public.has_market_access(market_id));
create policy "growth_areas_write_admin" on growth_areas
  for all using (public.is_admin()) with check (public.is_admin());

create policy "growth_area_snapshots_select_with_access" on growth_area_snapshots
  for select using (
    exists (select 1 from growth_areas g where g.id = growth_area_snapshots.growth_area_id and public.has_market_access(g.market_id))
  );
create policy "growth_area_snapshots_write_admin" on growth_area_snapshots
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Potential: Signals ---------------------------------------------------
-- Replaces opportunities.signals text[] with one row per detection.
-- The array couldn't represent a signal disappearing (a lien getting
-- paid off) without silently rewriting it in place; resolved_date here
-- lets that history survive. opportunity_id is a nullable back-reference
-- kept only for traceability during the transition off `opportunities`.

create table signals (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  parcel_id uuid references parcels (id) on delete set null,
  opportunity_id uuid references opportunities (id) on delete set null,
  address text,
  latitude double precision,
  longitude double precision,
  signal_type text not null check (signal_type in (
    'pre_foreclosure', 'tax_lien', 'tax_delinquent', 'absentee_owner', 'high_equity_owner',
    'vacant', 'code_violation', 'listing', 'price_drop', 'underutilized_land', 'zoning_upside',
    'for_sale', 'public_ownership'
  )),
  detected_date date,
  resolved_date date,
  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  created_at timestamptz not null default now()
);

create index signals_market_idx on signals (market_id);
create index signals_market_type_idx on signals (market_id, signal_type);
create index signals_parcel_idx on signals (parcel_id);
create index signals_unresolved_idx on signals (market_id) where resolved_date is null;

alter table signals enable row level security;

create policy "signals_select_with_access" on signals
  for select using (public.has_market_access(market_id));
create policy "signals_write_admin" on signals
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Potential: Sites -----------------------------------------------------
-- Deliberately thin: the thesis layer only. Buildability comes from
-- zoning_land_use, acquisition evidence from signals, physical
-- constraints from site_constraints below -- all referenced, never
-- duplicated onto this row (the failure mode opportunities had).

create table potential_sites (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  growth_area_id uuid references growth_areas (id) on delete set null,
  title text not null,
  address text,
  latitude double precision,
  longitude double precision,
  tier text not null default 'watch' check (tier in ('watch', 'high')),
  development_context text, -- the "why this site" narrative
  status text not null default 'active' check (status in ('active', 'archived')),
  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table potential_site_parcels (
  potential_site_id uuid not null references potential_sites (id) on delete cascade,
  parcel_id uuid not null references parcels (id) on delete cascade,
  primary key (potential_site_id, parcel_id)
);

create index potential_sites_market_idx on potential_sites (market_id);
create index potential_sites_growth_area_idx on potential_sites (growth_area_id);

alter table potential_sites enable row level security;
alter table potential_site_parcels enable row level security;

create policy "potential_sites_select_with_access" on potential_sites
  for select using (public.has_market_access(market_id));
create policy "potential_sites_write_admin" on potential_sites
  for all using (public.is_admin()) with check (public.is_admin());

create policy "potential_site_parcels_select_with_access" on potential_site_parcels
  for select using (
    exists (select 1 from potential_sites s where s.id = potential_site_parcels.potential_site_id and public.has_market_access(s.market_id))
  );
create policy "potential_site_parcels_write_admin" on potential_site_parcels
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Potential: Constraints -------------------------------------------
-- Named site_constraints (not "constraints") to stay well clear of the
-- reserved CONSTRAINT keyword. Attaches to a parcel and/or a curated
-- potential_site -- a constraint can be known about a parcel before
-- anyone has turned it into a Potential Site.

create table site_constraints (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid references parcels (id) on delete cascade,
  potential_site_id uuid references potential_sites (id) on delete cascade,
  constraint_type text not null check (constraint_type in (
    'floodplain', 'environmental', 'easement', 'limited_access', 'utility_constraint', 'restrictive_zoning', 'other'
  )),
  description text,
  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  created_at timestamptz not null default now(),
  check (parcel_id is not null or potential_site_id is not null)
);

create index site_constraints_parcel_idx on site_constraints (parcel_id);
create index site_constraints_potential_site_idx on site_constraints (potential_site_id);

alter table site_constraints enable row level security;

create policy "site_constraints_select_with_access" on site_constraints
  for select using (
    (parcel_id is not null and exists (select 1 from parcels p where p.id = site_constraints.parcel_id and public.has_market_access(p.market_id)))
    or
    (potential_site_id is not null and exists (select 1 from potential_sites s where s.id = site_constraints.potential_site_id and public.has_market_access(s.market_id)))
  );
create policy "site_constraints_write_admin" on site_constraints
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Collection staging ---------------------------------------------------
-- Nothing writes here yet (no collection pipeline exists -- see the
-- architecture review, Section A). These exist now so the pipeline built
-- in a later phase has somewhere to land without another schema change.
-- Admin-only end to end: this is pre-verification raw material, not
-- something an investor should ever see.

create table intake_records (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  raw_payload jsonb not null,
  extracted_title text,
  extracted_plan_category text,
  extracted_project_type text,
  extracted_event_type text,
  extracted_address text,
  extracted_latitude double precision,
  extracted_longitude double precision,
  candidate_project_id uuid references projects (id) on delete set null,
  match_confidence numeric,
  source_id uuid references sources (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'matched', 'created_new', 'rejected')),
  created_at timestamptz not null default now()
);

create table intake_review_queue (
  id uuid primary key default gen_random_uuid(),
  intake_record_id uuid not null references intake_records (id) on delete cascade,
  reason text not null,
  candidate_matches jsonb,
  resolved boolean not null default false,
  resolved_by uuid references investor_profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index intake_records_market_idx on intake_records (market_id);
create index intake_records_status_idx on intake_records (status);
create index intake_review_queue_unresolved_idx on intake_review_queue (resolved) where not resolved;

alter table intake_records enable row level security;
alter table intake_review_queue enable row level security;

create policy "intake_records_admin_only" on intake_records
  for all using (public.is_admin()) with check (public.is_admin());
create policy "intake_review_queue_admin_only" on intake_review_queue
  for all using (public.is_admin()) with check (public.is_admin());
