# SLADE Security Principles

SLADE will eventually hold phone numbers, emails, client information, deal information, and
property research. Standard rules apply; this documents them for this specific project.

## Credentials

- Never hard-code a Supabase key, Anthropic key, Mapbox token, or any other secret anywhere in
  `SLADE/` or `dashboard/src/lib/slade/`. Everything comes from environment variables, following
  the existing convention in `dashboard/.env.local.example`.
- `dashboard/.env.local` is already gitignored (`dashboard/.gitignore`) — never remove that, never
  commit a real key.
- If a future SLADE-specific integration needs its own key (a skip-trace provider, a records API,
  etc.), add it to `.env.local.example` with a comment explaining what it powers and what happens
  when it's absent — same pattern `BATCHDATA_API_KEY` and `ANTHROPIC_API_KEY` already follow
  there.

## Server-side vs. client-side access

- `slade_*` tables are never queried from a client component. All access goes through server
  components, server actions, or a server-side API route — the same boundary the rest of the
  dashboard already enforces (`lib/supabase/server.ts` vs. `lib/supabase/client.ts`).
- `createAdminClient()` (service-role, bypasses RLS) is reserved for backend automation without a
  logged-in session (a future LODE research script, a cron job) — never for a request that
  forwards caller-supplied filters, per the existing warning comment in
  `dashboard/src/lib/supabase/admin.ts`. Anything running in Jared's own authenticated session
  should use the regular server client and rely on RLS.

## Row-level security

Every `slade_*` table has RLS enabled with a single policy:
`using (public.is_admin()) with check (public.is_admin())`. There is no non-admin read or write
path to any SLADE table — this data is never meant to be visible to an investor account, by
design, not by convention. If a future feature needs to expose a *subset* of SLADE data to a
customer (e.g. showing a client their own delivered opportunities), that's a new, explicitly
scoped table or view — never a relaxed policy on a `slade_*` table itself.

## PII handling

Contact phone/email/LinkedIn are stored as plain columns, matching the existing precedent in
`gbl_contacts`. If volume or sensitivity grows to the point that encryption-at-rest-beyond-Supabase's-
default or field-level access control is warranted, that's a Phase 2+ decision made with real
data volume in hand, not a default to build now.

## What's out of scope for Phase 1

No new auth system, no new roles beyond the existing `is_admin()` check, no encryption scheme,
no rate limiting beyond what Supabase/Next.js already provide. Phase 1 uses what's already
proven in this codebase.
