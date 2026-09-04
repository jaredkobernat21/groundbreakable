-- ROQ Shift: a new unified `shifts` table, the source of truth for the
-- market-shift dashboard replacing the old Plans/Opportunities/Potential
-- pillar model at the primary dashboard route. Additive only -- projects,
-- opportunities, signals, growth_areas, zoning_land_use, catalysts are
-- untouched and keep serving Timeline/Projects/admin curation pages.
--
-- `category` is a fixed enum (drives filtering/UI chips/map marker
-- styling). `shift_type` is deliberately free text, not enum-constrained:
-- the six categories are stable, but subtypes will keep growing as new
-- public-record sources get added, and a migration for every new subtype
-- is friction the product doesn't need.

create type shift_category as enum (
  'ownership', 'distress', 'compliance', 'development', 'construction', 'infrastructure'
);

create type shift_impact as enum ('low', 'medium', 'high');

create type shift_audience as enum (
  'agent', 'broker', 'investor', 'contractor', 'developer', 'lender'
);

create table shifts (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  category shift_category not null,
  shift_type text not null,

  event text not null,
  description text,
  event_date date not null,
  stage text,
  impact shift_impact not null default 'medium',
  audience shift_audience[] not null default '{}',

  address text,
  parcel_id text,
  lat double precision,
  lng double precision,

  source_id uuid references sources (id) on delete set null,
  raw_data jsonb,

  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table shifts enable row level security;

create policy "shifts_select_with_access" on shifts
  for select using (public.has_market_access(market_id));
create policy "shifts_write_admin" on shifts
  for all using (public.is_admin()) with check (public.is_admin());

create index shifts_market_date_idx on shifts (market_id, event_date desc);
create index shifts_market_category_idx on shifts (market_id, category);
create index shifts_audience_gin_idx on shifts using gin (audience);
