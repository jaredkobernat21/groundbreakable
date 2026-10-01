-- Extends user_invitations so the same single-use link mechanism that
-- already works cleanly for brand-new accounts (Joey Locker, Bennett Haist
-- both completed it first try -- see auth.users timestamps) can also cover
-- "reset this existing account's password," replacing the admin/forgot-
-- password flow's prior dependency on Supabase's own recovery-email system.
-- That system has a fixed ~1-hour link expiry (too short -- Jared, 2026-
-- 10-01) and an implicit-flow/URL-fragment handoff quirk that
-- dashboard/src/app/login/page.tsx has to specifically work around. A link
-- we mint and control ourselves sidesteps both: same 7-day expires_at
-- default as invites, no Supabase Auth email/OTP involved at all.
--
-- NULL user_id means "create a new account" (today's behavior, unchanged).
-- A set user_id means "update this existing user's password instead" --
-- see dashboard/src/app/invite/inviteFlow.ts's applyPasswordReset().
alter table user_invitations
  add column user_id uuid references auth.users (id) on delete cascade;

-- Minimal insert-only table whose sole purpose is to be a trigger target
-- for the existing notify_submission() function (see
-- 20260925130000_submission_notify_webhook.sql) -- lets the public
-- /forgot-password page get a ready-to-send link into Jared's inbox without
-- the Next.js app ever touching the Vault-held webhook secret that
-- function requires. Only written by the service-role client (the self-
-- service Server Action), same trust model as user_invitations itself.
create table password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  reset_link text not null,
  created_at timestamptz not null default now()
);

alter table password_reset_requests enable row level security;

create policy "password_reset_requests_admin_all" on password_reset_requests
  for all using (public.is_admin()) with check (public.is_admin());

create trigger notify_on_insert
  after insert on public.password_reset_requests
  for each row execute function public.notify_submission();
