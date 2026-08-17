-- Phase 1 continued: separates category/type/stage on `projects` (today
-- projects.category conflates plan-category and development-type in one
-- six-value enum, with no project_type column at all -- see architecture
-- review Problem 2), and generalizes project_updates into project_events
-- (same append-only shape, but able to carry any kind of event, not just
-- a status change).
--
-- All three new projects columns stay NULLABLE. The existing admin
-- "create signal" action still inserts rows without setting them --
-- rewiring that form is Phase 2 (dashboard app), not this migration. A
-- not-null constraint here would break production inserts today.
--
-- project_updates is untouched and keeps working exactly as it does now
-- -- the dashboard still reads it until Phase 2 cuts over. A trigger
-- mirrors every new project_updates row into project_events so the new
-- table doesn't go stale in the meantime.

alter table projects
  add column plan_category text check (plan_category in ('development', 'land_use', 'infrastructure', 'public_investment')),
  add column project_type text check (project_type in (
    'residential', 'multifamily', 'commercial', 'retail', 'industrial', 'mixed_use', 'public', 'infrastructure', 'other'
  )),
  add column stage text check (stage in ('proposed', 'review_planning', 'approved', 'permitting', 'construction', 'complete'));

create index projects_plan_category_idx on projects (market_id, plan_category);
create index projects_stage_idx on projects (market_id, stage);

-- Backfill plan_category from the existing category enum. Mapping
-- reviewed against the real Topeka data (47 rows, 6 distinct category
-- values) before writing this -- every existing value maps cleanly.
update projects set plan_category = case category
  when 'active_development' then 'development'
  when 'business_announcement' then 'development'
  when 'land_transaction' then 'development'
  when 'planning_entitlement' then 'land_use'
  when 'zoning' then 'land_use'
  when 'infrastructure' then 'infrastructure'
end;

-- Backfill stage from the existing status enum (10 values -> 6-step
-- rollup). on_hold/cancelled don't fit the linear progression and stay
-- null -- resolveActivityPhase() already excludes them from every phase
-- view today, so this doesn't change what's shown anywhere.
update projects set stage = case status
  when 'proposed' then 'proposed'
  when 'planning_review' then 'review_planning'
  when 'filed' then 'review_planning'
  when 'under_review' then 'review_planning'
  when 'approved' then 'approved'
  when 'permitted' then 'permitting'
  when 'under_construction' then 'construction'
  when 'completed' then 'complete'
  else null -- on_hold, cancelled
end;

-- project_type intentionally NOT backfilled. subcategory is free text
-- (checked against the real data: "Affordable multifamily", "rezoning
-- M-2 to D-1 Downtown District", "senior living cottages", ...) with no
-- reliable controlled-vocabulary signal to map from without guessing.
-- Per the product principle "never fabricate missing information,"
-- project_type stays null on every existing row until a human (or a
-- future collection agent) states it explicitly.

-- --- project_events -------------------------------------------------------

create table project_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  event_type text not null, -- open vocabulary, same precedent as projects.subcategory -- e.g. 'rezoning_submitted', 'planning_commission_recommended', 'council_approved', 'permit_issued', 'funding_approved'
  status text check (status in (
    'proposed', 'planning_review', 'filed', 'under_review', 'approved', 'permitted', 'under_construction', 'completed', 'on_hold', 'cancelled'
  )), -- set only when this event corresponds to a stage-relevant status change; many events (funding approved, a hearing held) aren't one
  note text,
  amount numeric, -- for public-investment-flavored events: funding approved, bond issued, etc.
  funding_source text, -- e.g. 'CIP', 'TIF', 'CID', 'bond', 'grant'
  occurred_on date not null default current_date,
  source_id uuid references sources (id) on delete set null,
  confidence text not null default 'reported' check (confidence in ('verified', 'reported', 'unconfirmed')),
  source_quality text check (source_quality in ('primary_government', 'official_company', 'secondary')),
  verification_status text not null default 'human_reviewed' check (verification_status in ('automated', 'human_reviewed', 'verified')),
  is_interpretation boolean not null default false,
  interpretation_basis text, -- required in spirit (not enforced) whenever is_interpretation is true: explains what the interpretation is derived from
  created_by uuid references investor_profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index project_events_project_idx on project_events (project_id, occurred_on);
create index project_events_type_idx on project_events (event_type);

alter table project_events enable row level security;

create policy "project_events_select_with_access" on project_events
  for select using (
    exists (select 1 from projects p where p.id = project_events.project_id and public.has_market_access(p.market_id))
  );
create policy "project_events_write_admin" on project_events
  for all using (public.is_admin()) with check (public.is_admin());

-- Backfill: every existing project_updates row becomes a project_events
-- row. event_type is set to the literal status (the only thing
-- project_updates ever recorded) -- Phase 2's admin UI is what starts
-- writing richer event_type values going forward.
insert into project_events (project_id, event_type, status, note, occurred_on, source_id, verification_status, created_at)
select project_id, status, status, note, occurred_on, source_id, 'human_reviewed', created_at
from project_updates;

-- Keep project_events current between now and Phase 2's app cutover:
-- every new project_updates row (still the only thing the live admin UI
-- writes to) mirrors into project_events automatically, so the new table
-- never falls behind the old one.
create or replace function public.mirror_project_update_to_event()
returns trigger
language plpgsql
as $$
begin
  insert into project_events (project_id, event_type, status, note, occurred_on, source_id, created_by, verification_status)
  values (new.project_id, new.status, new.status, new.note, new.occurred_on, new.source_id, new.created_by, 'human_reviewed');
  return new;
end;
$$;

create trigger project_updates_mirror_to_events
  after insert on project_updates
  for each row execute procedure public.mirror_project_update_to_event();
