-- SLADE Phase 1: buy boxes. Structured developer/investor acquisition
-- criteria, never buried in slade_contacts.notes. Column shape follows the
-- pattern already proven in opportunity_profiles (explicit typed columns
-- for known criteria, not one jsonb blob) -- see SLADE/DATA_MODEL.md's
-- tradeoff note for why.

create table slade_buy_boxes (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references slade_contacts (id) on delete cascade,
  organization_id uuid references slade_organizations (id) on delete set null,

  name text not null default 'Primary',
  active boolean not null default true,

  -- Geography. target_market_ids is a loose array of markets.id -- same
  -- convention as opportunity_profiles.target_market_ids -- deliberately
  -- not a join table at this scale (a handful of markets per buy box).
  -- target_markets covers markets worth tracking for this client that
  -- aren't in `markets` yet.
  target_markets text[] not null default '{}',
  target_market_ids uuid[] not null default '{}',

  asset_types text[] not null default '{}',
  min_acres numeric,
  max_acres numeric,
  min_price numeric,
  max_price numeric,

  preferred_deal_types text[] not null default '{}',
  preferred_distress_signals text[] not null default '{}',
  zoning_preferences text[] not null default '{}',
  entitlement_preferences text,
  excluded_uses text[] not null default '{}',

  requires_sewer boolean,
  requires_water boolean,
  requires_highway_access boolean,
  requires_rail_access boolean,

  notes text,
  source text,
  last_verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table slade_buy_boxes enable row level security;
create policy "slade_buy_boxes_admin_all" on slade_buy_boxes
  for all using (public.is_admin()) with check (public.is_admin());

create index slade_buy_boxes_contact_idx on slade_buy_boxes (contact_id);
create index slade_buy_boxes_active_idx on slade_buy_boxes (active) where active = true;
