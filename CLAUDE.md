# Groundbreakable — repo orientation

This repo contains three things:

- **`/` (root)** — the public marketing site (static HTML/CSS/JS), deployed to groundbreakable.com.
- **`dashboard/`** — the Next.js 14 app: the investor/development-intelligence product, the
  "Groundbreakable Leads" build-prospecting tool (`/leads`, `gbl_*` tables), and the admin
  console. See `dashboard/` for its own conventions (no separate CLAUDE.md there yet — this file
  and code comments are the reference).
- **`supabase/`** — the shared Postgres schema (one Supabase project, `migrations/` is the source
  of truth) used by everything above.
- **`SLADE/`** — Jared's internal operating agent for running Groundbreakable itself: CRM,
  outreach, buy boxes, market intelligence, site research, LODE (opportunity discovery), and
  report generation. **Start here if the task involves any of those** — read `SLADE/CLAUDE.md`
  first.

## Where things live

- Structured business data (contacts, orgs, sites, buy boxes, opportunities, tasks, reports) →
  Supabase, tables prefixed `slade_` (see `SLADE/DATA_MODEL.md`). Never Markdown.
- SLADE service/query code → `dashboard/src/lib/slade/` (plain async functions per file, same
  convention as `dashboard/src/lib/queries/` and `dashboard/src/lib/leads/` — no service classes).
- SLADE operating instructions, architecture, and methodology → `SLADE/*.md`.

## Before touching the database

`supabase/migrations/` already has ~95 migrations covering `markets`, `sources`, `shifts`
(market intelligence events), `projects`, `entitlement_cases`, `development_friction_cases`,
`investments`, `growth_areas`, `investor_profiles`, `opportunity_profiles`, and more. **Check
whether something already exists before adding a new table.** A prior investor-CRM concept
(`private_clients`/`acquisition_profiles`) was built and then deliberately superseded in
September 2026 — read the migration comments in `20260907010000_three_tier_product_model.sql`
before reintroducing anything that looks similar; SLADE's `slade_*` tables are a different,
internal-only thing (see `SLADE/ARCHITECTURE.md` for why they don't conflict).

Never run `supabase db push` / apply a migration against the linked project without Jared's
explicit go-ahead — this is a live production database with real client data.
