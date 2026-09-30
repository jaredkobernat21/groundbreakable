-- All-market access for invited developers (Jared, 2026-09-30): "the
-- invitation link should give access to all markets, even ones I add."
-- A one-time snapshot of checked market boxes at invite-creation time can't
-- satisfy "even ones I add" -- new markets created after a developer signs
-- up would need someone to manually go back and grant access. A live flag
-- on investor_profiles, checked inside has_market_access() alongside the
-- existing per-market investor_markets join, does: any market check for a
-- flagged user passes automatically, including markets that don't exist
-- yet at signup time.
--
-- Default is false, not true -- this only changes behavior for accounts
-- that get it explicitly set (new invitation-created developers, per the
-- application-layer change in invite/inviteFlow.ts). The 11 existing
-- investor_profiles rows (admin + legacy investor-role accounts) keep
-- their current market-scoped behavior unchanged.
alter table investor_profiles add column has_all_market_access boolean not null default false;

create or replace function public.has_market_access(target_market_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin()
    or exists (select 1 from investor_profiles p where p.id = auth.uid() and p.has_all_market_access)
    or exists (
      select 1 from investor_markets im
      where im.investor_id = auth.uid() and im.market_id = target_market_id
    );
$$;
