-- SLADE Phase 1: sites and site facts. A slade_sites row is a permanent
-- record for any property Groundbreakable/LODE has ever looked at,
-- independent of whether it becomes an opportunity -- unknown values are
-- expected (see SLADE/DATA_MODEL.md). slade_site_facts is the provenance/
-- verification layer this whole project's accuracy standard depends on
-- (see SLADE_BIBLE.md's Accuracy section): every fact about a site carries
-- its own verification_status, independently re-checkable over time.

create table slade_sites (
  id uuid primary key default gen_random_uuid(),
  external_id text,

  address text,
  city text,
  county text,
  state text,
  parcel_id text,
  market_id uuid references markets (id) on delete set null,

  latitude double precision,
  longitude double precision,
  acreage numeric,

  owner_name text,
  current_use text,

  listing_status text check (listing_status in ('on_market', 'off_market', 'unknown')),
  listing_price numeric,
  listing_agent text,
  listing_broker text,

  -- The site's own research status -- distinct from any opportunity built
  -- on top of it (an opportunity can be rejected/delivered while the site
  -- record itself stays 'verified' for future reuse against a different
  -- buy box).
  status text not null default 'identified' check (status in ('identified', 'researching', 'verified', 'archived')),

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table slade_sites enable row level security;
create policy "slade_sites_admin_all" on slade_sites
  for all using (public.is_admin()) with check (public.is_admin());

-- parcel_id is the one identifier reliable enough to hard-dedup on.
-- Address/city/state is indexed for fuzzy lookup but not unique -- see
-- dashboard/src/lib/slade/sites.ts's findSiteByParcelOrAddress.
create unique index slade_sites_parcel_unique_idx on slade_sites (parcel_id) where parcel_id is not null;
create index slade_sites_address_idx on slade_sites (lower(address), lower(coalesce(city, '')), lower(coalesce(state, '')));
create index slade_sites_market_idx on slade_sites (market_id);
create index slade_sites_status_idx on slade_sites (status);

create table slade_site_facts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references slade_sites (id) on delete cascade,

  fact_type text not null check (
    fact_type in (
      'zoning', 'future_land_use', 'acreage', 'owner', 'sewer', 'water', 'floodplain',
      'wetlands', 'permitted_uses', 'overlays', 'utilities', 'road_access',
      'entitlement_history', 'other'
    )
  ),
  value text,

  verification_status text not null default 'needs_verification' check (
    verification_status in ('verified', 'inferred', 'needs_verification', 'conflicting', 'stale')
  ),

  -- Reuses the existing sources table when a fact has a real citation.
  -- source_url/source_type are a denormalized fallback for a fact that
  -- doesn't warrant a full sources row (e.g. a quick county GIS lookup) --
  -- source_type here is intentionally free text, not constrained to
  -- sources.source_type's vocabulary, since facts can cite things (a
  -- skip-trace provider, a phone call) that aren't a publication.
  source_id uuid references sources (id) on delete set null,
  source_url text,
  source_type text,
  source_date date,
  checked_at timestamptz,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table slade_site_facts enable row level security;
create policy "slade_site_facts_admin_all" on slade_site_facts
  for all using (public.is_admin()) with check (public.is_admin());

-- A fact_type can repeat per site (re-checked over time) -- the row with
-- the latest checked_at is current; older rows are kept as history, never
-- overwritten. This index supports both "all facts for a site" and
-- "latest fact of a given type" lookups.
create index slade_site_facts_site_idx on slade_site_facts (site_id, fact_type, checked_at desc);
create index slade_site_facts_verification_idx on slade_site_facts (verification_status);
