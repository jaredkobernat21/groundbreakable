-- Lead-capture submissions from the public marketing site's "Request
-- Access" form (groundbreakable.com). Fully separate from `leads` (which
-- holds property-owner records for investors) -- this is people asking to
-- become Groundbreakable users.

create table access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 200),
  work_email text not null check (work_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  primary_market text check (char_length(primary_market) <= 200),
  created_at timestamptz not null default now()
);

alter table access_requests enable row level security;

-- The marketing site is unauthenticated, so submissions come in as the
-- anon role. Insert-only: anon can add a row but never read, update, or
-- delete one back -- reviewing submissions is a service-role/admin task
-- (Supabase dashboard or a future admin tool), not something the public
-- site itself needs.
create policy "access_requests_insert_public" on access_requests
  for insert to anon with check (true);
