# SLADE Phase 1 Completion Report

**Date:** 2026-09-21

## What was built

An architecture assessment of the existing Groundbreakable codebase (see `ARCHITECTURE.md`),
followed by the SLADE foundation inside the existing repo — no new repo, no new Supabase
project, no new auth system:

- `SLADE/` — operating instructions (`CLAUDE.md`), philosophy/terminology (`SLADE_BIBLE.md`),
  architecture (`ARCHITECTURE.md`), full schema documentation (`DATA_MODEL.md`), NL-command
  reference (`WORKFLOWS.md`), a human-readable status file (`ACTIVE_WORK.md`), a changelog, this
  report, plus `docs/` (LODE, verification, dashboard integration, security),
  `methodologies/` (currently empty — see its `README.md`), and `templates/` (the opportunity
  report section structure).
- `supabase/migrations/20260921*.sql` — five new migration files, `slade_`-prefixed tables, not
  yet applied to the live project.
- `dashboard/src/lib/slade/` — 14 TypeScript files: domain types, and query/service functions for
  organizations, contacts, interactions, buy boxes, sites, site facts, opportunities, opportunity
  feedback, projects, reports, tasks, change log, and free-text search.
- Two unit-test files (`__tests__/verification.test.ts`, `__tests__/reports.test.ts`, 7 tests) and
  a new `npm run test` script — the dashboard had no test runner before this; Node's built-in
  `node:test` was used rather than adding a new dependency.

`npm run typecheck` and `npm run test` both pass clean against the existing dashboard project.

## Database tables created (migration files, not yet applied)

CRM: `slade_organizations`, `slade_contacts`, `slade_interactions`, `slade_change_log`.
Buy boxes: `slade_buy_boxes`. Sites: `slade_sites`, `slade_site_facts`. Opportunities:
`slade_opportunities` (with a DB-level CHECK constraint enforcing the verification gate),
`slade_opportunity_feedback`. Projects: `slade_projects`. Reports: `slade_reports`. Tasks:
`slade_tasks`. Twelve tables total — see `DATA_MODEL.md` for every column.

## Relationships between tables

```
slade_organizations ──┬── slade_contacts ──┬── slade_interactions
                       │                    ├── slade_buy_boxes ── slade_opportunities
                       │                    ├── slade_tasks
                       │                    └── slade_projects
                       └── (referenced by slade_opportunities, slade_projects)

slade_sites ──┬── slade_site_facts
              └── slade_opportunities ──┬── slade_opportunity_feedback
                                         ├── slade_reports
                                         └── slade_tasks

markets, sources, investor_profiles (existing tables) are referenced throughout, not duplicated.
```

## How persistent memory works

The Supabase database, not the conversation, is the source of truth (see `CLAUDE.md`'s "one rule
that matters most"). SLADE reads before answering and writes back whenever Jared states something
durable. `ACTIVE_WORK.md` is a periodically-refreshed human-readable snapshot, explicitly
documented as derived from the database, never the reverse.

## How SLADE accesses data

Through `dashboard/src/lib/slade/*.ts` — plain async functions taking a `SupabaseClient`, matching
the exact convention already used by `lib/queries/` and `lib/leads/`. No class-based service
layer, no ORM, no new abstraction the rest of the codebase doesn't already have.

## How LODE will work

Documented in `docs/LODE.md`: buy box → markets → candidate sites → ownership/motivation →
planning/infrastructure/entitlement → buy-box comparison → `slade_opportunities` (status
`discovered`). LODE discovers; it never delivers — that distinction is enforced by the
opportunity status model, not just process. Phase 1 builds the data model and service functions
LODE will write to; it does not build automated discovery, scraping, or scoring — that stays a
careful, source-by-source research process for now (see the existing `research/` folder), same as
it is today.

## How verification works

Nine checks (`docs/VERIFICATION.md`), enforced twice: a Postgres CHECK constraint on
`slade_opportunities` that makes `ready_to_deliver` physically impossible without all nine
`verification_*_ok` flags true, and `dashboard/src/lib/slade/verification.ts`'s
`evaluateVerificationGate()`, which explains which checks are still outstanding before a write is
even attempted.

## How outreach tracking works

`slade_interactions` logs every touch; `slade_contacts.lead_status` (separate from
`relationship_status`) tracks outreach progress; `next_follow_up_at` and `slade_tasks` answer
"who needs a follow-up" and "what should I work on today" (`dashboard/src/lib/slade/tasks.ts`'s
`getTodayWorklist`).

## How Groundbreakable dashboard integration will work

Documented in `docs/DASHBOARD_INTEGRATION.md`: a future SLADE UI is new routes under the
existing authenticated `dashboard/src/app/dashboard/admin/*` area, reading the same `slade_*`
tables through the same service functions SLADE itself uses — never a second copy of the data.
Not built in Phase 1.

## What remains intentionally unbuilt

- Migrations are **files only** — not applied to the live Supabase project. Run `supabase db push`
  when ready.
- No data populated — no contacts, organizations, buy boxes, sites, or opportunities exist yet.
  Nothing fictional was added, per the brief.
- No dashboard UI, no SLADE chat endpoint, no automation, no scoring algorithm, no PDF report
  engine, no automated LODE discovery pipeline.
- The existing `research/` folder's real client research (Dan Lynch, small-builder prospecting
  runs, etc.) has not been migrated into `slade_sites`/`slade_site_facts`/`slade_opportunities` —
  that's a deliberate, separate decision, not an oversight, since it means re-verifying real
  client-facing facts against a new schema rather than a mechanical import.
- `SLADE/methodologies/` starts empty by design (see its `README.md`).

## What Phase 2 should accomplish

1. Apply the migrations to the live project, then populate real current data: Jared's actual
   contacts, organizations, and active buy boxes (not fictional examples).
2. Decide whether to migrate the `research/` folder's existing findings into the new schema, and
   if so, do it deliberately (re-verifying facts, not just reformatting markdown).
3. Build the first SLADE-facing surface — most likely a chat endpoint (`app/api/slade/route.ts`,
   admin-gated, separate from the existing investor-facing `app/api/ask/route.ts`) before a full
   dashboard UI, since that's the actual product ask ("I should be able to talk to SLADE
   naturally").
4. Once real usage exists, revisit: whether `slade_change_log` needs to move from app-layer calls
   to DB triggers, whether structured search (`search.ts`) is still good enough or needs
   improvement, and whether `slade_opportunities.match_score` warrants a real scoring approach.
5. A first LODE research pass, using the existing methodology in
   `research/small-builder-lead-sourcing-method.md` as the model, writing findings directly into
   the new schema instead of another one-off markdown report.
