-- Evidence-based developer/contractor directory. Distinct from the old
-- Phase 1 `companies`/`project_parties` tables (2026-08-17): those only
-- link to `projects` (not `shifts`, so a permit or rezoning shift has no
-- home there), only store a company (no person name), and use a 5-way
-- role enum instead of the binary Developer/Contractor split Jared asked
-- for here -- reusing them would mean forcing this data through a shape
-- that doesn't fit. `related_record_id` intentionally has no FK
-- constraint: it points at either `projects.id` or `shifts.id` depending
-- on `related_record_type`, and Postgres has no polymorphic FK -- the
-- app resolves it, same "denormalized label + loose id" pattern as
-- growth_areas' momentum breakdown resolving shifts/projects by
-- pointInPolygon rather than a join table.
create table project_people (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,

  person_name text,
  company_name text,
  role text not null check (role in ('developer', 'contractor')),

  related_record_type text not null check (related_record_type in ('project', 'shift')),
  related_record_id uuid not null,
  related_label text not null, -- denormalized "Project Title — address" for display without a join

  source_id uuid references sources (id) on delete set null,
  event_date date,
  confidence text not null check (confidence in ('confirmed', 'likely')),
  evidence_note text, -- why this role/confidence, esp. when the source names an "applicant"/"owner" rather than literally "developer"

  created_at timestamptz not null default now(),

  constraint project_people_has_a_name check (person_name is not null or company_name is not null)
);

create index project_people_market_idx on project_people (market_id);
create index project_people_related_idx on project_people (related_record_type, related_record_id);

alter table project_people enable row level security;

create policy "project_people_select_with_access" on project_people
  for select using (public.has_market_access(market_id));
create policy "project_people_write_admin" on project_people
  for all using (public.is_admin()) with check (public.is_admin());
