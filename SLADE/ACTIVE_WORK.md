# Active Work

Human-readable current-state summary. **Not the database** — this is a snapshot Claude should
update periodically based on what's actually in Supabase (`slade_*` tables), not the other way
around. If this file and the database disagree, the database is right.

_Last updated: 2026-09-29 — first real CRM/LODE data entered (see below). Prior state: Phase 1
schema applied 2026-09-21, no `slade_*` data existed until this run._

## Active opportunities

- **Joey Locker / Southern View Development** — 2 `slade_opportunities` rows, both
  `discovered` (not `ready_to_deliver` — verification gate not passed, see next-steps below):
  - **Primary**: 14446 Old Hickory Blvd, Nashville (83.63 ac, AR2A, fully vacant, directly on
    the Mill Creek sewer-upsize corridor).
  - **Secondary**: 0 Brittany Park Dr, Nashville (29.01 ac, assessor-coded "vacant zoned multi
    family," 98 ft from the same corridor) — multi-family entitlement not yet confirmed against
    Metro Planning's own record.
  - 2 more sites researched but not yet formal opportunities: 0 Hickory Hollow Pkwy (near the
    Global Mall/Hickory Hollow redevelopment area) and 0 Barnes Rd (flagged — likely pipeline
    easement, owned by Columbia Gulf Transmission LLC).
  - Full writeup: `research/southern-view-development-mill-creek-search/report.md`.
  - **Outstanding before this can move past `discovered`**: exact Nolensville Sewer Replacement
    Project (#25SC0020) construction limits (only "~5 mi along Mill Creek" is public — call Metro
    Water Services, contact Justin Pendley), owner outreach on the primary site, conflict check,
    Brittany Park Dr zoning confirmation, Barnes Rd title/easement check. See the open
    `slade_tasks` row on the primary opportunity.

## Pending research

_(nothing else currently tracked in SLADE — remaining ad hoc research in `research/` not yet
migrated: `dan-lynch-site-search/`, `small-builder-prospects-kc-metro/`. See Phase 2 notes in
`PHASE_1_COMPLETION_REPORT.md`.)_

## Follow-ups

- Metro Water Services call re: exact Mill Creek sewer construction limits — open `slade_tasks`
  row, linked to the primary Southern View Development opportunity.

## Current client searches

- Southern View Development (Joey Locker) — TN land near planned infrastructure/sewer expansion.
  No acreage/price range given yet; buy box (`slade_buy_boxes`, "Primary") only has what was
  actually stated 2026-09-29 — ask before narrowing further.

## Market updates needed

_(none tracked in SLADE yet)_

## Important blockers

- Southern View Development's buy box has no acreage, price, or asset-type range — everything in
  the current search was ranked by acreage/zoning/vacancy as a reasonable proxy, not a stated
  preference. Narrow this with Jared/Joey before searching further or sending anything.
- Bulk of the existing `research/` folder (Dan Lynch, KC-metro small builders) still isn't
  migrated into `slade_sites`/`slade_site_facts` — still a Phase 2 item, not this run's scope.
