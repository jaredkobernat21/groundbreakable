# SLADE Architecture

## Conceptual model

```
Supabase (shared Postgres project)
   ↓
SLADE (internal intelligence layer — this folder + dashboard/src/lib/slade/)
   ↓
LODE (opportunity discovery — lives inside SLADE, see docs/LODE.md)
   ↓
Groundbreakable Dashboard (dashboard/ — existing Next.js app)
   ↓
Reports (client deliverables — slade_reports, see DATA_MODEL.md §Reports)
```

One Supabase project. One set of markets, sources, and market-intelligence events. SLADE,
LODE, the dashboard, and reports all read and write the same underlying data — never separate
copies. Jared talks to SLADE; SLADE reads/writes Supabase; the dashboard (today, investor-facing)
and any future internal SLADE UI both render off the same tables.

## Where SLADE lives in the existing repo

Groundbreakable already has a working repo, a live Supabase project with ~95 migrations, and a
Next.js dashboard with established conventions. SLADE was built to fit inside that, not beside it:

| Concern | Location | Why |
|---|---|---|
| Operating instructions, philosophy, methodology | `SLADE/*.md` | Human/Claude-readable, not queried at runtime |
| Structured business data | `supabase/migrations/`, tables prefixed `slade_` | Same project as everything else — one source of truth |
| Query/service code | `dashboard/src/lib/slade/*.ts` | Same function-per-file convention as `lib/queries/` and `lib/leads/` — no new abstraction layer |
| Future internal SLADE UI (chat, task list) | `dashboard/src/app/(internal or admin route)` — **not built in Phase 1** | Reuses existing auth/middleware/Supabase client setup |

SLADE is not a standalone app. There is no second repo, no second Supabase project, no parallel
auth system. It's a data model plus a service layer inside the repo that already exists.

## What already existed and is reused, not duplicated

Groundbreakable's schema was already much further along than a typical "add a CRM" task assumes.
Before adding anything, here's what SLADE reuses directly:

- **`markets`** — Groundbreakable's operating geographies (id, slug, name, state, coordinates).
  SLADE's sites, buy boxes, and opportunities reference `markets.id` directly. New markets get
  added the same way they already are (a migration adding a row), whether triggered by product
  expansion or by SLADE/LODE research turning up a new area worth tracking.
- **`sources`** — provenance records (agency, title, url, source_type, published_date). SLADE's
  `slade_site_facts` references `sources.id` for facts with a real citation, the same way
  `parcels`, `entitlement_approval_types`, and `development_opportunities` already do.
- **`shifts`, `entitlement_cases`, `development_friction_cases`** — this *is* Groundbreakable's
  Market Intelligence Events model already: rezonings, permits, infrastructure projects, planning
  decisions, annexations, entitlement friction, approvals/denials, actively populated by real
  collection scripts (`dashboard/scripts/collect*.ts`). The spec's "Market Intelligence Events"
  concept is not a new table — SLADE queries these directly. Building a parallel
  `slade_market_events` table would create two disagreeing sources of the same thing.
- **`investor_profiles`** — real, signed-up dashboard accounts. `slade_contacts` has an optional,
  nullable `investor_profile_id` so a prospect who eventually signs up stays linked to their CRM
  history, but SLADE's contacts are not investor_profiles rows — most of SLADE's contacts never
  will be (brokers, planners, city contacts, friends/network).
- **`companies`** — entities observed in market intelligence (entitlement cases, project people,
  planning records), populated in part by collection scripts. `slade_organizations` has an
  optional, nullable `company_id` for the same reason `slade_contacts` links to
  `investor_profiles` rather than merging with it: `companies` rows can be semi-automatically
  created from scraped planning/entitlement sources, and letting a scraper-populated row silently
  pick up CRM fields (`relationship_status`, `notes`, admin-only RLS) would blur a distinction
  worth keeping — an organization SLADE tracks is a deliberate, manually-curated relationship
  record, not an artifact of parsing a planning commission agenda. Most `slade_organizations` rows
  will have no `company_id`; it's set only when the two clearly refer to the same real entity.
- **`is_admin()`** (existing Postgres function) — every `slade_*` table's RLS policy is
  `using (public.is_admin())`. No new roles, no new auth system.

## What SLADE deliberately does *not* reuse, and why

Groundbreakable built a prospecting-CRM concept once already
(`private_clients`/`acquisition_profiles`, 2026-09-07) and killed it three days later in favor of
a self-service model where every tier is a real account with its own `opportunity_profiles` —
explicitly, per that migration's comment, with "no prospecting-CRM concept at all." That decision
was about the *product* (what a paying self-service customer configures for themselves). It says
nothing about Jared's own need to track people who aren't customers yet, may never become
customers, and whose relationship with Groundbreakable (a broker, a city planner, a friend who
knows a landowner) isn't shaped like a subscription tier at all. SLADE's CRM (`slade_organizations`,
`slade_contacts`, `slade_interactions`, `slade_buy_boxes`) is that different thing:
internal-only, admin-only, never exposed to a customer account, and it coexists with
`investor_profiles`/`opportunity_profiles` rather than replacing or reimplementing them.

## Naming convention

New tables use a `slade_` prefix in the existing `public` schema — the same convention already
established by `gbl_` for the Groundbreakable Leads product. A dedicated Postgres schema would
also work, but Supabase's PostgREST layer only exposes schemas explicitly allow-listed in the
project's Data API settings (a dashboard change outside this repo), and the prefix approach works
immediately with the existing `createClient()`/`createAdminClient()` setup — no infra change
required to start using it.

## Service layer conventions

`dashboard/src/lib/slade/` follows the same pattern already used everywhere else in the codebase
(see `lib/queries/developmentOpportunities.ts`, `lib/leads/queries.ts`):

- Plain async functions, not classes. `getContact(supabase, id)`, not `ContactsService.get(id)`.
- Every function takes a `SupabaseClient` as its first argument — the caller (a server component,
  a server action, or a future SLADE tool-call endpoint) decides which client (cookie-scoped user
  session vs. service-role admin client) to pass in.
- Types live in `dashboard/src/lib/slade/types.ts`, separate from `lib/types.ts` (the
  investor-product types) and `lib/leads/types.ts` (the Leads-product types) — same separation
  already established between those two.
- "Find or create" / duplicate-check functions are explicit, named functions
  (`findOrCreateContact`, `findSiteByParcelOrAddress`) — never a silent insert.

## Verification and audit

See `SLADE/docs/VERIFICATION.md` and `dashboard/src/lib/slade/verification.ts` for the
pre-delivery gate. See `slade_change_log` in `DATA_MODEL.md` for the (intentionally simple, V1)
audit trail.

## Dashboard integration

See `SLADE/docs/DASHBOARD_INTEGRATION.md`. Phase 1 does not build a SLADE UI in the dashboard —
it makes sure a future one (or the existing dashboard's admin area) can read the same tables
without any translation layer.
