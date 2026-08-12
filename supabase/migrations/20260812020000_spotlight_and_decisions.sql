-- Adds two pieces to support the Home dashboard's News / Catalyst
-- Spotlight / Upcoming Decisions sections:
--
-- 1. catalysts.is_spotlight -- Catalyst Spotlight is a single, editorially
--    curated pick ("the one development most likely to move this market"),
--    not something derivable from existing fields. A partial unique index
--    enforces at most one spotlight per market at the database level, so
--    the app doesn't have to defend against two rows both being marked at
--    once (the admin action always unsets any prior spotlight in the same
--    transaction, but the index is the real guarantee).
--
-- 2. upcoming_decisions -- genuinely new concept, not covered by
--    project_updates (which logs what already happened, not what's
--    scheduled). Same source discipline as projects/catalysts/opportunities:
--    admin-only writes, cites a source when one exists, market-scoped read
--    access.
--
-- News itself (Recent Activity / New Opportunities headlines) needs no
-- schema -- it's read directly off project_updates (already an append-only
-- log of admin-made changes) and opportunities (already timestamped), both
-- of which populate automatically as admins do their normal curation work.

alter table catalysts add column is_spotlight boolean not null default false;

create unique index catalysts_one_spotlight_per_market
  on catalysts (market_id)
  where is_spotlight;

create table upcoming_decisions (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  project_id uuid references projects (id) on delete set null, -- optional link, e.g. the rezoning vote for a specific pipeline project

  title text not null, -- e.g. "Rezoning vote: 4200 SW Topeka Blvd (R-1 to C-2)"
  decision_type text not null check (
    decision_type in ('planning_commission', 'rezoning_vote', 'city_council', 'zoning_board', 'public_hearing', 'other')
  ),
  description text,
  decision_date date not null,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'decided', 'postponed', 'cancelled')
  ),
  outcome text, -- filled in once status moves to 'decided', e.g. "Approved 5-2"

  source_id uuid references sources (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table upcoming_decisions enable row level security;

create policy "upcoming_decisions_select_with_access" on upcoming_decisions
  for select using (public.has_market_access(market_id));
create policy "upcoming_decisions_write_admin" on upcoming_decisions
  for all using (public.is_admin()) with check (public.is_admin());

create index upcoming_decisions_market_date_idx on upcoming_decisions (market_id, decision_date);
