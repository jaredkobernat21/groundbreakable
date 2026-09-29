-- Fallback account-setup path (Jared, 2026-09-29): the Supabase invite-
-- email flow hit repeated, hard-to-diagnose Auth-settings issues (Site
-- URL/redirect resolution, email template variables not rendering as
-- documented) that ate significant time without a working result. This
-- adds the "admin sets a temporary password, user changes it on first
-- login" path from the original spec's Option B -- no email dependency
-- at all, so account creation works immediately and reliably.
alter table investor_profiles
  add column must_change_password boolean not null default false;
