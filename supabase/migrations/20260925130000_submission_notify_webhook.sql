-- Notifies the Groundbreakable team by email whenever someone submits the
-- get-started.html "Show me where to look" form (development_profiles) or
-- the "Request Access" form (access_requests). Fires an async HTTP call
-- (pg_net) to the `notify-submission` edge function, which sends the email
-- via Resend.
--
-- The webhook's shared secret lives in Postgres Vault
-- (`submission_notify_webhook_secret`, created out-of-band -- never
-- committed here) rather than as a literal in this file, so this migration
-- can be safely checked into git.

create or replace function public.notify_submission()
returns trigger
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'submission_notify_webhook_secret';

  perform net.http_post(
    url := 'https://pgcospvlhorcvssafjoo.supabase.co/functions/v1/notify-submission',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    body := jsonb_build_object(
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW)
    )
  );

  return new;
end;
$$;

create trigger notify_on_insert
  after insert on public.development_profiles
  for each row execute function public.notify_submission();

create trigger notify_on_insert
  after insert on public.access_requests
  for each row execute function public.notify_submission();
