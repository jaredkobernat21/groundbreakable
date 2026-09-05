-- New Opportunities feature: properties with multiple overlapping
-- development/redevelopment signals. Deliberately a new table, not the
-- old Phase 1 `opportunities`/`signals` pair -- that pair is entangled
-- with the internal leads CRM (`opportunities.lead_id` references
-- `leads`, and Jared has been explicit this session that the customer-
-- facing dashboard shouldn't touch the internal CRM), is a single-point
-- real-estate-investor-lead model (asking price, resale value) rather
-- than a general redevelopment-signal model, and has no way to express
-- "near a momentum area" or "near a permit/project/investment" -- both
-- concepts postdate that schema. Momentum and Buildability are
-- deliberately NOT columns here: they're computed at read time by
-- testing (latitude, longitude) against growth_areas/zoning_land_use
-- polygons (pointInPolygon), same "single source of truth, no
-- denormalized duplicate" pattern the Momentum tab already uses -- see
-- lib/geo.ts.
create table development_opportunities (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  address text not null,
  latitude double precision not null,
  longitude double precision not null,

  -- A short synthesized label for the overall story (e.g. "Distressed
  -- Property in High-Momentum Corridor") -- free text, not enum-
  -- constrained, same shift_type philosophy: the underlying signal
  -- vocabulary will keep growing as more markets/sources get added.
  opportunity_type text not null,
  strength text not null check (strength in ('high', 'medium', 'low')),

  -- The individual signals that fired (tax_foreclosure, vacant,
  -- code_violation, demolition, favorable_zoning, recent_rezoning,
  -- nearby_infrastructure, ownership_change, parcel_assemblage,
  -- high_momentum, nearby_project, nearby_permit, nearby_investment,
  -- ...). Free text array, not a fixed enum -- new signal types will
  -- keep appearing as more public-record sources get added, same
  -- reasoning as shifts.shift_type.
  signals text[] not null default '{}',
  -- 3-5 sentence-level reasons, one per firing signal, in the same
  -- order as `signals` -- see the "why 3-5 reasons" requirement.
  reasons text[] not null,

  -- Multiple source records, one per underlying signal -- no polymorphic
  -- FK (a signal here can trace back to a shift, a project, or a plain
  -- `sources` row), so this is a loose array of `sources.id`, resolved
  -- by the app rather than enforced by a constraint. Same relaxed-FK
  -- pattern as project_people.related_record_id.
  source_ids uuid[] not null default '{}',

  date_identified date not null default current_date,
  created_at timestamptz not null default now(),

  constraint development_opportunities_reasons_bounded check (array_length(reasons, 1) between 3 and 5)
);

create index development_opportunities_market_idx on development_opportunities (market_id);

alter table development_opportunities enable row level security;

create policy "development_opportunities_select_with_access" on development_opportunities
  for select using (public.has_market_access(market_id));
create policy "development_opportunities_write_admin" on development_opportunities
  for all using (public.is_admin()) with check (public.is_admin());
