# Potential Data Center Site — Research & Presentation Spec

Consolidated methodology for researching and presenting `prospective_data_center_site` catalysts
(the "Potential" tier of the Data Center product). Built incrementally on 2026-10-04 across the
KC metro sites (Bonner Springs, Eisenhower Road, K-7/McIntyre Road), the 4 additional sites
(National Road Business Park, Middle Tennessee Industrial Center, Ohio Crossroads, Ashland
Business Park), and a dedicated refinement pass on Bonner Springs. This file is the reference for
running the same standard on every future site — read it before starting a new pass, not just
before writing the migration.

Code lives in `dashboard/src/lib/catalysts/potentialSiteCriteria.ts` (source of truth for all
types/labels/scoring) and `dashboard/src/lib/types.ts` (mirrors the same types, kept import-free
by convention). The developer-facing panel is
`dashboard/src/components/map/CatalystIntelligencePanel.tsx`. Schema lives in
`supabase/migrations/` — search for `prospective_data_center_site` to find every touched row.

## 1. The core distinction: research depth vs. presentation

Two completely separate concerns, never conflated:

- **Research depth** — how hard you dig before declaring something unknown. Governed by §2
  below. Never weaken this to make the presentation shorter.
- **Presentation** — what the developer-facing panel actually shows. Governed by §5 below.
  Never let a verbose research trail leak into the panel.

The resolution to "deep research vs. clean presentation" is: **research notes (the prose
`*_notes` columns) carry full research-process detail and are no longer rendered in the panel at
all** — they're internal/historical. The panel renders only structured columns and a small number
of clean, short, researcher-written fields (`why_this_site`, `primary_advantage`, `primary_risk`,
`developer_takeaway`, `next_steps`, `unknowns_to_verify`). The full pass-by-pass research
narrative — what was tried, what a prior pass got wrong, what a geocode mismatch looked like —
lives permanently in the **migration files themselves and git history**. That's the audit trail;
no separate admin UI was built for it, because migrations + git already are that record. Write
your migration's header comment like you're leaving notes for the next researcher, not like
you're writing a commit message nobody will read.

## 2. Research discipline: exhaust before declaring unknown

**Core rule**: "Requires Direct Confirmation" / "Unknown" is the END of the public-record research
process, not a shortcut around it. Don't stop after one general web search. Don't assume a field
is unknowable because the first source didn't have it.

### Escalation hierarchy — work through these in order per fact before giving up on it

1. **General web** — exact site + infrastructure terms, several phrasings.
2. **Official government** — city, county, assessor, GIS, planning, zoning, ordinances, agendas,
   legal notices, comprehensive plans.
3. **Utility/infrastructure** — electric utility, gas pipeline operator, fiber provider,
   water/wastewater utility, RTO/ISO.
4. **Regulatory** — state utility commission, FERC, PHMSA, EPA, FEMA.
5. **Derived research** — cross-reference parcel locations, legal descriptions, streets, plats,
   and infrastructure maps against each other.

### Parcel research workflow (before marking Site Control/ownership unresolved)

Identify streets/addresses/plat names inside the opportunity boundary → search the county
assessor/GIS by address, parcel ID, owner, legal description, AND plat/subdivision name (not just
a park-level name search) → collect parcel ID/address/legal description/acreage/owner/mailing
address/property type per parcel → group by ownership entity → roll up total acreage/contiguous
acreage/largest owner/total owners/total parcels.

Real finds this way: Johnson County's `taxbill.jocogov.org` (a real public tax-bill lookup),
Wyandotte County's ArcGIS REST service (`gisweb.wycokck.org/arcgis/rest/services/GISPUB/...`),
Leavenworth County's Aumentum portal (login-gated, but has a "Parcel Search Public" link worth
pursuing further). **Geocoding gotcha**: always sanity-check a geocode result's returned city/zip
before querying a GIS service against it — one Bonner Springs attempt geocoded to Shawnee, KS
(wrong city entirely) and was correctly discarded rather than queried against bad coordinates.
"Cannot Be Resolved This Pass" is the honest result when a real tool exists but a correct query
wasn't achieved — never silently force a fit.

### Substation/power research workflow (before marking power infrastructure unavailable)

Confirm likely serving utility → search named substations in the city/corridor → search
planning/zoning records for new substations, expansions, transmission projects, easements →
search utility capital-project pages, tariff filings, RTO/ISO documents, state commission
filings, legal notices/ordinances, comprehensive plans, economic-development pages. For each
substation found, collect name/utility/address/approval date/source/approximate
distance/project type (distribution vs. transmission vs. unknown). **Never infer voltage from the
word "substation" alone, and never infer MW headroom merely because a substation exists nearby.**

### Publicly confirmable vs. often genuinely not public

Push research further before calling these "unknown": parcel ownership, parcel IDs, mailing
address, legal description, approximate acreage, zoning, floodplain, service-territory evidence,
named substations + addresses, utility ownership, transmission projects, planned substations,
utility tariffs, large-load rate structures, gas pipeline operator/proximity, fiber carrier
presence, municipal water/wastewater providers.

Fine to land on "Requires Direct Confirmation" for these without exhaustive effort: actual
available substation headroom, exact MW available to the subject parcel, a binding energization
date, final interconnection cost, firm gas deliverability, fiber last-mile engineering
availability, guaranteed water capacity, landowner willingness to sell.

### Confidence vocabulary (`PotentialEvidenceStatus` in `potentialSiteCriteria.ts`)

`verified` / `supported` / `partially_resolved` / `reported` / `estimated` / `indicated` /
`unknown` / `unknown_after_public_record_search` / `requires_verification`

- **Verified** — directly supported by authoritative evidence.
- **Supported** — multiple credible signals, not formally confirmed.
- **Partially Resolved** — the escalation hierarchy found some of the answer, not all of it.
- **Estimated** — Groundbreakable's own derived estimate from available evidence, labeled as such.
- **Unknown** — nothing researched at all.
- **Unknown After Public-Record Search** — deliberately distinct from bare "Unknown": asserts the
  full escalation hierarchy was actually run, not skipped. Earn this value; don't default to it.
- **Requires Direct Confirmation** (DB value `requires_verification`) — likely needs a utility/
  owner/developer phone call or a formal study; the honest end-state for genuinely non-public facts.

Never invent or infer a number from an adjacent fact (never infer MW from transmission voltage
proximity, never infer available acreage from total park acreage, never infer gas capacity from
pipeline proximity alone).

## 3. Power as a gate, not just a weighted factor

The single most important structural lesson from the Bonner Springs refinement pass: a strong
0–100 Potential Score can still mean "not power-qualified." Power doesn't get to be fully
compensated for by strong land/water/entitlement scores — it's tracked as its own gate.

### `power_qualification` (column, type `PowerQualification`)

`unqualified` → `infrastructure_indicated` → `utility_path_indicated` → `capacity_indicated` →
`capacity_confirmed`

- **Unqualified** — large-load path not established.
- **Infrastructure Indicated** — relevant power infrastructure exists nearby.
- **Utility Path Indicated** — public utility plans/tariffs/upgrades support a plausible
  large-load pathway (e.g. a real, named large-load tariff + queue process exists, but nothing
  capacity-specific is confirmed for this site). This is where most researched sites currently
  land — don't be afraid of it.
- **Capacity Indicated** — credible evidence suggests a meaningful large-load opportunity.
- **Capacity Confirmed** — utility-specific capacity has been directly confirmed. Reserve this for
  a real, named MW figure tied to the specific site, not a territory-wide tariff's existence.

Never auto-derive this from `potential_score` or `power_pillar_label`. Assign it honestly from
what was actually found.

### Target Load Profile — demand side vs. supply side

Two different axes that must never be conflated:

- `target_load_mw_low` / `target_load_mw_high` — the DEMAND side: what a buyer needs. Default
  (when both are null) is **50–100+ MW** for the Potential tier (`DEFAULT_TARGET_LOAD_MW_LABEL`
  in code) — a Potential site is presumed evaluated against a large-scale load unless a
  researcher has recorded a specific smaller target for that row.
- `potential_load_mw_low` / `potential_load_mw_high` — the SUPPLY side: what research has actually
  confirmed the site/utility can deliver (e.g. Ohio Crossroads' real, modest 2.7 MW figure).

The whole point of keeping these separate is preventing a small verified MW figure from reading
as sufficient for a hyperscale target just because *a* number exists. `expansion_requirement`
(`minor`/`significant`/`major`/`unknown`) captures how much new infrastructure a researcher
believes would be needed to close that gap, when knowable.

### Development Gates (`development_gates`, jsonb)

A decision screen across 8 categories, NOT a replacement for the detailed sections underneath it:
`power`, `land`, `site_control`, `entitlement`, `btm_gas`, `fiber`, `water`, `environmental` → one
of `green` (sufficiently supported) / `yellow` (promising but unresolved) / `red` (material
weakness/unqualified) / `gray` (insufficient research).

Important: a category can be `green` on its underlying quality (`site_pillar_label: "strong"`)
while its *gate* is `yellow` (ownership/parcel completeness unresolved) — these are different
axes. "Strong land, incomplete parcel roster" is a real, coherent state, not a contradiction.

### Final Developer Assessment (`DeveloperAssessment`)

`discovered` → `screen` → `strong_pursuit` / `pursue` / `watch` / `weak` / `disqualified`

- **Discovered** — identified; no diligence performed yet.
- **Screen** — strong non-power fundamentals justify a utility and site-control screen, but the
  site is not yet power-qualified. Use this instead of forcing "Pursue" just because the score
  cleared some threshold. This is the single biggest behavior change from earlier in this effort:
  Bonner Springs moved from "Pursue" to "Screen" specifically because `power_qualification`
  never got past `utility_path_indicated`, even though its score (72) would have read as strong.
- **Strong Pursuit** / **Pursue** — worth real diligence now.
- **Watch** — interesting, but a major unknown (often a live, unresolved regulatory process —
  e.g. an active moratorium that hasn't been decided) remains.
- **Weak** — fundamentals (often a confirmed-but-modest MW ceiling) don't yet justify deeper work.
- **Disqualified** — a major constraint makes the site unsuitable.

Never pick the assessment by score threshold alone. Check `power_qualification` and
`development_gates` first; let them gate the assessment, not the other way around.

## 4. The narrative-must-never-outrun-the-structured-fact rule

This is the exact bug the Bonner Springs refinement pass caught and fixed: `developer_takeaway`
claimed "water and wastewater capacity are confirmed with available headroom" while the real,
structured fact was `water_capacity_status = 'capacity_indicated'` (city-wide MGD/utilization
numbers exist, but no load-specific allocation study). The prose oversold what the data supported.

**Rule going forward**: before writing any developer-facing prose field (`why_this_site`,
`primary_advantage`, `primary_risk`, `developer_takeaway`), check it against every structured
status field it touches (`available_capacity_status`, `water_capacity_status`,
`power_qualification`, `ownership_coverage`, etc.) and make sure the prose never claims more
confidence than the structured field says. When in doubt, the structured field is the source of
truth; rewrite the prose to match it, not the other way around.

`WaterCapacityStatus`: `infrastructure_verified` (the plant exists, no capacity figure at all) /
`capacity_verified` (a specific large-load capacity figure has been directly confirmed) /
`capacity_indicated` (city-wide headroom numbers exist and suggest room, but no load-specific
study) / `requires_confirmation`. Most researched sites so far land on `capacity_indicated` —
that's normal and honest, not a research failure.

## 5. Presentation standard — what the panel actually shows

The developer-facing panel answers: *what's known, why it matters, what's strong, what's risky,
what's still unconfirmed, what to do next.* It is a professional early-stage site-intelligence
brief, not a transcript of the research process.

**Never show in the panel** (these phrases specifically, and the mindset behind them): "this pass
found," "we were able to identify," "this resolves the earlier uncertainty," "prior research
showed," "research pending" as a bare dead-end, "the last pass missed," "Claude should research,"
"query the GIS directly" (an internal task, not a developer action).

**Prefer** → **over**:
- "Evergy serves the opportunity area." → "After reviewing tariff documents, we were able to
  confirm that Evergy serves the park."
- "Two ownership groups have been identified." → "This pass identified two owners that were not
  found previously."
- "Available MW requires utility confirmation." → "No public evidence was found in this pass
  confirming MW."
- "Full parcel assemblage remains partially resolved." → "A correctly bounded GIS query was not
  completed."

**Panel structure** (top to bottom, per `CatalystIntelligencePanel.tsx`'s `dcStage === "potential"`
branch): site thesis (`why_this_site`, 1–2 sentences, no address repetition) → Final Developer
Assessment banner → Potential Score / Data Confidence → Development Gates grid → Power (incl.
Target Load Profile, Nearby Substation + type, Transmission, Available MW, Time to Power, Utility
Expansion Signals) → Land → Site Control → BTM Energy (Local Gas Utility vs. Transmission Pipeline
Operator kept distinct) → Connectivity + Water (Known Carriers, Fiber Assessment, Water Provider,
Large-Volume Capacity driven by `water_capacity_status`) → Entitlement → Location + Access →
Primary Advantage / Primary Risk → Readiness → Developer Takeaway → Next Actions → What Still
Needs Confirmation → Sources.

Sections render open by default (not collapsed `<details>`) so the site reads in **30–60 seconds**
without clicking; a developer can still collapse any section. Every "always-shown" fact uses a
graceful fallback string ("Requires Utility Confirmation", "Not Yet Identified", "Under
Verification") rather than disappearing when unresolved — except Location + Access, which is
informational-only and fine to omit a row entirely when genuinely not found (never overweight
location relative to power/land).

**No duplication across sections** — each has one job:
- **Site Thesis** — why this site matters (1–2 sentences).
- **Primary Advantage** — the single strongest reason to care.
- **Primary Risk** — the single biggest problem (name it, don't hedge into vagueness).
- **Developer Takeaway** — 3–5 sentences: what's interesting, what's verified, the biggest
  unresolved issue, what should happen next. This is the one place a short synthesis is allowed to
  repeat the gist of Advantage/Risk — but write it as a decision summary, not a rephrasing.
- **Next Actions** — 3–5 items, developer-facing, externally-actionable only (utility inquiries,
  owner contact, operator/carrier confirmation). Never list a Groundbreakable-internal research
  task (e.g. "query the county GIS") as a developer action.
- **What Still Needs Confirmation** — bare noun phrases, no parenthetical justification essay.

## 6. Scoring discipline

`potential_score` stays the existing 8-factor weighted sum (`sumPotentialScore()` — unchanged
mechanics). `power_grid` (weight 30) remains the largest single factor. When a pass surfaces real
new evidence, update that factor's `points` and write the reasoning into its `evidence`/`unknowns`
arrays inside `potential_score_components` (this JSON blob is internal — never rendered directly
to the developer anymore, so it's fine for it to carry as much research detail as useful).

**Don't inflate the score to match optimism.** A pass that genuinely found mixed results (some
facts better, some worse, or just better-labeled) should produce a *small* score change, or none
at all — that's an honest outcome, not a sign nothing happened. Two real examples: Eisenhower
Road's score stayed flat (71 → 71) because land availability got worse news (nearly-full park)
exactly offsetting water capacity getting better news; Bonner Springs moved only 71 → 72 on one
real new fact (a verified gas delivery point), with everything else just getting clearer labels,
not new points.

`computeDataConfidence()` is a separate, purely-derived 0–100 "how much of the important stuff is
actually known" measure — never stored, recomputed from field presence every render. Unknown
information lowers Data Confidence, never the Potential Score itself ("unknown ≠ bad").

## 7. Schema reference (as of 2026-10-04)

All on `catalysts`, meaningful only for `catalyst_type = 'prospective_data_center_site'`:

**Power**: `serving_utility`, `nearest_substation_name`, `nearest_substation_type`,
`transmission_voltage_kv`, `transmission_distance_miles`, `substation_distance_miles`,
`potential_load_mw_low/high` (supply), `target_load_mw_low/high` (demand, defaults to 50–100+ MW
when null), `expansion_requirement`, `available_capacity_status`, `power_qualification`,
`utility_expansion_signals`, `interconnection_notes` (internal), `power_notes` (internal).

**Land**: `total_acreage`, `available_acreage_status`, `contiguous_acreage`, `parcel_count`,
`zoning_status`, `land_notes` (internal).

**Site Control**: `owners` (jsonb array — see `OwnerInfo`), `ownership_coverage`
(`full`/`partial`/`research_pending`), `people.owner` (legacy single-owner fallback, see
`ownersOrLegacyOwner()`).

**BTM Energy**: `gas_pipeline_operator` (LOCAL distribution utility — e.g. Atmos Energy),
`gas_transmission_operator` (separate upstream TRANSMISSION pipeline company — e.g. Southern
Star — do not conflate the two), `gas_pipeline_distance_miles`, `gas_pipeline_diameter_in`,
`btm_potential_status`, `air_permitting_notes`, `natural_gas_notes` (internal).

**Connectivity + Water**: `fiber_carriers` (text array), `fiber_notes` (short clean assessment,
not internal-only — this one IS rendered), `water_notes` (short clean provider line, rendered),
`water_capacity_status` (the real source of truth for capacity claims — see §4).

**Entitlement**: `zoning_status` (shared with Land), `approval_pillar_label`, `floodplain_status`,
`floodplain_constrained`, `entitlement_velocity`/`city_receptiveness`/`community_friction` (+
their `*_notes`, internal), `incentives_notes` / `development_environment_notes` (internal).

**Location + Access**: `location_access` jsonb — `kc_metro_position`, `interstate_name`,
`interstate_distance_miles`, `k7_distance_miles`, `airport_distance_miles`,
`airport_drive_minutes`, `rail`, `industrial_context`, `residential_buffer_miles`. All optional;
never overweight relative to power/land.

**Decision layer**: `potential_score` / `potential_score_components` (explainable 8-factor sum),
`development_gates` (jsonb, 8 keys → green/yellow/red/gray), `developer_assessment`,
`developer_takeaway`, `primary_advantage`, `primary_risk`, `why_this_site`, `readiness_stage` /
`readiness_notes`, `next_steps[]`, `unknowns_to_verify[]`, `why_still_potential`.

## 8. Process for running this pass on a new site

1. **Check what's already there.** Read the row's full history across every migration that's
   touched it (search the title in `supabase/migrations/`). Don't re-derive known facts.
2. **Research** using the escalation hierarchy (§2) for whatever's genuinely unresolved. A single
   fork (if delegating) can usually do the promotion-of-known-facts + escalation-research +
   clean-writeup in one pass for a site that's never been touched; a narrower fork is fine for a
   refinement pass on a site that's already been researched once.
3. **Assign the decision layer honestly**: `power_qualification` first (it's the gate), then
   `development_gates`, then `developer_assessment` — in that order, not score-first.
4. **Write clean presentation text** per §5 for every rendered field, and check it against §4
   before finalizing.
5. **Write the migration**: full research narrative in the header comment (this is the permanent
   audit trail — write it for a future researcher, not a changelog bot), then the `update
   catalysts` statement with short/clean field values. Insert new `sources` rows only when you
   have a real, specific URL — never a placeholder.
6. **Validate before reporting**: apostrophes escaped (`''`) everywhere inside the actual SQL body
   (comments don't need escaping — `--` runs to end of line regardless), every jsonb block parses
   and (for `potential_score_components`) sums to the declared `potential_score`, every
   `source_type` value is one of `agency_document`/`agency_gis`/`press_release`/`news`/
   `public_record`/`other` (check constraint), `tsc --noEmit` and `npm run build` clean if any code
   changed.
7. **Report findings, then wait for explicit go-ahead before `supabase db push`** — this is a live
   production database. Commit/push to git only after the DB push, and only the files actually
   touched (check `git status` — this repo tends to carry unrelated uncommitted work from other
   threads; never sweep it into your commit).
