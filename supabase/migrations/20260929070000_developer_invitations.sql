-- Invitation-link onboarding (Jared, 2026-09-29), replacing the admin-set
-- temporary password flow (20260929050000_temp_password_flow.sql) -- that
-- one worked, but handing over a password by phone/text read as
-- unprofessional. This closes the same gap with a shareable single-use
-- link instead: no password ever exists in plaintext outside the
-- developer's own head, and there's nothing for Jared to relay by voice.
--
-- Additive only. must_change_password stays on investor_profiles (harmless
-- if unused going forward) rather than being dropped, since removing it
-- isn't required for this to work and a drop is never reversible.

create table user_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text not null,
  last_name text not null,
  company_name text,
  invited_by uuid references investor_profiles (id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

-- Separate join table rather than a market_id[] column -- same shape as
-- investor_markets, keeps FK integrity on market_id, and lets a market get
-- renamed/removed without hunting through array columns.
create table invitation_markets (
  invitation_id uuid not null references user_invitations (id) on delete cascade,
  market_id uuid not null references markets (id) on delete cascade,
  primary key (invitation_id, market_id)
);

alter table user_invitations enable row level security;
alter table invitation_markets enable row level security;

-- Deliberately no anon/authenticated select policy on either table. The
-- public invite-landing page (dashboard/src/app/invite/[id]/page.tsx) looks
-- up an invitation by id through the service-role client in trusted
-- server-only code -- never through a client-exposed RLS-gated query --
-- so an unauthenticated visitor can never enumerate or browse invitations,
-- only resolve the exact one-time id in the link they were sent.
create policy "user_invitations_admin_all" on user_invitations
  for all using (public.is_admin()) with check (public.is_admin());

create policy "invitation_markets_admin_all" on invitation_markets
  for all using (public.is_admin()) with check (public.is_admin());
