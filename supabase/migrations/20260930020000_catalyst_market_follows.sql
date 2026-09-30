-- Follow/Saved (Jared, 2026-09-30, national map redesign): "Follow this
-- market" and following a specific catalyst, for the new map's
-- Following/Saved panel. Deliberately NOT built on the existing
-- watchlist_items (formerly private_client_watchlist_items) table -- that
-- one is keyed off private_clients, the pre-Sept-2026 CRM concept
-- CLAUDE.md explicitly warns against reintroducing, and its item_type
-- check constraint doesn't even include 'catalyst'. Two small, explicit,
-- additive tables instead, each FK'd directly to investor_profiles(id) --
-- matches this schema's own preference for explicit tables over a shared
-- polymorphic join table.

create table catalyst_follows (
  user_id uuid not null references investor_profiles (id) on delete cascade,
  catalyst_id uuid not null references catalysts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, catalyst_id)
);

create table market_follows (
  user_id uuid not null references investor_profiles (id) on delete cascade,
  market_id uuid not null references markets (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, market_id)
);

alter table catalyst_follows enable row level security;
alter table market_follows enable row level security;

-- Same "user owns their own rows" shape as investor_profiles_update_own,
-- with the admin-bypass sibling already used throughout this schema
-- (investor_profiles_select_own_or_admin). A user only ever needs to
-- write their own follows -- no admin-bypass needed on the write side.
create policy "catalyst_follows_select_own_or_admin" on catalyst_follows
  for select using (user_id = auth.uid() or public.is_admin());
create policy "catalyst_follows_write_own" on catalyst_follows
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "market_follows_select_own_or_admin" on market_follows
  for select using (user_id = auth.uid() or public.is_admin());
create policy "market_follows_write_own" on market_follows
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
