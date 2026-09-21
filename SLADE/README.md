# SLADE

Jared's internal operating agent for Groundbreakable. See `CLAUDE.md` for how a Claude Code
session should use this — start there, not here.

## What's in this folder

| File | Purpose |
|---|---|
| `CLAUDE.md` | Operating instructions for Claude Code sessions acting as SLADE |
| `SLADE_BIBLE.md` | What Groundbreakable/SLADE/LODE are, philosophy, accuracy standards, terminology |
| `ARCHITECTURE.md` | How SLADE fits into the existing Groundbreakable repo, what's reused vs. new |
| `DATA_MODEL.md` | The full `slade_*` Supabase schema |
| `WORKFLOWS.md` | Natural-language command → structured operation reference |
| `ACTIVE_WORK.md` | Human-readable current-work summary (not the database — see below) |
| `CHANGELOG.md` | What changed in SLADE itself, by date |
| `PHASE_1_COMPLETION_REPORT.md` | What Phase 1 built and what Phase 2 should do |
| `docs/LODE.md` | Opportunity-discovery engine architecture |
| `docs/VERIFICATION.md` | The mandatory pre-delivery verification gate |
| `docs/DASHBOARD_INTEGRATION.md` | How the existing dashboard should eventually read SLADE's data |
| `docs/SECURITY.md` | Credentials, RLS, PII handling |
| `methodologies/` | Groundbreakable's research/discovery methodology docs |
| `templates/` | Report and deliverable templates |

## What's not in this folder

No client records, no CRM state, no live business data. That's all in Supabase
(`supabase/migrations/*_slade_*.sql`), reachable through
`dashboard/src/lib/slade/*.ts`. Markdown here is instructions and documentation, not the
database — see `ARCHITECTURE.md` for why.

## Where the code is

`dashboard/src/lib/slade/` — see `ARCHITECTURE.md` §Service layer conventions.

## Setup

SLADE uses the existing Groundbreakable Supabase project — no separate project, no separate
credentials. See `dashboard/.env.local.example` for what's needed to run the dashboard (and,
once built, any SLADE-specific route) locally. New migration files live in
`supabase/migrations/` alongside everything else; **they are not applied automatically** — run
`supabase db push` from `supabase/` yourself when you're ready to apply them to the live project.
