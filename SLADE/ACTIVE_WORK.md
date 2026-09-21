# Active Work

Human-readable current-state summary. **Not the database** — this is a snapshot Claude should
update periodically based on what's actually in Supabase (`slade_*` tables), not the other way
around. If this file and the database disagree, the database is right.

_Last updated: 2026-09-21 — Phase 1 schema applied to the live Supabase project (verified: all
12 tables live, RLS active, verification-gate constraint tested and working). No `slade_*` data
exists yet — nothing has been entered._

## Active opportunities

_(none yet — schema just created)_

## Pending research

_(none tracked in SLADE yet — existing ad hoc research lives in `research/`, e.g.
`dan-lynch-site-search/`, `small-builder-prospects-kc-metro/`. Not yet migrated into
`slade_sites`/`slade_site_facts` — see Phase 2 notes in `PHASE_1_COMPLETION_REPORT.md`.)_

## Follow-ups

_(none tracked in SLADE yet)_

## Current client searches

_(none tracked in SLADE yet)_

## Market updates needed

_(none tracked in SLADE yet)_

## Important blockers

- No data has been migrated from the existing `research/` folder or from Jared's own memory of
  current relationships/buy boxes into `slade_contacts`/`slade_organizations`/`slade_buy_boxes`.
  Phase 1 was explicitly foundation-only — see `PHASE_1_COMPLETION_REPORT.md`. Now unblocked:
  schema is live, ready for real data.
