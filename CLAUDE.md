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
- Before writing/editing a `shifts` or `entitlement_cases` collector script
  (`dashboard/scripts/collect*.ts`), or manually/AI-logging a Plan record — read
  `dashboard/scripts/PLAN_DATA_COLLECTION_BIBLE.md` first. It has the required-field checklist and
  the one hard rule (`summary`/`description` must describe one case, never a whole meeting's
  agenda) that the dashboard's Plans display (`dashboard/src/lib/planNarrative.ts`) depends on.
- Before building a new collector (any source beyond the existing PDF-based agenda parsers), or
  touching `parcels`/`sources`/adding a `source_registry`/`relationships` table — read
  `docs/DATA_INTELLIGENCE_PIPELINE.md` first. It's the schema-grounded design for how Market,
  Plans, Opportunities, and Catalysts data gets discovered, collected, normalized, scored, and kept
  current, and it distinguishes what already exists (reuse) from what's orphaned (wire up) from
  what's genuinely missing (build).
- Before running a research/refinement pass on any `prospective_data_center_site` (Potential Data
  Center) catalyst, or touching its rendering in
  `dashboard/src/components/map/CatalystIntelligencePanel.tsx` — read
  `docs/POTENTIAL_DATA_CENTER_RESEARCH_SPEC.md` first. It's the escalation-hierarchy research
  standard, the power-as-a-gate/Development Gates decision model, the narrative-must-never-
  outrun-the-structured-fact rule, and the full schema reference this product area accumulated
  across its 2026-10-04 passes.

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
