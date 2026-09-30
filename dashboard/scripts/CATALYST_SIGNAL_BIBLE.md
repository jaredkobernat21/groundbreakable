# Catalyst Signal Bible

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

## Potential Data Center — signal categories (controlled vocabulary)

These map directly to the `signal_categories` field on a `potential_data_center` catalyst
(`lib/catalysts/dataCenterSignal.ts`).

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
| `water` | Large water-service request, new main extension into undeveloped industrial land, treatment/pump-station capacity expansion | Medium |
| `natural_gas` | New gas pipeline capacity, large service request, proposed on-site generation (turbines, fuel cells, microgrid, battery storage) | Medium |
| `engineering_consultant` | Surveying, geotechnical, environmental, wetland delineation, traffic, transmission/substation engineering contracts — especially from a firm with a mission-critical track record | Medium |

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
