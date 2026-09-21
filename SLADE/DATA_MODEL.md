# SLADE Data Model

All tables below live in the existing Supabase project's `public` schema, prefixed `slade_`.
Migration files: `supabase/migrations/20260921*_slade_*.sql`. TypeScript types:
`dashboard/src/lib/slade/types.ts`. RLS: every table is admin-only
(`using (public.is_admin())` / `with check (public.is_admin())`) — no anon or investor access,
ever. See `SLADE/ARCHITECTURE.md` for what's reused from the existing schema (`markets`,
`sources`, `shifts`, `investor_profiles`, `is_admin()`) instead of duplicated here.

## CRM

### `slade_organizations`

Development companies, investment companies, brokerages, contractors, planning firms, partners,
municipalities, and other businesses in Groundbreakable's network.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text not null | |
| type | text | check: `developer, investor, brokerage, contractor, planning_firm, partner, municipality, other` |
| website | text | |
| primary_market_id | uuid → markets.id | nullable |
| relationship_status | text | same vocabulary as contacts, see below |
| notes | text | |
| created_at / updated_at | timestamptz | |

### `slade_contacts`

A person: developer, investor, prospect, customer, partner, broker, planner, city contact, or
friend/network contact. **Relationship status and outreach status are separate fields on
purpose** — the spec was explicit about this, and conflating "how warm is this relationship" with
"where are we in contacting them" produces an ambiguous status field that can't answer either
question well.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| organization_id | uuid → slade_organizations.id | nullable, `on delete set null` |
| investor_profile_id | uuid → investor_profiles.id | nullable — set only if/when this contact becomes a real signed-up account |
| first_name | text not null | |
| last_name | text | |
| title | text | |
| phone | text | |
| email | text | |
| linkedin_url | text | |
| relationship_type | text | check: `developer, investor, broker, planner, city_contact, contractor, friend_network, other` — the person's *role*, not their lifecycle stage (see relationship_status) |
| relationship_status | text | check: `unknown, prospect, warm_lead, active_prospect, customer, partner, friend_network, inactive, do_not_contact` |
| lead_status | text | check: `never_contacted, attempted, no_response, responded, interested, not_interested, follow_up, active_conversation` |
| notes | text | |
| last_contacted_at | timestamptz | |
| next_follow_up_at | timestamptz | |
| created_at / updated_at | timestamptz | |

**Note on `relationship_type`:** the original spec listed "prospect" and "customer" as contact
*types*, which overlaps with `relationship_status`. Those are lifecycle states, not roles — a
"prospect" is a developer, investor, broker, etc. who happens to be early in the relationship.
Keeping them out of `relationship_type` avoids the exact ambiguity the spec warned against
elsewhere ("do not combine every status into one ambiguous field").

### `slade_interactions`

Every meaningful touch: call, text, email, LinkedIn, meeting, report sent, property sent,
follow-up.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| contact_id | uuid → slade_contacts.id | `on delete cascade` |
| organization_id | uuid → slade_organizations.id | nullable, `on delete set null` |
| interaction_type | text | check: `call, text, email, linkedin, meeting, report_sent, property_sent, follow_up, other` |
| direction | text | check: `outbound, inbound` |
| occurred_at | timestamptz not null | |
| outcome | text | |
| summary | text | |
| next_action | text | |
| source | text | e.g. `manual`, `slade` |
| created_at | timestamptz | |

Answers: who's been contacted, who hasn't responded, who said no, who's warm, who's never
received anything, who needs a follow-up — see `dashboard/src/lib/slade/interactions.ts`.

### `slade_tasks`

Lightweight follow-up/task system.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| contact_id | uuid → slade_contacts.id | nullable |
| opportunity_id | uuid → slade_opportunities.id | nullable |
| project_id | uuid → slade_projects.id | nullable |
| task_type | text | free text |
| title | text not null | |
| description | text | |
| due_at | timestamptz | |
| priority | text | check: `low, medium, high, urgent` |
| status | text | check: `open, in_progress, done, cancelled` |
| created_at / completed_at | timestamptz | |

Answers "what should I work on today?" — see `dashboard/src/lib/slade/tasks.ts`.

### `slade_change_log`

A simple, generic audit table — intentionally not per-table history tables or DB triggers in V1.
Application code calls `logChange()` (see `dashboard/src/lib/slade/changeLog.ts`) wherever a
meaningful field changes: buy box edits, relationship status changes, opportunity status changes,
verified site facts.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| table_name | text not null | |
| record_id | uuid not null | |
| field_name | text | |
| old_value | text | |
| new_value | text | |
| changed_by | text | email, or `system` |
| note | text | |
| changed_at | timestamptz | |

Phase 2 candidate: move to DB triggers if app-layer calls prove easy to miss.

## Buy Boxes

### `slade_buy_boxes`

Structured developer/investor acquisition criteria — never buried in `notes`. Follows the same
pattern already proven in `opportunity_profiles` (explicit boolean/array columns for known
requirements, not one large jsonb blob) because it's queryable and consistent with the rest of
the schema; a free-text `notes` field remains for anything genuinely long-tail.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| contact_id | uuid → slade_contacts.id | `on delete cascade` |
| organization_id | uuid → slade_organizations.id | nullable |
| name | text not null default 'Primary' | supports multiple buy boxes per contact (e.g. separate land-banking vs. multifamily strategies) |
| active | boolean not null default true | |
| target_markets | text[] | free-text market names, for markets not yet in `markets` |
| target_market_ids | uuid[] | loose references into `markets.id` — same array-of-uuid convention as `opportunity_profiles.target_market_ids`, deliberately not a join table (see tradeoff note below) |
| asset_types | text[] | |
| min_acres / max_acres | numeric | |
| min_price / max_price | numeric | |
| preferred_deal_types | text[] | |
| preferred_distress_signals | text[] | |
| zoning_preferences | text[] | |
| entitlement_preferences | text | |
| requires_sewer / requires_water / requires_highway_access / requires_rail_access | boolean | infrastructure requirements as explicit flags, matching `opportunity_profiles`' pattern |
| excluded_uses | text[] | |
| notes | text | |
| source | text | how this buy box was captured (call, email, form, inferred) |
| last_verified_at | timestamptz | |
| created_at / updated_at | timestamptz | |

**Tradeoff — normalized columns vs. jsonb:** normalized columns (chosen here) are directly
queryable/filterable ("who wants 50+ acres in Topeka with sewer") without jsonb operators, and
match the existing codebase's convention. The cost is a migration whenever a genuinely new
criterion shows up. Given buy-box criteria are fairly stable in shape (this list already mirrors
what `opportunity_profiles` needed for the same real-world problem), that cost is acceptable;
`notes` covers anything that doesn't fit yet.

## Sites

### `slade_sites`

A permanent record for every property Groundbreakable or LODE has looked at — independent of
whether it ever becomes an opportunity. Unknown values are expected and fine; nothing here is
required beyond an address.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| external_id | text | id from an external data source, if any |
| address | text | |
| city / county / state | text | |
| parcel_id | text | |
| market_id | uuid → markets.id | nullable — a site can exist before its market is tracked |
| latitude / longitude | double precision | |
| acreage | numeric | |
| owner_name | text | |
| current_use | text | |
| listing_status | text | check: `on_market, off_market, unknown` |
| listing_price | numeric | |
| listing_agent | text | |
| listing_broker | text | |
| status | text | check: `identified, researching, verified, archived` — the site's own research status, distinct from any opportunity built on it |
| notes | text | |
| created_at / updated_at | timestamptz | |

Dedup: partial unique index on `parcel_id` where not null. Address/city/state is indexed but not
unique — addresses aren't reliably normalized enough for a hard constraint; `findSiteByParcelOrAddress`
in `dashboard/src/lib/slade/sites.ts` does fuzzy lookup before insert.

### `slade_site_facts`

Individual facts about a site, each with its own provenance and verification state — this is the
core of SLADE's accuracy standard (see `SLADE_BIBLE.md` §Accuracy). A site has many facts, added
and re-verified independently over time.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| site_id | uuid → slade_sites.id | `on delete cascade` |
| fact_type | text | check: `zoning, future_land_use, acreage, owner, sewer, water, floodplain, wetlands, permitted_uses, overlays, utilities, road_access, entitlement_history, other` |
| value | text | |
| verification_status | text not null default 'needs_verification' | check: `verified, inferred, needs_verification, conflicting, stale` |
| source_id | uuid → sources.id | nullable — reuses the existing `sources` table |
| source_url | text | denormalized fallback for a fact that doesn't warrant a full `sources` row |
| source_type | text | free text (not constrained to `sources.source_type`'s vocabulary — facts can cite things like a skip-trace provider that aren't a publication) |
| source_date | date | |
| checked_at | timestamptz | |
| notes | text | |
| created_at / updated_at | timestamptz | |

A fact_type can repeat per site (e.g. `zoning` checked twice) — the row with the latest
`checked_at` is current; older rows are kept for history, not overwritten.

## Development Opportunities

### `slade_opportunities`

A site is not automatically an opportunity — this table is the connection between a site, a
contact/organization, and (optionally) the specific buy box it matches.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| site_id | uuid → slade_sites.id | `on delete cascade` |
| contact_id | uuid → slade_contacts.id | nullable |
| organization_id | uuid → slade_organizations.id | nullable |
| buy_box_id | uuid → slade_buy_boxes.id | nullable |
| market_id | uuid → markets.id | nullable |
| opportunity_status | text not null default 'discovered' | check: `discovered, screening, researching, verification_required, qualified, ready_to_deliver, delivered, rejected, paused, archived` |
| match_score | int | optional |
| thesis | text | |
| possible_uses | text[] | |
| major_upside | text | |
| major_risks | text | |
| unknowns | text | |
| next_steps | text | |
| verification_identity_ok | boolean | |
| verification_ownership_ok | boolean | |
| verification_listing_ok | boolean | |
| verification_conflict_ok | boolean | |
| verification_planning_ok | boolean | |
| verification_infrastructure_ok | boolean | |
| verification_client_fit_ok | boolean | |
| verification_prior_history_ok | boolean | |
| verification_sources_ok | boolean | |
| verification_notes | text | |
| verification_completed_at | timestamptz | |
| created_at / updated_at | timestamptz | |

**The verification gate is a real database constraint**, not just app logic: a CHECK constraint
prevents `opportunity_status = 'ready_to_deliver'` unless all nine `verification_*_ok` columns
are `true`. See `SLADE/docs/VERIFICATION.md` for what each check means and
`dashboard/src/lib/slade/verification.ts` for the code that evaluates and explains gate status
before a write is even attempted.

### `slade_opportunity_feedback`

What happened after a site was sent to someone — the input SLADE/LODE use to learn what a
developer actually likes.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| opportunity_id | uuid → slade_opportunities.id | `on delete cascade` |
| contact_id | uuid → slade_contacts.id | nullable |
| feedback_type | text | check: `interested, not_interested, need_more_info, rejected_price, rejected_location, rejected_other, positive_signal, other` |
| feedback | text | |
| resulting_action | text | |
| occurred_at | timestamptz not null default now() | |
| created_at | timestamptz | |

## Projects

### `slade_projects`

Active property research, a client-specific search, a market initiative, or a Groundbreakable
engagement — the thing tasks and opportunities hang off of.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text not null | |
| contact_id | uuid → slade_contacts.id | nullable |
| organization_id | uuid → slade_organizations.id | nullable |
| market_id | uuid → markets.id | nullable |
| objective | text | |
| status | text | check: `active, paused, completed, archived` |
| summary | text | |
| next_action | text | |
| created_at / updated_at | timestamptz | |

## Reports

### `slade_reports`

Tracks Groundbreakable deliverables. Does not build a PDF engine — designs the structured shape a
report is generated *from*, so the visual template can be built/changed independently later (see
`SLADE/templates/opportunity_report_template.md`).

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| opportunity_id | uuid → slade_opportunities.id | nullable |
| site_id | uuid → slade_sites.id | nullable |
| contact_id | uuid → slade_contacts.id | nullable |
| report_type | text | check: `opportunity_report, market_brief, buy_box_summary, other` |
| version | int not null default 1 | |
| status | text | check: `draft, internal_review, ready, delivered, archived` |
| sections | jsonb not null default '{}' | keyed by section name (`executive_thesis, property_snapshot, why_it_matters, development_potential, planning_zoning, infrastructure, entitlement_path, market_context, risks, unknowns, next_steps, sources`), each value `{ content: string, source_ids: uuid[] }` |
| file_reference | text | where the rendered file lives, once one exists |
| generated_at / delivered_at | timestamptz | |
| created_at / updated_at | timestamptz | |

A report cannot be generated from an opportunity that isn't `qualified` or later — enforced in
`dashboard/src/lib/slade/reports.ts`, not the database (reports are a downstream convenience, the
opportunity status is the actual gate).

## Duplicate prevention

Hard uniqueness is used only where it's safe (email/phone/parcel_id — see partial unique indexes
above). Name-based matches (organizations, contacts without email/phone, sites without a parcel
id) use application-layer "find or possible-duplicate" functions instead of DB constraints,
because a hard constraint on something as fuzzy as a name would either be too strict (blocking a
legitimate second "John Smith") or too loose (missing "Jon Smith") to trust. Every
`dashboard/src/lib/slade/*.ts` insert path goes through a find-first function before creating a
new row — see `organizations.ts`, `contacts.ts`, `sites.ts`.

## Search / retrieval

No vector database in Phase 1 — structured lookup first, per the brief. `dashboard/src/lib/slade/search.ts`
resolves a free-text mention ("Dan", "TJ", "the Charlotte property") against `slade_contacts`
(name ilike), `slade_organizations` (name ilike), and `slade_sites` (address/city ilike),
returning ranked candidates for SLADE to disambiguate or confirm. If this stops being good enough
as the network grows, that's a Phase 2 decision, made with real usage data instead of guessed
requirements.
