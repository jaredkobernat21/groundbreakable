-- Entitlement Intelligence: a case-level layer answering "what can a
-- developer realistically get approved here, how hard is the path, how
-- long could it take, what conditions get imposed, what could derail it."
-- None of the existing tables model this today:
--   - `shifts` captures individual entitlement *events* as loosely-typed
--     rows (shift_type free text, raw_data jsonb) with no case number, no
--     vote tally, no requested-vs-approved comparison.
--   - `projects.case_number` (Phase 6) is the only existing structured
--     case identifier anywhere, and it lives on the general project
--     ledger, populated only by regex-extraction from titles.
--   - `project_events` is the closest existing append-only per-record
--     timeline, but event_type is free text with no vote/outcome-delta
--     columns -- the shape this migration's entitlement_case_events
--     borrows directly.
--   - `development_friction_signals` (2026-09-14) is a small,
--     hand-authored market-wide insights table, explicit in its own
--     comment that it exists "because there isn't enough completed-case
--     history yet to derive these patterns automatically" -- this
--     migration is what fills that gap. It stays as-is; nothing here
--     alters it.
-- This sits alongside those tables (loose nullable FKs, same pattern as
-- development_friction_signals' related_project_id/related_shift_id)
-- rather than retrofitting them.

create type entitlement_approval_path as enum ('by_right', 'administrative', 'discretionary', 'rezoning', 'other');
create type entitlement_decision_body as enum ('staff', 'planning_commission', 'city_commission', 'board_of_zoning_appeals', 'county_commission');
create type entitlement_case_status as enum ('pending', 'approved', 'approved_with_conditions', 'denied', 'withdrawn', 'deferred', 'remanded');
create type entitlement_vote_choice as enum ('yes', 'no', 'abstain', 'recuse', 'absent');

-- --- Process map (spec section 1) -----------------------------------------
-- One row per approval type (rezoning, SUP, plat, variance, annexation,
-- ...). Reference data, not per-case -- captures what the published
-- procedure says (code reality), which entitlement_cases below then
-- either confirms or contradicts (entitlement reality).
create table entitlement_approval_types (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  key text not null, -- e.g. 'rezoning', 'special_use_permit', 'preliminary_plat', 'final_plat', 'minor_subdivision', 'administrative_site_plan', 'variance', 'annexation', 'comprehensive_plan_amendment', 'administrative_adjustment', 'appeal_of_administrative_decision', 'floodplain_development_permit'
  label text not null,
  approval_path entitlement_approval_path not null,
  approving_authority entitlement_decision_body not null,
  recommending_authority entitlement_decision_body,

  requires_public_hearing boolean not null default false,
  requires_neighborhood_meeting boolean not null default false,
  notice_requirements text,
  required_documents text[] not null default '{}',
  typical_sequence text,
  published_timeline_days int,
  appeal_path text,
  description text,

  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),

  unique (market_id, key)
);

alter table entitlement_approval_types enable row level security;
create policy "entitlement_approval_types_select_with_access" on entitlement_approval_types
  for select using (public.has_market_access(market_id));
create policy "entitlement_approval_types_write_admin" on entitlement_approval_types
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Cases (spec sections 2 and 3) ------------------------------------------
-- The core record. requested-vs-approved lives directly on one row
-- (proposed_* vs final_*) rather than as a separate table, since every
-- case has exactly one of each -- entitlement_case_changes below is for
-- the itemized per-dimension deltas (units, buffers, access, ...), not
-- the headline numbers.
create table entitlement_cases (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  project_id uuid references projects (id) on delete set null, -- cross-link when this case already has a `projects`/`shifts` row

  case_number text,
  summary text, -- one-paragraph human narrative of the case, same role as shifts.description
  address text,
  parcel_id text,
  acreage numeric,
  latitude double precision,
  longitude double precision,
  planning_area text,
  council_district text,
  surrounding_land_uses text,

  approval_type_id uuid references entitlement_approval_types (id) on delete set null,
  existing_zoning text,
  requested_zoning text,
  land_use_designation text,
  proposed_use text,
  proposed_units int,
  proposed_density numeric,
  proposed_height numeric,
  proposed_commercial_sqft numeric,
  subdivision_layout_summary text,

  staff_recommendation text,
  staff_concerns text[] not null default '{}',
  required_revisions text,

  application_date date,
  first_staff_review_date date,
  planning_commission_hearing_date date,
  city_commission_hearing_date date,
  final_decision_date date,
  ordinance_number text,
  ordinance_adopted_date date,

  status entitlement_case_status not null default 'pending',
  final_units int,
  final_density numeric,
  final_height numeric,
  final_commercial_sqft numeric,

  -- Calculation, not an entered fact: total elapsed entitlement time.
  days_to_decision int generated always as (final_decision_date - application_date) stored,

  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index entitlement_cases_case_number_uidx on entitlement_cases (market_id, case_number) where case_number is not null;
create index entitlement_cases_market_idx on entitlement_cases (market_id, status);
create index entitlement_cases_project_idx on entitlement_cases (project_id) where project_id is not null;
create index entitlement_cases_location_idx on entitlement_cases (market_id, latitude, longitude) where latitude is not null and longitude is not null;

alter table entitlement_cases enable row level security;
create policy "entitlement_cases_select_with_access" on entitlement_cases
  for select using (public.has_market_access(market_id));
create policy "entitlement_cases_write_admin" on entitlement_cases
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Timeline (spec sections 2 PLANNING/CITY COMMISSION, 6) -----------------
-- Same append-only, open-vocabulary shape as project_events.
create table entitlement_case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references entitlement_cases (id) on delete cascade,

  event_type text not null, -- open vocabulary, e.g. 'application_submitted', 'staff_report_published', 'neighborhood_meeting', 'planning_commission_hearing', 'planning_commission_deferral', 'city_commission_hearing', 'city_commission_deferral', 'ordinance_adopted', 'appeal_filed', 'reconsideration', 'final_approval'
  decision_body entitlement_decision_body,
  event_date date not null,
  motion_text text,
  outcome text, -- e.g. 'approved', 'denied', 'deferred', 'recommended_approval', 'recommended_denial', 'tabled', 'withdrawn'
  vote_yes int,
  vote_no int,
  vote_abstain int,
  conditions_summary text,
  note text,

  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  created_at timestamptz not null default now()
);

create index entitlement_case_events_case_idx on entitlement_case_events (case_id, event_date);
create index entitlement_case_events_type_idx on entitlement_case_events (event_type);

alter table entitlement_case_events enable row level security;
create policy "entitlement_case_events_select_with_access" on entitlement_case_events
  for select using (
    exists (select 1 from entitlement_cases c where c.id = entitlement_case_events.case_id and public.has_market_access(c.market_id))
  );
create policy "entitlement_case_events_write_admin" on entitlement_case_events
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Decision-body members (spec section 4) ---------------------------------
-- Persistent registry, independent of any one case, sourced from each
-- body's public roster (e.g. the Planning Commission's CivicWeb member
-- pages, which link each member's individual voting record).
create table entitlement_commissioners (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  full_name text not null,
  decision_body entitlement_decision_body not null,
  appointing_jurisdiction text, -- 'city' or 'county', where the body is a joint city/county appointment
  term_start date,
  term_end date,
  role text, -- 'chair', 'vice_chair', 'member'

  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  created_at timestamptz not null default now()
);

create index entitlement_commissioners_market_idx on entitlement_commissioners (market_id, decision_body);

alter table entitlement_commissioners enable row level security;
create policy "entitlement_commissioners_select_with_access" on entitlement_commissioners
  for select using (public.has_market_access(market_id));
create policy "entitlement_commissioners_write_admin" on entitlement_commissioners
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Individual votes (spec section 4) --------------------------------------
-- What makes decision-body profiles ("14 comparable cases: 10 approve /
-- 2 deny / 2 defer") a query instead of a re-research task, once
-- populated -- one row per commissioner per hearing.
create table entitlement_case_votes (
  id uuid primary key default gen_random_uuid(),
  case_event_id uuid not null references entitlement_case_events (id) on delete cascade,
  commissioner_id uuid not null references entitlement_commissioners (id) on delete cascade,

  vote entitlement_vote_choice not null,
  comments text,

  source_id uuid references sources (id) on delete set null,
  created_at timestamptz not null default now(),

  unique (case_event_id, commissioner_id)
);

create index entitlement_case_votes_commissioner_idx on entitlement_case_votes (commissioner_id);

alter table entitlement_case_votes enable row level security;
create policy "entitlement_case_votes_select_with_access" on entitlement_case_votes
  for select using (
    exists (
      select 1 from entitlement_case_events e
      join entitlement_cases c on c.id = e.case_id
      where e.id = entitlement_case_votes.case_event_id and public.has_market_access(c.market_id)
    )
  );
create policy "entitlement_case_votes_write_admin" on entitlement_case_votes
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Requested vs approved deltas (spec section 3) --------------------------
-- Itemized per-dimension changes. The headline requested/approved numbers
-- (units, density, height, commercial sqft) live directly on
-- entitlement_cases as proposed_*/final_*; this table is for everything
-- else a case can be asked to change (buffers, access, open space, ...).
create table entitlement_case_changes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references entitlement_cases (id) on delete cascade,

  dimension text not null check (dimension in (
    'units', 'density', 'height', 'setbacks', 'buffers', 'road_connections', 'access',
    'open_space', 'parking', 'architecture', 'land_use_mix', 'infrastructure_obligation', 'other'
  )),
  requested_value text,
  approved_value text,
  change_summary text,

  source_id uuid references sources (id) on delete set null,
  created_at timestamptz not null default now()
);

create index entitlement_case_changes_case_idx on entitlement_case_changes (case_id);

alter table entitlement_case_changes enable row level security;
create policy "entitlement_case_changes_select_with_access" on entitlement_case_changes
  for select using (
    exists (select 1 from entitlement_cases c where c.id = entitlement_case_changes.case_id and public.has_market_access(c.market_id))
  );
create policy "entitlement_case_changes_write_admin" on entitlement_case_changes
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Conditions of approval (spec sections 5 and 10) ------------------------
create table entitlement_case_conditions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references entitlement_cases (id) on delete cascade,

  imposed_by entitlement_decision_body,
  condition_text text not null,
  category text check (category in ('infrastructure', 'design', 'traffic', 'buffer', 'stormwater', 'other')),

  source_id uuid references sources (id) on delete set null,
  created_at timestamptz not null default now()
);

create index entitlement_case_conditions_case_idx on entitlement_case_conditions (case_id);

alter table entitlement_case_conditions enable row level security;
create policy "entitlement_case_conditions_select_with_access" on entitlement_case_conditions
  for select using (
    exists (select 1 from entitlement_cases c where c.id = entitlement_case_conditions.case_id and public.has_market_access(c.market_id))
  );
create policy "entitlement_case_conditions_write_admin" on entitlement_case_conditions
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Public comment (spec section 2 PUBLIC RESPONSE) ------------------------
-- Documented statements only -- commenter_description is a role, never a
-- name, and statement_summary must paraphrase the public record, never
-- infer motive, ideology, or attitude (product principle, spec section 2).
create table entitlement_public_comments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references entitlement_cases (id) on delete cascade,
  meeting_event_id uuid references entitlement_case_events (id) on delete set null,

  category text not null check (category in (
    'traffic', 'density', 'height', 'compatibility', 'parking', 'drainage',
    'schools', 'environmental', 'property_values', 'access', 'infrastructure', 'other'
  )),
  commenter_description text, -- role only, e.g. "adjacent property owner" -- never a name or inferred attitude
  statement_summary text not null,

  source_id uuid references sources (id) on delete set null,
  created_at timestamptz not null default now()
);

create index entitlement_public_comments_case_idx on entitlement_public_comments (case_id, category);

alter table entitlement_public_comments enable row level security;
create policy "entitlement_public_comments_select_with_access" on entitlement_public_comments
  for select using (
    exists (select 1 from entitlement_cases c where c.id = entitlement_public_comments.case_id and public.has_market_access(c.market_id))
  );
create policy "entitlement_public_comments_write_admin" on entitlement_public_comments
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Case parties (spec section 2 APPLICANT) --------------------------------
-- Deliberately separate from project_people: that table's role vocab is
-- a binary developer/contractor split (2026-09-05, built for a different
-- shape of data) -- widening it to fit applicant/landowner/engineer/
-- planner/attorney would force other markets' existing rows through a
-- vocabulary they weren't written for. A dedicated table costs nothing
-- and touches nothing else.
create table entitlement_case_parties (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references entitlement_cases (id) on delete cascade,

  role text not null check (role in ('applicant', 'developer', 'landowner', 'engineer', 'planner', 'attorney', 'other')),
  person_name text,
  company_name text,

  source_id uuid references sources (id) on delete set null,
  created_at timestamptz not null default now(),

  constraint entitlement_case_parties_has_a_name check (person_name is not null or company_name is not null)
);

create index entitlement_case_parties_case_idx on entitlement_case_parties (case_id);

alter table entitlement_case_parties enable row level security;
create policy "entitlement_case_parties_select_with_access" on entitlement_case_parties
  for select using (
    exists (select 1 from entitlement_cases c where c.id = entitlement_case_parties.case_id and public.has_market_access(c.market_id))
  );
create policy "entitlement_case_parties_write_admin" on entitlement_case_parties
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Entitlement Reality Score cache (spec section 9) -----------------------
-- The score is computed application-side from a weighted read across
-- entitlement_cases, zoning_land_use, development_friction_signals, and
-- growth_areas -- cheaper to compute on demand and cache here than to
-- maintain as a SQL view. subject_ref is a parcel id, project id, or a
-- free-text description of a hypothetical scenario (the tool also has to
-- answer "what if" questions with no existing parcel/project row).
create table entitlement_reality_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  subject_type text not null check (subject_type in ('parcel', 'project', 'scenario')),
  subject_ref text not null,

  score int not null check (score between 0 and 100),
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  component_breakdown jsonb not null, -- the 8 weighted components, each with its sub-score and evidence pointers
  missing_information text[] not null default '{}',

  generated_at timestamptz not null default now()
);

create index entitlement_reality_score_snapshots_subject_idx on entitlement_reality_score_snapshots (market_id, subject_type, subject_ref, generated_at desc);

alter table entitlement_reality_score_snapshots enable row level security;
create policy "entitlement_reality_score_snapshots_select_with_access" on entitlement_reality_score_snapshots
  for select using (public.has_market_access(market_id));
create policy "entitlement_reality_score_snapshots_write_admin" on entitlement_reality_score_snapshots
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Matching primitive for the collection pipeline -------------------------
-- Same shape as match_projects_by_text (Phase 6): admin/service-role
-- only, used by the intake pipeline to dedupe a scraped item against
-- cases already on file.
create or replace function public.match_entitlement_cases_by_text(p_market_id uuid, p_query text, p_limit int default 5)
returns table(id uuid, case_number text, address text, similarity real)
language sql
stable
set search_path = public, extensions, pg_catalog -- pg_trgm's similarity() isn't resolvable via this role's default search_path otherwise
as $$
  select id, case_number, address, similarity(coalesce(case_number, '') || ' ' || coalesce(address, ''), p_query) as similarity
  from entitlement_cases
  where market_id = p_market_id
  order by similarity desc
  limit p_limit;
$$;

revoke all on function public.match_entitlement_cases_by_text(uuid, text, int) from public;
grant execute on function public.match_entitlement_cases_by_text(uuid, text, int) to service_role;
