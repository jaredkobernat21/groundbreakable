# Catalyst Signal Bible

## Naming note (2026-10-02) -- read this before anything else below

The Data Center stage model is now **three** tiers, not two: **Potential → Possible → Planned**.
This section only exists because the DB column value `potential_data_center` and the new UI label
"Potential" are NOT the same thing, and conflating them will cause real mistakes:

- **Planned** -- `catalyst_type = 'data_center'`. A confirmed project.
- **Possible** -- everything the rest of this doc originally called "Possible" or "Potential Data
  Center," unchanged in meaning: `catalyst_type = 'potential_data_center'` (an *active, forming*
  signal investigation -- land assembly, a substation being built now, an LLC land purchase) OR any
  other catalyst_type carrying at least one tagged `signal_category` (standing infrastructure
  capacity, with or without active movement). The DB value is still literally named
  `potential_data_center` for backward compatibility -- don't be confused by the word "potential"
  there; in the 3-tier UI it renders as "Possible."
- **Potential** (genuinely new, Jared's full spec 2026-10-02) -- `catalyst_type =
  'prospective_data_center_site'`. Strong underlying fundamentals (power, land, fiber, incentives,
  entitlement feasibility, environmental risk, water/cooling, transportation/workforce) with **no
  known data-center activity at all** -- no proposal, pursuit, rumor, permit, rezoning, land
  assembly, or development. See the dedicated section below for the full rubric. This is a
  *site-selector* exercise (where should a data center go that nobody's looking at yet), not a
  *signal-detector* exercise (what's quietly happening here already) -- that distinction is the
  whole point of keeping it a separate tier instead of folding it into Possible.

Pin color: Potential is green, Possible is amber, Planned is the existing confirmed-data-center
plum (`lib/catalysts/dcStage.ts`'s `DC_STAGE_COLOR_HEX`) -- Potential is deliberately rendered
smaller/softer on the map than the other two, since it should read as the most exploratory of the
three.

What to look for, and where, when curating a Catalyst — Groundbreakable's earliest-signal
category: major planned or emerging events that could materially change where development
becomes feasible, valuable, or necessary, ideally before permits are issued and before the
broader market reacts. Read this before adding or editing a row via `/dashboard/admin/catalysts`,
and before a SLADE-assisted research pass logs one. There is no automated collector for this
category yet (see `docs/DATA_INTELLIGENCE_PIPELINE.md` for what's built vs. not) — every Catalyst
today is hand-curated, so this doc is the checklist a human or an AI research session works from.

## The one rule that matters most

**A Catalyst is not generic news or ordinary planning activity, and an unconfirmed one must never
be stated as confirmed.** The differentiation Groundbreakable is built on isn't "this project
exists" — it's *how early* the signal was caught, *where* it will matter geographically, and *what
development opportunity it could create*. For the Potential Data Center sub-type specifically: a
single signal (one substation, one land purchase, one vague press release) is never enough on its
own. Require signals from multiple independent categories before assigning any confidence level,
and always phrase an unconfirmed finding as "signal pattern is consistent with a potential
large-load technology or data center campus" — never as a stated fact.

## Core catalyst types and what counts

Only classify something as a Catalyst when it's significant enough to influence surrounding
development — not every rezoning or every warehouse lease qualifies.

1. **Data Centers & Major Employment** — proposed data centers, manufacturing plants,
   distribution/logistics centers, corporate campuses, large employer expansions, research/tech/
   industrial campuses.
2. **Utility & Infrastructure Expansion** — sewer/water main extensions, wastewater treatment
   expansion, new substations/major electrical capacity, natural gas infrastructure, fiber/
   broadband expansion — anything that opens previously difficult-to-develop land.
3. **Schools & Institutional** — new schools, district land purchases, university/college
   expansions, hospitals/medical campuses, major public/government facilities.
4. **Transportation & Access** — new interchanges, highway widening, new arterial roads, bridges,
   rail/transit expansion, airport expansion, new roads opening undeveloped areas.
5. **Large Residential Development** — master-planned communities, large subdivisions, major
   multifamily projects, hundreds/thousands of proposed units.
6. **Major Commercial / Destination Anchors** — big-box anchors, grocery anchors, large mixed-use,
   sports complexes, entertainment districts, hotels/convention facilities.
7. **Government-Backed Growth** — TIF districts, STAR bond districts, incentive packages,
   redevelopment districts, public-private partnerships, major municipal investment programs.
8. **Annexation & Growth Corridors** — planned annexations, comprehensive-plan growth areas,
   future land-use changes, land outside city limits likely to get utilities or annexation.
9. **Major Land-Control Events** — large land assemblages, institutional land purchases, a
   developer quietly acquiring multiple adjacent parcels, large farm/estate sales.

## Where to look, per type (search these before the project is publicly announced)

- **Data centers / major employers**: economic development authority agendas, city/county
  commission agendas, incentive negotiations, tax abatement discussions, industrial revenue bond
  discussions, utility capacity/large-load requests, substation planning, land-option agreements,
  rezoning/annexation requests, environmental reviews, state economic-development announcements,
  large LLC land purchases, utility-provider capital plans.
- **Schools**: school board agendas/minutes, capital improvement plans, bond proposals, long-range
  facilities plans, enrollment-growth studies, district land purchases, architect/engineer RFPs,
  site-selection discussions, bond election materials. The goal is to catch it at site selection or
  land purchase — not when the building permit appears.
- **Sewer / water / utilities**: capital improvement plans, utility master plans, wastewater
  master plans, sewer basin studies, engineering RFQs/RFPs, council funding approvals, bond issues,
  utility board meetings, developer reimbursement agreements, special assessment districts, state
  revolving fund applications, federal/state infrastructure grants.
- **Roads / interchanges**: MPO transportation plans, state DOT long-range plans, transportation
  improvement programs, city CIPs, corridor studies, environmental studies, engineering contracts,
  right-of-way acquisition, funding allocations, interchange feasibility studies.
- **Large residential**: pre-application meetings, concept plans, rezoning, preliminary plats,
  annexation, developer land acquisitions, utility-extension agreements, planning commission
  packets.
- **Commercial anchors**: developer site plans, land purchases, rezoning, anchor-tenant
  references, brokerage marketing materials, TIF applications, corporate real-estate
  announcements.
- **Annexation / growth corridors**: comprehensive plans, future land-use maps, annexation
  studies, utility service-area plans, council strategic plans, boundary agreements between
  municipalities.

Favor primary public sources first (agendas, board minutes, utility filings, state DOT/MPO
documents, corporate registrations, deed records), then reputable secondary sources (local
business journals, development news) for confirmation.

## "Possible" Data Center Criteria

This is the baseline bar for the dashboard's "Possible" stage (`lib/catalysts/dcStage.ts`) — it
applies to a catalyst of *any* `catalyst_type`, not just `potential_data_center`. It's a different,
broader question than the "Potential Data Center" investigation below: not "is a specific project
forming here," but

> "Based on existing power, land, utility, connectivity, and entitlement conditions, this area
> appears capable of supporting future data-center development."

**Possible does NOT mean a data center is coming.** Identify sites or areas that are already
capable of supporting a large data center, or have infrastructure that makes one realistically
feasible, even if there is no current data center proposal or active infrastructure project.

Conditions to weigh:

- Access to major high-voltage transmission lines
- Nearby substations with meaningful large-load potential
- Sufficient regional power generation and grid capacity
- Large contiguous developable land
- Industrial or data-center-compatible zoning
- Strong fiber connectivity / multiple fiber routes
- Adequate water and sewer capacity where required
- Reasonable access to major roads and construction infrastructure
- Utility territory capable of serving large commercial/industrial loads
- Limited major environmental, flood, topographic, or land-use constraints
- Local government/economic-development environment reasonably supportive of large industrial
  investment

When writing up a site, weigh **several** of these together rather than resting the case on one —
a credible Possible write-up should name the strongest supporting factors, especially power
availability, not just check one box. (The two constraint-style items — environmental/flood/
topographic limits, and the local-government posture — aren't things you "find a source for" the
way a substation or a land purchase is; note them as due-diligence context in `why_it_matters` or
`related_context` rather than trying to force them into a `signal_categories` tag.)

**Existing infrastructure alone can qualify an area** — do not require a new infrastructure
project or an active development signal. A substation that's been there for fifteen years with
unused large-load capacity, or zoning that's simply been industrial for a decade, is just as valid
a "Possible" factor as something newly announced. That's the key difference from the "Potential
Data Center" investigation below, which is specifically about *detecting active, forming*
signals — this is about *standing capacity*, whether or not anything is currently happening there.

**Scope to specific sites, corridors, or service areas** — a utility's service territory, a named
industrial corridor, a specific parcel or assemblage, a substation's realistic service radius.
Never label an entire city "Possible" on the strength of one fact about it somewhere.

Most of the signal categories in the table below already cover these conditions (`power` for
transmission/substations/grid capacity, `land_assembly` for developable land, `rezoning` for
zoning, `fiber`, `water` for water/sewer, `government_incentives` for a supportive
economic-development posture) plus `transportation_access` for road/highway/construction access.
Tag whichever apply on the catalyst, the same controlled vocabulary used for the Potential Data
Center investigation — a single tagged category is enough for the catalyst to render as "Possible"
on the live dashboard (Jared's call, 2026-10-02: don't require multiple before it's visible), but
the write-up itself should still make the multi-factor case, not lean on one tag alone.

## Potential Data Center Sites — fundamentals without activity

This is a different exercise from everything else in this doc. Every other section is about
*detecting* something already moving (even faintly). This section is about *recognizing* a
location is well-suited **before** anything is happening there at all -- think like an early-stage
data-center site selector looking for overlooked markets and sites before competitors start
pursuing them. Prioritize a handful of genuinely exceptional candidates over a large volume of
weak, speculative ones -- a few defensible Potential sites are worth more than hundreds of pins.

**The strict rule, in full**: a location only qualifies as Potential when (1) its underlying
infrastructure, land, economics, government environment, connectivity, and development conditions
make it legitimately attractive for data-center development, **AND** (2) there is no credible
indication a data center is already being pursued there. Before adding any Potential location,
actively search combinations of the city, county, utility, parcel/site, landowner, nearby
industrial park, economic-development organization, and relevant companies against:
`data center`, `datacenter`, `hyperscale`, `AI campus`, `compute campus`, `cloud campus`, `server
farm`, `digital infrastructure`, `data center rezoning`, `data center permit`, `data center utility
request`, `data center land acquisition` (constant: `POTENTIAL_SITE_NEGATIVE_SEARCH_TERMS` in
`lib/catalysts/potentialSiteCriteria.ts`). If any of that search turns up credible evidence, the
finding belongs under Possible or Planned instead -- never classify it as Potential. A municipality
actively recruiting data centers specifically can itself be evidence an actual project is already
underway -- investigate further before treating recruitment posture alone as a clean Potential
signal.

### The 8 factors and their weights (sum to 100 -- see `POTENTIAL_SITE_FACTOR_WEIGHT`)

1. **Power + Grid Scalability — 30%** (the single most important factor). Look for high-voltage
   transmission infrastructure, substations, multiple transmission paths, proximity to generation,
   utility territory capable of serving major industrial loads, existing large industrial power
   users, planned *general* grid improvements with no named data-center customer, retired/retiring
   industrial or generation sites with valuable electrical infrastructure left behind, room for
   substantial future electrical expansion, natural-gas infrastructure that could support
   behind-the-meter generation, and renewable generation where applicable. Distinguish **confirmed
   capacity** from **infrastructure merely indicating potential capacity** -- transmission lines or
   a substation nearby never means capacity is actually available; never invent an MW figure.
2. **Land + Expansion — 15%**. ~100+ contiguous developable acres for a major campus (200-500+
   acres where available), relatively flat terrain, limited parcel fragmentation, large parcels
   under one or few owners, industrial or agricultural land, room for buildings/substations/
   generators/cooling/setbacks/security, strong road access. Can represent a specific parcel OR a
   broader development corridor when parcel-level selection is premature.
3. **Fiber + Connectivity — 15%**. Long-haul fiber routes, multiple carriers, redundant network
   paths, interstate/rail/utility corridors likely supporting fiber, nearby network nodes,
   connectivity to major metros, latency considerations, potential to extend fiber into the site.
   Favor locations where multiple geographically diverse routes may eventually be available.
4. **Government + Incentives — 10%**. Data-center/sales-tax exemptions, property-tax abatements,
   PILOT, industrial development incentives, economic-development grants, TIF or similar districts,
   utility economic-development programs, expedited permitting, development-ready industrial
   areas, favorable local economic-development policy. Weigh local government attitude toward large
   industrial/infrastructure investment -- positive signals include active recruitment of major
   capital investment, streamlined industrial permitting, infrastructure investment, available
   industrial land, strong economic-development agencies; negative signals include data-center
   moratoriums, restrictive zoning, major community opposition, prohibitive utility/environmental
   policy. (Recruitment specifically aimed at data centers is a yellow flag for Potential, not a
   green one -- see the strict rule above.)
5. **Development + Entitlement Feasibility — 10%**. Current zoning and likelihood of
   industrial/data-center use, comprehensive/future land-use plans, annexation feasibility,
   permitting environment, setbacks, noise restrictions, height restrictions, neighboring uses,
   entitlement difficulty, jurisdictional complexity. Prefer areas where large-scale industrial
   development appears reasonably feasible.
6. **Physical + Environmental Risk — 10%**. Evaluate and penalize floodplain, wetlands, wildfire,
   seismic, hurricane/storm-surge, extreme weather exposure, airport runway zones, hazardous
   industrial neighbors, major rail safety exposure, protected lands, difficult terrain, and
   significant environmental constraints. A strong Potential site has manageable mission-critical
   infrastructure risk.
7. **Water + Cooling Feasibility — 5%**. Municipal water infrastructure, wastewater capacity,
   reclaimed-water opportunities, treatment facilities, cooling climate, water scarcity, likely
   cooling constraints. Do not automatically reject a site lacking major water availability --
   different data-center cooling architectures have different requirements.
8. **Transportation + Workforce — 5%**. Interstate/highway access, airport proximity, construction
   workforce, electrical/mechanical/utility contractors, engineering resources, industrial
   workforce, access to a nearby metro.

### Scoring

Assign each candidate a **Potential Score** (0-100) by summing the per-factor points a researcher
assigns against documented evidence (`sumPotentialScore` in `lib/catalysts/potentialSiteCriteria.ts`
-- a straight sum against each factor's weight-as-max, not a formula derived from other columns,
since factors like terrain flatness or government attitude aren't boolean data this schema holds
elsewhere). **Never display false precision** -- a factor with no real evidence gets 0 points and
a populated list of unknowns, not a guessed number. Record evidence and unknowns per factor
(`PotentialScoreComponent`), not just a final number with no paper trail.

### The card: 4 pillars, not 8 factors (Jared's clarification, same day)

The map itself stays simple -- **Potential / Possible / Planned**, nothing more, no new top-level
categories for entitlement, community opposition, city approval, or utility timelines. Those
become evaluation factors **inside** every Potential site's profile instead. When someone opens a
Potential site, the card leads with the **Potential Score** (e.g. "87/100"), then four scannable
pillars, each expandable into supporting detail:

- **Power** -- `power_pillar_label` (`strong`/`moderate`/`weak`/`unknown`) + `power_notes`.
- **Site** -- `site_pillar_label` (`strong`/`moderate`/`weak`/`unknown`) + `land_notes` (Land /
  Expansion), `fiber_notes` (Fiber), `risk_notes` (Environmental / Physical Risk).
- **Approval** -- `approval_pillar_label` (`favorable`/`moderate`/`difficult`/`unknown`, a
  holistic judgment, not a mechanical rollup) + three independently-evaluated sub-signals:
  - `entitlement_velocity` (`favorable`/`moderate`/`difficult`/`unknown`) + `entitlement_velocity_notes`
    -- researched against comparable major industrial/infrastructure/manufacturing/warehouse/energy
    project timelines in that jurisdiction (rezoning, CUP, planning commission, council, annexation,
    development-agreement timelines; frequency of delays/continuances; whether expedited review
    exists; historical approval rates).
  - `city_receptiveness` (`high`/`moderate`/`low`/`unknown`) + `city_receptiveness_notes` --
    documented evidence of city support for major investment (incentives offered, public statements,
    infrastructure investment, industrial recruitment, supportive planning policy). A city actively
    recruiting data centers *specifically* is a yellow flag for Potential, not a clean receptiveness
    signal -- investigate further before assuming it's just posture.
  - `community_friction` (`low`/`moderate`/`high`/`unknown`) + `community_friction_notes` --
    documented public-hearing opposition, petitions, organized resistance, lawsuits/appeals, repeated
    controversy around comparable major projects (power infrastructure, industrial uses, warehouses,
    substations, manufacturing). **Never predict community reaction without evidence** -- `unknown`
    is the honest default when evidence is thin, not an assumed "low" or "high."
  - `incentives_notes` and `development_environment_notes` (zoning, comprehensive plan, annexation
    feasibility, permitting specifics) round out the Approval pillar's supporting detail.
- **Infrastructure** -- delivery/timeline feasibility specifically (utility interconnection
  process, published or historical large-load delivery timelines, transmission/substation
  requirements, water/sewer/road/fiber extension, nearby infrastructure projects) -- distinct from
  Power (does capacity exist at all) and Site (the parcel's own characteristics). Its card-level
  label IS `utility_timeline` (`favorable`/`moderate`/`long`/`unknown`) + `utility_timeline_notes`
  -- no separate rollup column, since Jared's spec names Utility Timeline as this pillar's one
  headline metric. **Never invent a delivery date or capacity figure** -- only state a numerical
  timeline when a real source documents one.

Every label above is a categorical, evidence-backed judgment a researcher assigns -- never
mechanically derived, never asserted without evidence, and `unknown` is always an honest, expected
answer when the research genuinely didn't turn up enough to say more. The underlying 8-factor
scoring detail (`POTENTIAL_SITE_PILLAR_FACTORS` in `lib/catalysts/potentialSiteCriteria.ts`) still
feeds the 0-100 `potential_score`/`potential_score_components` and renders as each pillar's
"supporting details" on expand -- the 4-pillar card is a display/organization layer on top of that
scoring, not a replacement for it.

### What every Potential write-up must include

Store on the `catalysts` row (columns added in
`20261002070000_add_potential_data_center_site_catalyst_type.sql` and
`20261002080000_add_potential_site_approval_infrastructure_pillars.sql`, meaningful only for
`catalyst_type = 'prospective_data_center_site'`):

- **Location** -- `address` (city/county/state).
- **Opportunity Area** -- `opportunity_area`: the specific parcel, industrial area, utility
  corridor, or approximate geographic zone.
- **Potential Score** -- `potential_score` + `potential_score_components` (the per-factor
  breakdown).
- **Why It Stands Out** -- `why_it_matters`: 2-4 concise sentences on why this could make sense as
  a future data-center location (reuses the field every other catalyst type already has).
- **The 4 pillars** -- see above: Power, Site, Approval (+ its 3 sub-signals), Infrastructure
  (Utility Timeline).
- **Unknowns to Verify** -- `unknowns_to_verify`: an explicit list of what still needs utility,
  fiber, engineering, environmental, or jurisdictional confirmation. A Potential row with an empty
  list hasn't actually been researched -- every real write-up should have some.
- **Why This Is Still "Potential"** -- `why_still_potential`: a statement such as "No credible
  public evidence was identified indicating that a data center is currently proposed, planned, or
  being pursued at this location."
- **Sources and date researched** -- `source_id`/`additional_source_ids` + `last_verified_at`, same
  as every other catalyst.

A Potential site should **not** qualify simply because it has vacant land near transmission lines --
the best Potential sites are places where Power + Site + Approval + Infrastructure all align
*before* any known data-center project appears, not just one favorable factor among several unknowns.

Groundbreakable should never claim a Potential location is a confirmed data-center site. The point
is surfacing places worth additional investigation because the fundamentals align with major
site-selection requirements -- nothing more.

**Future filtering** (not yet built, per Jared's 2026-10-02 note: "allow Potential results to
eventually be filtered by attributes such as" Strong Power, Fast/Favorable Approvals, Low Community
Friction, Favorable Utility Timeline, Strong Incentives, Large Land, Strong Fiber) -- the columns
above already carry exactly the categorical values such a filter would read; no schema changes
should be needed when that UI gets built, just a filter control reading these same fields.

## Potential Data Center — Priority #1 is power

**Detect large power demand before the project is named.** Power is now the single highest-priority
signal category — the core question to keep asking is *"what known project explains this new power
demand?"* If nothing publicly identified explains it, escalate. Do not require the words "data
center" to appear anywhere — look for the *combination* of power, land, utility, government, and
development activity.

**Where to find power signals:**
- **Electric utilities**: integrated resource plans, long-term load forecasts, capital improvement
  plans, transmission planning reports, substation project documents, public board agendas, rate
  cases, large-load tariffs, economic development utility programs.
- **RTO/ISO** (MISO, SPP, PJM, ERCOT, CAISO, NYISO, ISO-NE, depending on market): transmission
  planning, load additions, load forecasts, reliability projects, new substations, large-load
  studies, generator/load interconnection queues, regional transmission expansion plans.
- **State utility regulators** (public utility commission / corporation commission filings):
  certificates of convenience and necessity, new transmission infrastructure, rate cases, special
  contracts, large-load tariff requests, utility capital expenditures, customer-specific
  infrastructure, expedited transmission projects, large industrial customer references.
- **Local government**: utility easements, substation rezoning, land acquisitions, rights-of-way,
  utility agreements, franchise agreements, infrastructure reimbursement agreements, annexation for
  electric service.

**Power signal thresholds** (`POWER_LOAD_THRESHOLDS_MW` in `lib/catalysts/dataCenterSignal.ts`) —
these are thresholds for investigation, not proof of a data center:

| New/unexplained load | Read as |
|---|---|
| 20–50 MW | Investigate |
| 50–100 MW | Strong industrial/large-load signal |
| 100–300 MW | Very strong data-center / major industrial signal |
| 300 MW+ | Extremely high-priority investigation |

**Power capacity vs. power proximity** — do not assume a parcel is viable just because transmission
lines run nearby. Proximity is physical closeness; capacity is *actual evidence the grid can serve
a very large load there* (available/planned substation capacity, committed transmission upgrades,
customer-specific improvements, scheduled energization dates). Prioritize capacity evidence over
proximity alone.

**Substation detection** — for each proposed or expanded substation, capture voltage, estimated
capacity, project cost, construction timeline, the stated reason for the project, and whether the
load is named or unnamed (record these in the catalyst's `description`/`related_context`, there's
no dedicated column for each). Ask: is this being built for general system growth, or one very
large prospective customer? If documentation references "large load," "new customer," "economic
development load," "industrial customer," "confidential customer," or "future customer," treat
that as a strong reason to raise `power_load_mw`/investigate further — these phrases are exactly
the kind of vague terminology worth logging under `vague_terminology` as a second category too.

**Large Load Anomaly** — the specific pattern worth flagging most urgently: planned electrical
demand appears significantly greater than what known local development explains (e.g., known area
demand growth is 25 MW, but a utility suddenly plans 350 MW of additional capacity with no
announced corresponding development). Log this under the `infrastructure_anomaly` category with
the MW figure recorded in `power_load_mw`, and once flagged, automatically check the same geography
for land acquisitions, zoning, incentives, other utilities, fiber, and engineering activity.

## Signal categories (controlled vocabulary)

These map directly to the `signal_categories` field on any catalyst
(`lib/catalysts/dataCenterSignal.ts`) — tag them on a `potential_data_center` catalyst for the
converging-evidence investigation below, or on a catalyst of any other type for the baseline
"Possible" criteria above.

| Category | What it is | Weight |
|---|---|---|
| `power` | New 115kV/230kV/345kV+ substation, transmission upgrade, large-load service request, interconnection study, MW references disproportionate to local demand | Highest |
| `known_developer_entity` | A newly formed LLC, or a connection traced to a known data-center developer/site-selection firm via registered agent, attorney, or parent entity | Highest |
| `land_assembly` | 50–1,000+ contiguous acres assembled, multiple adjacent parcels purchased in a short window, options rather than closed sales, price above comparable land values | High |
| `fiber` | New long-haul fiber routes, multiple carriers entering the same location, dark fiber construction, carrier-neutral infrastructure toward undeveloped acreage | High |
| `government_incentives` | Tax abatement, PILOT, industrial revenue bonds, a confidential/code-named prospect, incentives unusually large relative to the stated project | High |
| `vague_terminology` | "technology campus," "mission critical," "advanced technology facility," "large-load customer," "Project [code name]" — use semantic judgment, not exact-string matching | High |
| `infrastructure_anomaly` | A rural/undeveloped corridor receiving major new power, fiber, water, and road investment with no announced project to explain it | High |
| `rezoning` | Agricultural → industrial rezoning, heavy-industrial zoning, generator/noise standards, campus-scale industrial standards, with no end user named | Medium |
| `water` | Large water/sewer-service request or capacity, new main extension into undeveloped industrial land, treatment/pump-station capacity expansion | Medium |
| `natural_gas` | New gas pipeline capacity, large service request, proposed on-site generation (turbines, fuel cells, microgrid, battery storage) | Medium |
| `engineering_consultant` | Surveying, geotechnical, environmental, wetland delineation, traffic, transmission/substation engineering contracts — especially from a firm with a mission-critical track record | Medium |
| `transportation_access` | Major road/highway access, a new interchange, rail spur, or a site otherwise construction- and logistics-ready | Medium |

**Confidence tiering** (`computeDataCenterSignalConfidence` — never triggers off one category, and
power alone, however large the MW figure, is never sufficient by itself):

Category-combination logic (used whenever no quantified MW figure is on file):
- **Low**: 2 categories.
- **Medium**: 3+ categories, including at least one High/Highest-weight signal.
- **High**: 4+ categories including a power signal, plus land/infrastructure-anomaly/incentive
  evidence.
- **Very High**: power + land assembly + fiber + incentives-or-entity evidence all converge on the
  same site.

MW-threshold logic (used when `power_load_mw` is on file — always still requires at least one
category besides `power` itself):
- **Medium**: ~150 MW+ plus one other category (e.g. a named substation detail plus land activity).
- **High**: ~300 MW+ plus land assembly (or another strong category) and a second corroborating
  category — e.g. *300 MW unexplained load + new substation + 400-acre land assembly + industrial
  rezoning*.
- **Very High**: ~500 MW+ plus land assembly, fiber, and an incentive/entity signal all present —
  e.g. *500 MW+ future load + dedicated transmission/substation + large land assembly + multiple
  fiber routes + confidential incentive project + LLC/entity connected to known data-center
  activity*.

When a location is flagged, the manual investigation workflow is: identify the property owner,
trace the purchasing LLC, check state corporate registration, search the registered agent and
attorneys, look for affiliated developers, search nearby utility filings and government agendas,
search planning/rezoning applications and incentive agreements, identify the engineering firms
involved, and check whether any known data-center developer connects to the entities found. Store
every source and date — this is manual research, not an automated pipeline.

## If you're an AI/agent doing this research directly

Never state that a project — especially a data center — is confirmed unless reliable public
evidence actually confirms it. A single signal, however striking, is never enough to assign a
confidence level; require independent categories to converge before flagging anything. When you do
flag a `potential_data_center` catalyst, phrase the finding as "signal pattern is consistent with
a potential large-load technology or data center campus," record which specific signal categories
you found and why (not just a confidence label with no evidence), cite every source with a real
URL, and leave `signal_confidence` for the scoring function to compute from what you actually
found — don't assign a confidence tier yourself based on a hunch.
