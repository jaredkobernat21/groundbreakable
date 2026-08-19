-- Development Profile submissions from the public marketing site's
-- "Show me where to look" intake flow (groundbreakable.com/get-started.html).
-- Separate from `access_requests` (people asking to become Groundbreakable
-- users) -- this is prospective clients describing how they develop, so we
-- can learn their strategy and follow up with relevant intelligence.

create table development_profiles (
  id uuid primary key default gen_random_uuid(),

  -- "What do you develop?" -- multi-select
  develop_types text[] not null check (array_length(develop_types, 1) >= 1),

  -- "Where do you currently develop?" -- free text; nullable when the
  -- respondent is only open to new markets (see open_to_new_markets).
  current_markets text check (char_length(current_markets) <= 300),
  open_to_new_markets boolean not null default false,

  -- "What makes an area attractive to you?" -- free text
  area_attractive text not null check (char_length(area_attractive) <= 2000),

  -- "What typically makes a site work for you?" -- free text
  site_criteria text not null check (char_length(site_criteria) <= 2000),

  -- "What would be most valuable for Groundbreakable to uncover?" -- multi-select
  uncover_priorities text[] not null check (array_length(uncover_priorities, 1) >= 1),

  -- "Where should we send your intelligence?"
  full_name text not null check (char_length(full_name) between 1 and 200),
  company text not null check (char_length(company) between 1 and 200),
  work_email text not null check (work_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (char_length(phone) <= 40),

  created_at timestamptz not null default now(),

  constraint development_profiles_markets_or_open
    check (current_markets is not null or open_to_new_markets)
);

alter table development_profiles enable row level security;

-- The marketing site is unauthenticated, so submissions come in as the
-- anon role. Insert-only: anon can add a row but never read, update, or
-- delete one back -- reviewing submissions is a service-role/admin task,
-- not something the public site itself needs.
create policy "development_profiles_insert_public" on development_profiles
  for insert to anon with check (true);
