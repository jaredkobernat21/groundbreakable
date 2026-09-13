-- Groundbreakable Private: the premium-tier layer built on top of the
-- existing shift/opportunity/investment/growth-area data (product spec
-- from Jared, 2026-09-07). This is a prospecting CRM for wealthy private
-- developer/investor principals (section 3 of the spec) AND, once a
-- prospect is onboarded with real dashboard access, the source of the
-- configurable acquisition criteria that personalize everything else
-- they see (section 4) -- one table, two lifecycle stages, distinguished
-- by `status` and by whether `investor_profile_id` is set.
--
-- Follows the investments migration's established conventions: text +
-- check for vocabularies still likely to change, RLS via has_market_access
-- /is_admin, scores computed/derived rather than trigger-maintained where
-- the components are objective, but here the five score components
-- (spec section 2's 25/25/25/15/10 breakdown) require human research
-- judgment the way gbl_leads.score does, not just a count of joined rows
-- like Investment Momentum -- so they're stored, analyst-entered columns,
-- with the 0-100 total computed in app code (see lib/privateClientScoring.ts)
-- rather than persisted, so the weighting can be revised without a
-- migration.

create table private_clients (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  company text,
  title text,
  location text,

  -- Section 2's accessibility criteria -- public contact paths only.
  email text,
  phone text,
  linkedin_url text,
  website text,
  source_links text[] not null default '{}',

  company_size text,
  markets_active text[] not null default '{}',
  estimated_project_scale text,
  development_type text[] not null default '{}',
  land_heavy boolean,
  entitlement_heavy boolean,
  expansion_behavior text,
  likely_acquisition_criteria text,
  deployable_capital_estimate text,
  publicly_stated_preferences text,
  current_projects text,
  relevant_municipal_filings text,
  known_partners text,

  -- Prospecting-CRM lifecycle (section 3) through to an onboarded paying
  -- account (section 12's Private tier). `investor_profile_id` is only
  -- set once someone actually gets dashboard login access -- see
  -- properties.investor_id for the existing per-account-owned-row
  -- precedent this follows.
  status text not null default 'prospect' check (
    status in ('prospect', 'contacted', 'qualified', 'onboarded', 'active', 'inactive')
  ),
  investor_profile_id uuid references investor_profiles (id) on delete set null,

  -- Section 2's 0-100 Groundbreakable Private Client Score, broken into
  -- its four weighted components (Geographic Fit is derived from
  -- acquisition_profiles.target_market_ids at read time, not stored here
  -- -- see lib/privateClientScoring.ts).
  score_wealth int check (score_wealth between 0 and 25),
  score_activity int check (score_activity between 0 and 25),
  score_intel_value int check (score_intel_value between 0 and 25),
  score_accessibility int check (score_accessibility between 0 and 15),
  score_reasoning text,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index private_clients_investor_profile_idx on private_clients (investor_profile_id) where investor_profile_id is not null;

alter table private_clients enable row level security;

create policy "private_clients_select_own_or_admin" on private_clients
  for select using (public.is_admin() or investor_profile_id = auth.uid());
create policy "private_clients_write_admin" on private_clients
  for all using (public.is_admin()) with check (public.is_admin());

-- Section 4: the configurable Acquisition Profile. One-to-many (not
-- one-to-one) so a principal running two distinct strategies (e.g. a
-- personal land-banking play and a separate multifamily development arm)
-- gets two profiles rather than one row straining to hold both --
-- `is_active` marks which one currently drives personalization when a
-- client has more than one.
create table acquisition_profiles (
  id uuid primary key default gen_random_uuid(),
  private_client_id uuid not null references private_clients (id) on delete cascade,
  profile_name text not null default 'Primary',
  is_active boolean not null default true,

  -- Geography
  target_states text[] not null default '{}',
  target_metros text[] not null default '{}',
  target_cities text[] not null default '{}',
  target_counties text[] not null default '{}',
  -- Loose references (no FK -- same polymorphic-array convention as
  -- investment_links.linked_id) into the markets/growth_areas Groundbreakable
  -- actually tracks, so match scoring can check these cheaply without a
  -- text comparison against target_cities/target_metros.
  target_market_ids uuid[] not null default '{}',
  target_corridor_ids uuid[] not null default '{}',
  avoided_geographies text,
  max_distance_major_city_mi numeric,
  max_distance_interstate_mi numeric,

  -- Property type / size
  property_types text[] not null default '{}' check (
    property_types <@ array[
      'raw_land', 'farmland', 'residential_land', 'multifamily', 'industrial_land',
      'commercial_land', 'mixed_use', 'infill', 'redevelopment', 'mobile_home_park',
      'self_storage', 'retail', 'office', 'hospitality'
    ]::text[]
  ),
  min_acres numeric,
  max_acres numeric,
  min_units int,
  max_units int,
  min_buildable_sqft numeric,

  -- Development stage / zoning
  development_stages text[] not null default '{}' check (
    development_stages <@ array[
      'raw_land', 'pre_entitlement', 'early_entitlement', 'rezoning_required',
      'entitled', 'partially_developed', 'shovel_ready'
    ]::text[]
  ),
  preferred_zoning text[] not null default '{}',
  acceptable_zoning text[] not null default '{}',
  rezoning_tolerance text,
  density_requirements text,
  future_land_use_preference text,

  -- Infrastructure requirements
  requires_sewer boolean,
  requires_water boolean,
  requires_electric_capacity boolean,
  requires_road_access boolean,
  requires_highway_access boolean,
  max_interchange_distance_mi numeric,
  requires_rail_access boolean,
  requires_fiber_access boolean,

  -- Growth signals this client's strategy is most sensitive to (section
  -- 4's "Growth Signals" block) -- drives which shift categories/types
  -- weight most heavily in the Client Match Score.
  population_growth_threshold_pct numeric,
  watches_job_growth boolean not null default false,
  watches_employer_announcements boolean not null default false,
  watches_housing_shortage boolean not null default false,
  watches_new_schools boolean not null default false,
  watches_road_investment boolean not null default false,
  watches_utility_expansion boolean not null default false,
  watches_annexation boolean not null default false,
  watches_capital_improvements boolean not null default false,
  watches_municipal_incentives boolean not null default false,

  -- Financial
  max_land_price numeric,
  target_price_per_acre numeric,
  target_price_per_unit numeric,
  target_irr_pct numeric,
  hold_period_years numeric,
  entitlement_strategy text,
  development_strategy text,

  strategic_preferences text[] not null default '{}' check (
    strategic_preferences <@ array[
      'buy_and_hold', 'entitle_and_sell', 'develop_infrastructure', 'build_vertical',
      'sell_lots_to_builders', 'joint_venture', 'opportunity_zone', 'tif_incentive'
    ]::text[]
  ),

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index acquisition_profiles_client_idx on acquisition_profiles (private_client_id);

alter table acquisition_profiles enable row level security;

create policy "acquisition_profiles_select_own_or_admin" on acquisition_profiles
  for select using (
    exists (
      select 1 from private_clients
      where private_clients.id = acquisition_profiles.private_client_id
        and (public.is_admin() or private_clients.investor_profile_id = auth.uid())
    )
  );
create policy "acquisition_profiles_write_admin" on acquisition_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- Section 7/8: Watchlist. Polymorphic on purpose, same convention as
-- project_people.related_record_type/id -- a watchlist spans markets,
-- corridors (growth_areas), development_opportunities, shifts, and
-- investments, and isn't worth five separate join tables at this stage.
-- `label` is a cached display string (set at insert time) so the
-- watchlist page can render a list without a per-row lookup across five
-- different tables.
create table private_client_watchlist_items (
  id uuid primary key default gen_random_uuid(),
  private_client_id uuid not null references private_clients (id) on delete cascade,
  item_type text not null check (item_type in ('market', 'corridor', 'opportunity', 'shift', 'investment')),
  item_id uuid not null,
  label text not null,
  note text,
  added_at timestamptz not null default now(),
  unique (private_client_id, item_type, item_id)
);

alter table private_client_watchlist_items enable row level security;

create policy "watchlist_select_own_or_admin" on private_client_watchlist_items
  for select using (
    exists (
      select 1 from private_clients
      where private_clients.id = private_client_watchlist_items.private_client_id
        and (public.is_admin() or private_clients.investor_profile_id = auth.uid())
    )
  );
create policy "watchlist_write_own_or_admin" on private_client_watchlist_items
  for all using (
    exists (
      select 1 from private_clients
      where private_clients.id = private_client_watchlist_items.private_client_id
        and (public.is_admin() or private_clients.investor_profile_id = auth.uid())
    )
  ) with check (
    exists (
      select 1 from private_clients
      where private_clients.id = private_client_watchlist_items.private_client_id
        and (public.is_admin() or private_clients.investor_profile_id = auth.uid())
    )
  );

-- Section 11: the recurring Private Brief. Snapshotted (not just
-- computed live on every page load) so "Changes Since Last Brief" has
-- something concrete to diff against -- `match_snapshot` holds the top
-- match ids+scores at generation time for that diff; the eight prose
-- fields mirror the spec's eight brief sections directly (Top Signal
-- through Groundbreakable Take), one paragraph each, same "authored
-- paragraph over structured columns" philosophy as investments.why_it_matters.
create table private_briefs (
  id uuid primary key default gen_random_uuid(),
  private_client_id uuid not null references private_clients (id) on delete cascade,
  generated_at timestamptz not null default now(),

  top_signal_summary text,
  emerging_markets_summary text,
  corridor_watch_summary text,
  acquisition_matches_summary text,
  city_decisions_summary text,
  changes_since_last_summary text,
  risks_summary text,
  groundbreakable_take text,

  match_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index private_briefs_client_idx on private_briefs (private_client_id, generated_at desc);

alter table private_briefs enable row level security;

create policy "private_briefs_select_own_or_admin" on private_briefs
  for select using (
    exists (
      select 1 from private_clients
      where private_clients.id = private_briefs.private_client_id
        and (public.is_admin() or private_clients.investor_profile_id = auth.uid())
    )
  );
create policy "private_briefs_write_admin" on private_briefs
  for all using (public.is_admin()) with check (public.is_admin());

-- Section 7: Corridor Intelligence reuses growth_areas rather than a
-- parallel table -- it already has market scoping, a name, momentum
-- state, geometry, and an editorial narrative (see the Phase 1 migration
-- comment: "Groundbreakable's own synthesis across evidence"). These two
-- columns add the two pieces the spec calls for that growth_areas didn't
-- already have: a short thesis statement and a catalyst timeline.
alter table growth_areas add column thesis text;
alter table growth_areas add column catalyst_timeline jsonb not null default '[]'::jsonb;
-- catalyst_timeline shape: [{ "year": "2025", "label": "comprehensive plan identifies southwest growth", "status": "occurred" | "planned" }]
