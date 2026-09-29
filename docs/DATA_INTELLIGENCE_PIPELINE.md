# Groundbreakable Data Collection & Intelligence Pipeline

Design for the pipeline that finds, collects, normalizes, classifies, and keeps current the data
behind the four product categories: **Market, Plans, Opportunities, Catalysts**. Written before
any code (per Jared, 2026-09-29) — this is Part 20's 14-item output, grounded against the real
production schema and collectors rather than a generic scraper design. Implementation is a
separate, incremental follow-on.

**How to read this**: every recommendation below states what already exists and what's actually
missing. Groundbreakable's schema is much richer than a first glance suggests — several of the
tables this spec asks for (`parcels`, `signals`, `site_constraints`, a polymorphic link table, an
intake/review-queue staging system) already exist. Some are empty scaffolding, some are populated
but unwired from the live dashboard, and a few are exactly what's needed and just need to be
extended. The real gaps are narrower than "build everything from scratch."

---

## 1. Recommended Data Architecture

Jared's 10-stage pipeline, mapped onto what's real today:

| Stage | Current state |
|---|---|
| **1. Discover sources** | No `source_registry` — collectors hardcode their one target (see `dashboard/scripts/collectLawrenceCityCommission.ts`'s `CIVICWEB_BASE` constant). **Gap** — Part 15/6 below. |
| **2. Fetch/Ingest** | `dashboard/scripts/collect*.ts` — PDF-only today (agenda/minutes packets fetched via `fetch()`, parsed with `pdf-parse`). No API/GIS/CSV collector exists yet anywhere in the repo. **Gap, and the highest-leverage one** — Part 4. |
| **3. Extract** | `dashboard/scripts/lawrencePlanningCommissionParser.ts` — regex-based section/vote/party extraction from PDF text. Works, but is exactly the source of the raw-dump problem documented in `dashboard/scripts/PLAN_DATA_COLLECTION_BIBLE.md` (27% of `entitlement_cases.summary` rows are whole-meeting dumps). |
| **4. Normalize** | Ad hoc per collector today (e.g. `REQUEST_TYPE_TO_APPROVAL_KEY` in the City Commission collector). No shared cross-jurisdiction dictionary. **Gap** — Part 9. |
| **5. Geocode/Map** | Every event-level table (`shifts`, `entitlement_cases`, `investments`, `catalysts`) carries its own `lat`/`lng`. No shared geocoding step or parcel-level geometry population — `parcels.geom` exists (PostGIS `geometry`/`geography` column) but the table has **0 rows**. **Gap**. |
| **6. Classify** | Groundbreakable's established pattern is *derive, don't store* — a display-time function turns structured fields into a label rather than a collector writing a redundant category column. Real examples already in the codebase: `deriveOpportunityTypeTag` (`lib/opportunityConstants.ts`), `deriveInvestmentMarketCategory` (`lib/investmentConstants.ts`), `deriveCaseTypeLabel` (`lib/planNarrative.ts`). Keep using this pattern for Catalysts and future categories rather than adding classification columns. |
| **7. Score relevance** | `computeEntitlementRealityScore` (`lib/entitlement/score.ts`) is a real, already-built, **fully explainable** component-scored index — exactly the shape Part 17 asks for. Reuse this shape for Opportunity/Catalyst scores rather than inventing a new one — see §8/§9. |
| **8. Link related records** | Narrow today: `investment_links` (polymorphic `investment_id`/`linked_table`/`linked_id`, 6 rows, real but investment-only), `signals` (`parcel_id`/`opportunity_id` FKs, **34 rows, populated but not queried anywhere in `dashboard/src`** — orphaned), friction cases' `related_project_id`/`related_entitlement_case_id`, catalysts' `related_shift_id`/`related_entitlement_case_id`. Catalyst↔Plan/Opportunity proximity (`lib/catalystRules.ts`) is computed **live, client-side, every render** — never persisted. **Gap** — Part 8 below recommends generalizing the `investment_links` shape into one `relationships` table used everywhere. |
| **9. Store** | Postgres + PostGIS, one project, RLS-gated by `has_market_access()`/`is_admin()`. Solid, no change needed. |
| **10. Recheck/Update** | `last_verified_at`/`last_verified_date` exist on most tables. `entitlement_reality_score_snapshots` and `growth_area_snapshots` already give point-in-time history. No scheduler runs the `collect:*` scripts automatically today — they're manual `npm run collect:*` invocations. **Gap** — Part 13/14 below. |

---

## 2. Source Hierarchy

Jared's Tier 1/2/3 structure is right and matches what the existing collectors already target
(city/planning commission agendas = Tier 1). Two additions grounded in the real schema:

- **`sources.source_type` is free text today, with no reliability tier.** Add a `reliability_tier
  smallint` (1/2/3) column to `sources` — cheap, and every existing row can be backfilled from its
  `source_type` value in one pass (`public_record`/`agency_document` → 1, engineering/developer
  sites → 2, `news` → 3).
- Every existing collector fetches PDFs because Lawrence/Topeka's planning portals don't expose an
  API for agendas — that's a real constraint, not a design gap. But **county GIS/assessor data**
  (parcels, zoning, future land use, city limits) almost always *does* have a structured endpoint
  (most Kansas counties run Esri ArcGIS REST FeatureServers or Socrata) and **zero collectors
  target these today**. This is where "prefer API > GIS > CSV > PDF" actually bites — see §4.

---

## 3. Required Datasets by Category

Each row: what's needed → what exists → the real gap.

### MARKET

| Subcategory | Exists | Gap |
|---|---|---|
| A. Infrastructure | `shifts` (category=`infrastructure`), `investments` (`investment_type=infrastructure_enabling`) — both real, populated | None structural; more sources |
| B. Incentives | `investments` (`incentivized_development`, `incentive_amount`), `catalysts.catalyst_type=incentive_district` | None structural; more sources |
| C. Utilities | `deriveInvestmentMarketCategory`'s keyword match (just built) is the *only* utility signal today | No service-boundary/capacity dataset exists anywhere — everything is inferred from free text. Real gap if utility service-area maps matter (see §7). |
| D. Demand | `market_indicators` (population, employment, permits, income) | Already the right shape; needs more metrics/markets populated, not new schema |
| E. Investment | `investments` — rich schema, 4 rows | Data volume, not design |

### PLANS

| Subcategory | Exists | Gap |
|---|---|---|
| Entitlements | `entitlement_cases` + 7 child tables — rich, 149 rows real | None structural (see `PLAN_DATA_COLLECTION_BIBLE.md` for field-quality gaps) |
| Projects | `projects`, `project_events`, `project_parties` | Exists but deliberately unwired from the investor dashboard (2026-09-25 redesign) — still live for admin + linked-project context on a Plan's detail panel |
| Infrastructure Plans | `shifts` (category=`infrastructure`) | None |
| Public/Civic | No distinct category — currently just `shifts.shift_type` free text (e.g. `municipal_facility`, observed in real data) | Minor — could promote to a first-class `shift_type` value list if it needs its own filter later |

### OPPORTUNITIES

| Subcategory | Exists | Gap |
|---|---|---|
| Underutilized | `development_opportunities` (category=`distress`, signals `vacant`/`demolition`) | No assessor data (land value, improvement value, FAR) anywhere — signals are hand-tagged by admins, not computed. **Real gap.** |
| Distress | `development_opportunities` signals (`tax_delinquent`, `tax_foreclosure`, `code_violation`, `ownership_change`) | Schema supports it; no collector pulls from county treasurer/recorder/code-enforcement — currently 100% manual admin curation. **Real gap.** |
| Growth Edge | `growth_areas` (polygon, `momentum_state`, `thesis`, `catalyst_timeline`) | No city-limits, annexation-boundary, or future-land-use layer exists as data — `zoning_land_use.layer_type` is a generic polygon-layer column that *could* hold these without a new table, but no rows use it that way today. **Real gap, but cheap to close** — see §6. |
| Infrastructure Unlock | Point-based shift/investment geometry only | Needs *line/corridor* geometry (a sewer trunk route, a road corridor) and parcel polygons to compute "within 500 ft of." Neither exists yet. **Real gap**, and the most geospatially demanding Opportunities subtype — don't build until `parcels` has real rows. |
| Entitlement Upside | `entitlement_cases` (nearby recent rezonings) + `zoning_land_use` | Buildable today with the existing `pointInPolygon`/proximity toolkit (`lib/geo.ts`) once the query is written — no schema gap, just unbuilt logic. |
| Assemblage | `parcels` exists but has **no owner column** and **0 rows** | Needs both a schema extension (`owner_name`) and real parcel/assessor data before this can work at all. **Real gap.** |

### CATALYSTS

`catalysts` table — solid foundation, extended this session (`why_it_matters`, `development_impact`,
`expected_timeline`, `related_context`, links to `shifts`/`entitlement_cases`), 5 real rows,
admin-curated via `/dashboard/admin/catalysts`. Missing: `catalyst_score`, `impact_radius_meters`
(close — `influence_radius_meters` already exists and mostly serves this purpose),
`reason_for_catalyst_classification`. See §9.

---

## 4. Collection Method per Dataset

Following Jared's stated preference order (API → GIS/FeatureServer → CSV/JSON → RSS → HTML table →
PDF → OCR last resort):

- **Entitlement cases / Plans (Tier 1 agendas)**: PDF remains correct here — CivicWeb (the portal
  both Lawrence and Topeka use) doesn't expose agendas via API. Keep the existing
  `collect*.ts` + `pdf-parse` pattern, but apply `PLAN_DATA_COLLECTION_BIBLE.md`'s per-case
  extraction rule going forward.
- **Parcels, zoning, future land use, city limits (Opportunities' geospatial backbone)**: these
  should **not** be PDF-collected. Douglas County (Lawrence) and Shawnee County (Topeka) both run
  Esri ArcGIS REST services for parcel/zoning layers — the right collection method is a generic
  `dashboard/scripts/lib/arcgisFeatureServer.ts` fetch-and-page helper (query a FeatureServer
  layer's `/query` endpoint with `outFields=*&f=geojson`, paginate via `resultOffset`), reusable
  across every market. **This is the single highest-leverage new collector to build** — it unlocks
  Underutilized, Growth Edge, Infrastructure Unlock, and Assemblage all at once, none of which can
  work without real parcel geometry.
- **Market indicators (Census/BLS/ACS)**: these have real, documented, free JSON/CSV APIs — a
  `dashboard/scripts/collectMarketIndicators.ts` hitting the Census API directly is strictly better
  than PDF/HTML scraping and should be the first non-PDF collector built, since it's the lowest-risk
  proof of the "prefer structured APIs" pattern before tackling ArcGIS.
- **Incentive districts / TIF boundaries**: usually published as an ordinance (PDF, Tier 1) *and*
  sometimes as a GIS layer (city economic development GIS) — collect the boundary from GIS when
  available, the terms/expiration from the ordinance PDF.
- **County assessor (ownership, land/improvement value, tax delinquency)**: varies most by county —
  some expose Socrata/CSV exports, some only an HTML search form. Treat this as market-onboarding
  work (§14), not a single reusable collector — but always check for a bulk CSV/API export before
  building an HTML-table scraper.

---

## 5. Update Frequency

Jared's Part 13 table is the right cadence. Current reality: **nothing runs on a schedule today** —
every `collect:*` script (see `package.json`) is a manual `npm run` invocation. Recommend Supabase
`pg_cron` (already available on the linked project) calling a small Edge Function that shells out
to the relevant collector, on this cadence:

| Source class | Frequency | Collector today |
|---|---|---|
| Planning/City Commission agendas | Daily | `collectLawrencePlanningCommission.ts`, `collectLawrenceCityCommission.ts`, `collectTopekaPlanningCommission.ts` — exist, unscheduled |
| Permit portals | Daily | None exist |
| Parcel ownership | Weekly/monthly | None exist |
| CIP / comprehensive plan / future land use | Monthly | None exist |
| Infrastructure projects | Weekly | Currently folded into the agenda collectors' `infrastructure` shift category |
| Economic development / incentives | Daily/weekly | None exist |
| Population/employment | Monthly/quarterly | None exist |

Don't re-crawl static documents (an adopted comprehensive plan doesn't change weekly) — the
`alreadyProcessed()` check already in `collectLawrenceCityCommission.ts` (dedupes on `sources.url`)
is the right pattern; extend it to every new collector rather than inventing a second mechanism.

---

## 6. Minimum Schema Changes

Additive only, no renames/drops. In rough build order:

1. **`sources`**: add `reliability_tier smallint`.
2. **New `source_registry` table** (Part 15's exact field list — genuinely doesn't exist):
   `id, market_id, source_name, source_type, agency, url, jurisdiction, format, update_frequency,
   parser_type, reliability_tier, last_checked_at, last_success_at, active, notes`.
3. **`parcels`**: add `owner_name text`, `land_value numeric`, `improvement_value numeric`,
   `far numeric`, `zoning_district text`. (Extending the existing table, not a new one.)
4. **New generic `relationships` table**, generalizing `investment_links`'s polymorphic shape
   so it covers every pair, not just investments: `id, source_table text, source_id uuid,
   target_table text, target_id uuid, relationship_type text, distance_meters numeric, confidence
   text, created_at`. This is where "Opportunity → nearby Catalyst," "Plan → nearby Opportunity,"
   etc. get *persisted* instead of recomputed client-side on every render.
5. **`zoning_land_use`**: no column changes — just start writing rows with `layer_type IN
   ('city_limit', 'annexation_boundary', 'future_land_use', 'urban_growth_boundary')`. The table
   was already built generic enough for this.
6. **`catalysts`**: add `catalyst_score int`, `reason_for_catalyst_classification text` (
   `influence_radius_meters` already serves as `impact_radius`, no new column needed there).
7. **`entitlement_cases`/`shifts`/`development_opportunities`**: no changes — already rich enough
   for what's asked.

---

## 7. Geospatial Calculations Required

PostGIS is **already enabled** (`parcels.geom`, `zoning_land_use.geom`, `growth_areas.geom` are all
real `geometry`/`geography` columns) but every spatial check in the live dashboard today
(`lib/geo.ts`: `pointInPolygon`, `polygonCentroid`, `circlePolygon`, `haversineDistanceMeters`,
`filterWithinRadius`) is hand-rolled JavaScript run client-side. That's fine for what it does today
(point-in-polygon against a handful of momentum-area/catalyst polygons), but it does **not** scale
to what Opportunities needs next:

- **Line-crosses-parcel / distance-to-line** (Infrastructure Unlock's "sewer trunk passes within
  500 ft") — no line-geometry support exists in `lib/geo.ts` at all.
- **Polygon adjacency** (Assemblage's "parcels touch or nearly touch") — not implemented.
- **Nearest-N spatial lookups at scale** — once `parcels` has real county-wide rows (tens of
  thousands per market), client-side JS iteration over every parcel stops being viable.

**Recommendation**: move anything beyond simple single-polygon point tests into PostGIS, via either
a SQL view or a Supabase RPC function — `ST_DWithin`, `ST_Touches`, `ST_Intersects`,
`ST_Distance` are exactly the primitives needed and are already available on this database. Keep
`lib/geo.ts`'s existing functions for the small, already-loaded-client-side cases (momentum areas,
catalyst zones) they already serve well — don't rewrite what isn't broken.

---

## 8. Opportunity Scoring Logic

Reuse `computeEntitlementRealityScore`'s exact shape (`lib/entitlement/score.ts`) rather than
inventing a new pattern — it already satisfies Part 17's "never opaque" requirement:
`{ score, confidence, components: [{key, label, maxPoints, points, evidence}], missingInformation }`.

A new `computeOpportunityScore` would score these dimensions, each traceable to a real field or
relationship (once §6's `relationships` table exists):

| Dimension | Points | Evidence source |
|---|---|---|
| Development potential | 20 | `development_opportunities.category`/`signals`, acreage if known |
| Infrastructure proximity | 15 | `relationships` row of type `near_infrastructure_project` (once built) |
| Entitlement upside | 15 | Nearby `entitlement_cases` with `status=approved` in the same growth area |
| Growth direction | 15 | Whether the opportunity falls inside a `growth_areas` polygon, weighted by `momentum_state` |
| Catalyst proximity | 15 | `nearbyCatalystForPoint` (`lib/catalystRules.ts`) — **already computable today**, zero new schema needed |
| Ownership/acquisition signal | 10 | `development_opportunities.signals` (`tax_delinquent`, `ownership_change`, etc.) |
| Parcel usability | 10 | Matching `zoning_land_use`/buildability zone, same lookup `OpportunityDetailPanel` already does |

Same neutral-half-credit-plus-`missingInformation` discipline as the entitlement score — a
dimension with no evidence gets a documented neutral default, never a confident fabricated number.

---

## 9. Catalyst Scoring Logic

Same explainable-component pattern, new `catalyst_score`/`reason_for_catalyst_classification`
columns (§6). Starting weights, directly from Jared's spec:

```
major_employer type              +3
investment_amount > $100M        +3
jobs_created > 500                +3
major infrastructure dependency  +2
regional-scale (geographic_scope
  = citywide, or investment
  linked via `relationships`)    +2
```

Threshold configurable per market (a `markets` column or a config constant, not hardcoded) — a
$100M project is catalyst-scale in Topeka/Lawrence, not necessarily in a much larger metro.
Computed at admin-entry time (mirrors the existing `is_spotlight` pattern — a human-curated
decision with a computed score as a starting recommendation, not a fully automated classifier).

---

## 10. Duplicate / Entity-Resolution Logic

**Already built and running** for entitlement cases —
`upsertCaseFromAgendaItem`/`recordMinutesDecision` in `collectLawrenceCityCommission.ts` already
check `case_number` before inserting and update-in-place rather than duplicating. The right move is
to **extract this into a shared helper** (`dashboard/scripts/lib/entityResolution.ts`) usable by
every collector (Plans, Catalysts, Investments alike), matching in this priority order — mirroring
Part 10's list and what the existing code already does:

1. Case/project number (exact)
2. Address + market (normalized)
3. Parcel ID
4. Applicant/developer name + date proximity (fuzzy, last resort)

On a match: update the existing record, append a new `sources` row, append a new event/history row
(§11) — never insert a second copy of the same real-world case.

---

## 11. Record History

Already exists and is exactly the right shape — no new table needed. `entitlement_case_events`
(hearing-by-hearing history), `project_events` (status timeline), `development_friction_timeline_events`,
and `growth_area_snapshots`/`entitlement_reality_score_snapshots` (point-in-time score history) already
give every category a real timeline. The only gap: **Catalysts and Investments don't have their own
event/history child table today** — a catalyst's status changes (`proposed` → `under_construction` →
`operating`) currently just overwrite the one `status` column with no history kept. If catalyst
timelines matter (Jared's PLAT-25-0029 example applies equally well to a catalyst's own lifecycle),
add a small `catalyst_events` table mirroring `entitlement_case_events`'s shape rather than inventing
a different pattern.

---

## 12. Confidence

Already implemented, consistently, everywhere: `confidence` (`verified`/`reported`/`unconfirmed`) on
`shifts`, `entitlement_cases`, `catalysts`, `development_opportunities`'s child rows,
`zoning_land_use`, `investments`. This already matches Jared's HIGH/MEDIUM/LOW ask one-to-one — no
schema change needed. The one gap: **no table separates `fact_confidence` /
`location_confidence` / `relationship_confidence`** the way Part 12 asks — today there's one
`confidence` value per row covering everything. Given how much of the schema would need touching to
split this cleanly, treat this as a *future* refinement rather than part of the MVP — a single
confidence value has been sufficient for the product so far, and splitting it is only worth doing
once `relationships` (§6) exists and its own confidence genuinely needs to differ from the fact
confidence of the records it connects.

---

## 13. Data Freshness

Covered in §5 — same table, this section is about *not* over-fetching. The existing
`alreadyProcessed()` dedupe-by-`sources.url` check already prevents re-processing a document that's
been seen before; extend that same check to every new collector instead of building a second
freshness mechanism.

---

## 14. Market Onboarding Workflow

Jared's 5-step process is right. Grounding step 2's checklist against what onboarding a market
*actually* requires today, based on the two markets already live (Topeka, Lawrence):

1. **Find official jurisdiction sites** — planning portal (CivicWeb or equivalent), county GIS,
   county assessor, city GIS/open-data portal.
2. **Identify and register sources** — once §6's `source_registry` exists, this step is literally
   populating rows in it (url, format, parser_type, expected update_frequency) rather than a manual
   note somewhere.
3. **Historical import** — Jared's 12–24 month window for Plans matches what
   `RECENT_MEETING_WINDOW = 60` (meetings, in `collectLawrenceCityCommission.ts`) already
   approximates; align the constant name/value explicitly to "months" going forward for clarity
   across markets with different meeting frequencies.
4. **Parcel/zoning/future-land-use import** — this is the step that doesn't exist as a repeatable
   process yet (no ArcGIS collector — see §4). Once built, this becomes "point it at the new
   county's FeatureServer URL," not new code per market.
5. **Enable recurring updates** — via §5's scheduler, once it exists.

**New market checklist to add to this repo** (natural home: a
`dashboard/scripts/MARKET_ONBOARDING_CHECKLIST.md`, once step 4 is real): jurisdiction sources
found, `source_registry` rows created, historical Plans import run, parcel/zoning import run,
`markets` row created, scheduler enabled.

---

## MVP Build Order

Matching Jared's Part 19 priority, re-sequenced by what's already done vs. what actually blocks the
next thing:

1. ~~Planning agendas / entitlement cases~~ — **done**, three markets' worth of collectors exist.
2. **Source registry + reliability tier** (§6.1–2) — small, unblocks tracking everything after it.
3. **ArcGIS FeatureServer collector + parcel import** (§4) — the single highest-leverage next build;
   unblocks Growth Edge, Infrastructure Unlock, Underutilized, and Assemblage simultaneously, none
   of which can produce a real result without it.
4. **Zoning / future land use / city limits as `zoning_land_use` rows** (§6.5) — cheap once #3's
   collector exists (same fetch pattern, different layer).
5. **`relationships` table** (§6.4) — needed before any cross-category scoring (Opportunity's
   Infrastructure/Catalyst-proximity dimensions, §8) can be more than a live client-side guess.
6. **CIP / capital improvement plans** — already partially flowing through `investments` and
   `shifts`; formalize with a dedicated collector once #3 proves the non-PDF pattern.
7. **Major infrastructure projects** — same, already flowing through `shifts`/`investments`.
8. **Major catalysts** — already has a real table and admin UI; add `catalyst_score` (§9).
9. **Ownership / distress signals** — genuinely last, and the most jurisdiction-variable (county
   assessor/treasurer formats differ the most) — tackle per-market during onboarding (§14) rather
   than as one shared collector.

---

## Sources Currently Missing from the Codebase

The concrete answer to Part 20 item 14:

- Any API/GIS/CSV-based collector at all — every existing collector is PDF-only.
- County assessor / parcel data (table exists, 0 rows, no owner/value columns yet).
- City limits, annexation boundary, future land use, urban growth boundary layers (no data; table
  shape already supports them via `zoning_land_use.layer_type`).
- County treasurer/recorder (tax delinquency, foreclosure) and code enforcement — zero collection,
  100% manual admin entry today.
- Census/BLS/ACS direct API integration for `market_indicators` (currently populated by hand).
- Utility provider service-boundary/capacity data (no dataset, only inferred from free text).
- A scheduler — nothing runs automatically today.
