-- V1 developer account management (Jared, 2026-09-29): closes the gap
-- between the account system that already exists (investor_profiles,
-- investor_markets, is_admin()/has_market_access() already wired into
-- every market-scoped table's RLS) and a real admin UI for onboarding a
-- developer today. Additive only -- no drops, no renames, nothing existing
-- changes behavior.

alter table investor_profiles
  add column first_name text,
  add column last_name text,
  add column company_name text,
  add column status text not null default 'active' check (status in ('active', 'inactive')),
  add column welcomed_at timestamptz;

-- Backfill so existing accounts (including admin) don't get sent through
-- the new first-login welcome screen on their next login -- only genuinely
-- new accounts created after this migration start with welcomed_at null.
update investor_profiles set welcomed_at = created_at where welcomed_at is null;

-- 'investor' kept for existing rows (e.g. 20260908000000_aaron_tulsa_onboarding.sql already
-- writes role='investor') -- new developer accounts created going forward use 'developer'.
-- is_admin() only ever checks role = 'admin', so this is purely additive.
alter table investor_profiles drop constraint investor_profiles_role_check;
alter table investor_profiles add constraint investor_profiles_role_check
  check (role in ('investor', 'admin', 'developer'));

-- Additive alongside the existing investor_profiles_update_own policy --
-- Postgres OR's multiple policies for the same command together, so
-- self-update-own keeps working unchanged. Needed so an admin can edit
-- another user's name/company/status through the app (RLS-enforced, not
-- just hidden in the UI) rather than only via the service-role client.
create policy "investor_profiles_update_admin" on investor_profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- investor_markets currently has only a select policy -- this is the same
-- "_write_admin" pattern already used for every other admin-managed table
-- in this codebase (investments_write_admin, entitlement_cases_write_admin,
-- opportunities_write_admin, etc.), just extended to the one table that was
-- missing it, so assigning/removing a developer's markets is RLS-enforced.
create policy "investor_markets_write_admin" on investor_markets
  for all using (public.is_admin()) with check (public.is_admin());
