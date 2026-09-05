-- Investment: a dedicated table for capital that materially affects
-- development/construction/land value/infrastructure/future buildability
-- (product spec from Jared, 2026-09-05) -- deliberately NOT the same thing
-- as the `business`/`property` shift categories it replaces on the
-- dashboard's Investment tab. Those two shift categories tracked routine
-- business-license/property-assessment activity; this table tracks
-- capital commitments big enough to change what gets built. The handful
-- of existing business/property shifts (e.g. the Spore.Bio lease) don't
-- automatically become investments -- a lease isn't development capital --
-- re-evaluate each one against section 1 of the spec before migrating it
-- over.
--
-- Categorical fields use `text + check` (this project's established
-- pattern for vocabularies expected to keep growing -- see zoning_land_use
-- .confidence, growth_areas.momentum_state, catalysts.status), not a
-- Postgres enum type. This is a brand-new, spec-heavy area of the
-- product; the vocabulary will very likely need real-world adjustment
-- after the first few markets are seeded, and enum types require the
-- rename/recreate/swap dance documented for shift_category (see
-- 20260904120000_recategorize_shift_categories.sql) every time a value
-- needs to change -- not worth that cost here yet.

create table investments (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  project_name text not null,
  project_description text,

  -- The 5 top-level categories from the spec's section 1.
  investment_type text not null check (
    investment_type in (
      'private_development', 'public_capital', 'infrastructure_enabling',
      'incentivized_development', 'institutional_corporate'
    )
  ),
  -- Free text subtype, e.g. 'multifamily', 'sewer_extension', 'tif',
  -- 'manufacturing_facility' -- same shift_type convention as `shifts`.
  asset_type text,

  total_investment_amount numeric,
  public_investment_amount numeric,
  private_investment_amount numeric,
  incentive_amount numeric,
  funding_source text,

  developer_or_investor text,
  public_agency text,

  address text,
  parcel_id text,
  lat double precision,
  lng double precision,
  acreage numeric,
  square_feet numeric,
  residential_units integer,
  jobs_created integer,

  project_status text not null default 'early_signal' check (
    project_status in (
      'early_signal', 'proposed', 'under_review', 'approved', 'funded',
      'permitted', 'under_construction', 'complete', 'delayed', 'cancelled'
    )
  ),
  -- Set by whoever updates the row when project_status changes -- lets a
  -- future refresh pass flag "this just moved from proposed to approved"
  -- without a full status-history table (not worth it yet -- see the
  -- migration header's file comment on scope).
  previous_status text check (
    previous_status in (
      'early_signal', 'proposed', 'under_review', 'approved', 'funded',
      'permitted', 'under_construction', 'complete', 'delayed', 'cancelled'
    )
  ),

  announcement_date date,
  approval_date date,
  funding_date date,
  expected_start_date date,
  expected_completion_date date,

  -- Primary/first source -- required, no exceptions (this table only
  -- exists to tell an investor real capital is really moving; an
  -- unsourced row defeats the entire point). Additional supporting
  -- sources for the same project go in investment_sources below, per
  -- spec section 4 ("one primary Investment record with multiple
  -- supporting sources").
  source_id uuid not null references sources (id) on delete restrict,
  confidence_level text not null default 'low' check (
    confidence_level in ('high', 'medium', 'low')
  ),
  last_verified_date date not null default current_date,

  -- Section 7: impact classification.
  development_impact text not null default 'medium' check (
    development_impact in ('very_high', 'high', 'medium', 'low')
  ),
  primary_impact text[] not null default '{}' check (
    primary_impact <@ array[
      'unlocks_land', 'adds_housing', 'adds_commercial', 'adds_employment',
      'improves_transportation', 'expands_utilities', 'raises_momentum',
      'supports_redevelopment', 'improves_public_realm', 'adds_institutional_demand'
    ]::text[]
  ),

  -- Section 8: geographic impact. `geographic_note` is free text
  -- describing the *actual* affected area in the source's own terms
  -- (e.g. "Iowa St service corridor, 6th to Harvard") -- deliberately not
  -- a computed radius; the spec is explicit that impact area should come
  -- from the real project, not an arbitrary buffer.
  geographic_scope text check (
    geographic_scope in (
      'parcel', 'development_site', 'corridor', 'neighborhood', 'growth_area', 'citywide'
    )
  ),
  geographic_note text,

  -- Section 6: one authored paragraph, not six separate columns for what
  -- the spec's own example already writes as a single paragraph covering
  -- what/committed/why-it-matters/unlock/watch-next. Written by whoever
  -- seeds or verifies the row (a person or Claude doing the research
  -- pass) -- not machine-generated, and it should read that way: plain,
  -- factual, no unsupported prediction (spec section 6's own rule).
  why_it_matters text,

  notes text,

  -- Section 15 change-tracking, minimal version (no full history table
  -- yet -- see previous_status comment above).
  first_seen_date date not null default current_date,
  last_seen_date date not null default current_date,

  created_at timestamptz not null default now()
);

alter table investments enable row level security;

create policy "investments_select_with_access" on investments
  for select using (public.has_market_access(market_id));
create policy "investments_write_admin" on investments
  for all using (public.is_admin()) with check (public.is_admin());

create index investments_market_idx on investments (market_id, announcement_date desc);
create index investments_market_status_idx on investments (market_id, project_status);
create index investments_market_type_idx on investments (market_id, investment_type);

-- Supporting (non-primary) sources for the same investment -- section 4's
-- "one primary record, multiple supporting sources."
create table investment_sources (
  investment_id uuid not null references investments (id) on delete cascade,
  source_id uuid not null references sources (id) on delete cascade,
  primary key (investment_id, source_id)
);

alter table investment_sources enable row level security;

create policy "investment_sources_select_with_access" on investment_sources
  for select using (
    exists (
      select 1 from investments
      where investments.id = investment_sources.investment_id
        and public.has_market_access(investments.market_id)
    )
  );
create policy "investment_sources_write_admin" on investment_sources
  for all using (public.is_admin()) with check (public.is_admin());

-- Section 13 connectivity: link an investment to the specific
-- shifts/projects/zoning_land_use row it corresponds to (e.g. the sewer
-- shift that's also an infrastructure_enabling investment), so the same
-- underlying fact isn't duplicated as unrelated records across tables.
-- Polymorphic on purpose -- three real target tables, not worth three
-- separate nullable FK columns.
create table investment_links (
  investment_id uuid not null references investments (id) on delete cascade,
  linked_table text not null check (linked_table in ('shifts', 'projects', 'zoning_land_use')),
  linked_id uuid not null,
  primary key (investment_id, linked_table, linked_id)
);

alter table investment_links enable row level security;

create policy "investment_links_select_with_access" on investment_links
  for select using (
    exists (
      select 1 from investments
      where investments.id = investment_links.investment_id
        and public.has_market_access(investments.market_id)
    )
  );
create policy "investment_links_write_admin" on investment_links
  for all using (public.is_admin()) with check (public.is_admin());
