-- Development Friction (case-level): tracks individual real projects that
-- hit meaningful opposition, delay, denial, withdrawal, or abandonment --
-- a different, complementary concept to `development_friction_signals`
-- (a handful of hand-researched MARKET-WIDE qualitative patterns, e.g.
-- "PC-to-CC votes run ~29 days"). This table is project-level, follows an
-- Original Plan -> Friction -> Response -> Outcome -> Insight framework
-- per case, and is designed to be browsed across every market at once
-- (see dashboard/src/lib/queries/developmentFrictionCases.ts), unlike
-- everything else in this schema which is queried one market at a time.
--
-- Where a case went through Lawrence's formal entitlement process, this
-- table links to its `entitlement_cases` row (`related_entitlement_case_id`)
-- rather than re-entering those facts -- this table adds the narrative/
-- impact/insight layer entitlement_cases doesn't have, it doesn't
-- duplicate the structured zoning/vote facts that table already owns.

create type friction_type as enum (
  'community_opposition',
  'planning_commission',
  'city_council',
  'county_council',
  'moratorium',
  'regulatory_change',
  'lawsuit_appeal',
  'infrastructure_concern',
  'other'
);

create type friction_case_outcome as enum (
  'resolved',
  'modified',
  'delayed',
  'withdrawn',
  'denied',
  'abandoned',
  'pending'
);

create table development_friction_cases (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  project_name text not null,
  address text,
  latitude numeric,
  longitude numeric,
  developer_name text,
  -- Reuses the app's existing ProjectType vocabulary (src/lib/types.ts)
  -- instead of inventing a parallel one.
  project_type text check (
    project_type in ('residential', 'multifamily', 'commercial', 'retail', 'industrial', 'mixed_use', 'public', 'infrastructure', 'other')
  ),

  -- Stage 1: Original Plan
  original_plan_summary text not null,

  -- Stage 2: Friction
  friction_type friction_type not null,
  concerns text[] not null default '{}', -- specific documented objections, one per entry
  decision_makers text[] not null default '{}', -- free text, not entitlement_decision_body: friction spans informal opposition/lawsuits, not just the 5 known formal bodies

  -- Stage 3: Response
  response_summary text,

  -- Stage 4: Outcome
  outcome friction_case_outcome not null default 'pending',
  final_plan_summary text, -- vs. original_plan_summary above; null until known

  -- Friction impact -- each nullable/empty since impact is only ever
  -- captured "when documented" per the product spec, never estimated.
  impact_units_lost int,
  impact_density_reduction text,
  impact_added_conditions text[] not null default '{}',
  impact_time_delay text,
  impact_added_cost_usd numeric,
  impact_project_failed boolean not null default false,

  severity shift_impact,

  -- Stage 5: Insight -- populated by scripts/generateFrictionInsights.ts
  -- (Anthropic SDK, same pattern as src/app/api/ask/route.ts), not
  -- generated live on page render.
  ai_insight text,
  ai_insight_generated_at timestamptz,

  related_project_id uuid references projects (id) on delete set null,
  related_entitlement_case_id uuid references entitlement_cases (id) on delete set null,

  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  created_at timestamptz not null default now()
);

create index development_friction_cases_market_idx on development_friction_cases (market_id);
create index development_friction_cases_outcome_idx on development_friction_cases (outcome);
create index development_friction_cases_friction_type_idx on development_friction_cases (friction_type);

alter table development_friction_cases enable row level security;

create policy "development_friction_cases_select_with_access" on development_friction_cases
  for select using (public.has_market_access(market_id));
create policy "development_friction_cases_write_admin" on development_friction_cases
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Timeline: "key dates and timeline of delays" ---------------------------
create table development_friction_timeline_events (
  id uuid primary key default gen_random_uuid(),
  friction_case_id uuid not null references development_friction_cases (id) on delete cascade,

  event_date date not null,
  description text not null,

  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  created_at timestamptz not null default now()
);

create index development_friction_timeline_events_case_idx on development_friction_timeline_events (friction_case_id, event_date);

alter table development_friction_timeline_events enable row level security;

create policy "development_friction_timeline_events_select_with_access" on development_friction_timeline_events
  for select using (
    exists (
      select 1 from development_friction_cases c
      where c.id = development_friction_timeline_events.friction_case_id and public.has_market_access(c.market_id)
    )
  );
create policy "development_friction_timeline_events_write_admin" on development_friction_timeline_events
  for all using (public.is_admin()) with check (public.is_admin());
