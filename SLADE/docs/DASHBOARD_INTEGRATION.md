# Future Dashboard Integration

Phase 1 does not build a dashboard UI for SLADE. This documents how the existing
`dashboard/` app should eventually read the same data, so that work is additive later instead of
a redesign.

## The rule

The dashboard must never maintain a separate copy of SLADE's data. It reads the same `slade_*`
tables (via `dashboard/src/lib/slade/*.ts`, the same functions SLADE itself uses) that Supabase
already holds. No sync job, no export/import, no second database.

## Where a SLADE section would fit in the existing app

The dashboard already has an authenticated admin area (`dashboard/src/app/dashboard/admin/*`,
gated by `is_admin()` via RLS and `middleware.ts`'s `/dashboard/:path*` protection) — a future
SLADE UI is a new set of routes under that same authenticated area, not a new app or a new auth
system. Suggested (not built) route shape, matching the categories in the original brief:

| Route | Reads |
|---|---|
| `/dashboard/admin/slade` (home / "what should I work on today") | `slade_tasks`, upcoming `next_follow_up_at` from `slade_contacts` |
| `/dashboard/admin/slade/lode` | `slade_sites`, `slade_opportunities` (by status) |
| `/dashboard/admin/slade/network` | `slade_contacts`, `slade_organizations` |
| `/dashboard/admin/slade/outreach` | `slade_interactions`, grouped by `slade_contacts.lead_status` |
| `/dashboard/admin/slade/markets` | existing `markets`/`shifts` — no new table |
| `/dashboard/admin/slade/projects` | `slade_projects`, `slade_reports` |
| `/dashboard/admin/slade/chat` | a future conversational entry point — see below |

## The conversational interface

The existing `app/api/ask/route.ts` is the closest precedent (Claude-backed, cache-optimized,
answers-only-from-provided-data) but it is **investor-facing and read-only over investor-visible
data**. A SLADE chat endpoint must be a separate route (e.g. `app/api/slade/route.ts`), gated by
`is_admin()`, with write access to `slade_*` tables — never the same endpoint, and never reachable
by a non-admin session. Building this endpoint is explicitly out of scope for Phase 1; the point
of Phase 1 is that when it is built, it's a thin translation layer over
`dashboard/src/lib/slade/*.ts`, not a new place business logic gets reimplemented.

## Auth

No new auth system. SLADE's dashboard routes use the exact same `investor_profiles.role = 'admin'`
/ `is_admin()` check every other admin route already uses. In practice this means: Jared's own
account, gated the same way `/dashboard/admin/*` already is today.
