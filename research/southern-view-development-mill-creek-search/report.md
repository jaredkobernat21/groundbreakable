# Southern View Development (Joey Locker) — Mill Creek Sewer Corridor Site Search

2026-09-29. LODE run for Joey Locker, lead developer at Southern View Development. Ask: find
Tennessee land (Nashville or elsewhere in-state) positioned to gain value from a real, planned
infrastructure or entitlement expansion — specifically parcels near a planned sewer expansion
route. Written into SLADE (`slade_sites`/`slade_site_facts`/`slade_opportunities`,
`opportunity_status = discovered`) as it was found — this doc is the narrative version.

## 0. Method

1. Searched for a real, currently planned/funded sewer or infrastructure expansion in Tennessee.
   Found one: Metro Water Services' **Nolensville Sewer Replacement Project (#25SC0020)** —
   ~5 miles of 12"–24" sanitary sewer main along Mill Creek replaced with 18"–42" main,
   Council District 4, November 2026–November 2028, contractor Garney Construction, explicitly
   stated purpose "to accommodate the growth in the area." Source:
   [nashville.gov/departments/water/projects](https://www.nashville.gov/departments/water/projects).
2. The published description gives the creek and the council district but not exact
   construction-limit coordinates — no source found states the precise 5-mile sub-segment.
   Rather than guess, pulled Mill Creek's real course from the **USGS National Hydrography
   Dataset** (NHD, `hydro.nationalmap.gov`, layer "Flowline – Large Scale", `gnis_name = 'Mill
   Creek'`) — 54 real flowline segments across the whole Davidson County course of the creek.
3. Anchored the search to Council District 4 using a real data point already on file: this
   session's own `entitlement_cases` collector previously pulled a real, government-sourced case
   (2025Z-005PR-001, 6355 Nolensville Pike) whose `council_district` field literally reads
   `"04 (Mike Cortese)"` — the same district the sewer project is in. Filtered the 54 NHD segments
   to the 21 within 3 miles of that anchor point (36.016, -86.706) as the real, defensible working
   corridor, clearly short of claiming those 21 segments are the exact construction limits.
4. Queried Nashville's own parcel data (already loaded in this project's `parcels` table —
   287,090 real Davidson County parcels from Metro Nashville's Cadastral/Parcels GIS layer,
   collected 2026-09-29 for the Groundbreakable product itself) for every parcel within 700 ft of
   that real creek corridor, ≥1.5 acres, via a direct PostGIS `ST_DWithin` distance query —
   `parcels.geom` against the real NHD creek geometry.
5. Ranked results to surface privately-owned, currently low/lower-intensity-zoned, substantially
   vacant parcels first — the shape of parcel most likely to see real upside once trunk sewer
   capacity actually lands, versus already-built-out sites.

## 1. Why this corridor, specifically

Independent confirmation this is a real, active growth corridor, not just a sewer project on
paper: this same session's Council-zoning collector (Legistar, Metro Nashville) already found two
**real, recently-approved** rezonings a few miles north on the same road —
**6355 Nolensville Pike** (AR2A → SP, 9.9 ac, approved) and **6309 Nolensville Pike** (AR2A → SP,
9.9 ac, approved) — both in Council District 4, both AR2A-to-denser-use, the same rezoning pattern
this search is betting the Mill Creek parcels below could follow next.

## 2. Candidates

All acreage/zoning/owner/value figures below are from Metro Nashville's own assessor record
(Cadastral/Parcels GIS layer), checked 2026-09-29 — not listing data, not a third-party estimate.

### PRIMARY — 14446 Old Hickory Blvd (parcel 17300008500)

- **83.63 acres**, zoned **AR2A** (low-density/rural-residential) — genuine upzoning headroom.
- **$0 improvement value / $2,054,500 land value** — confirmed 100% raw/undeveloped land, not a
  teardown play.
- **0 ft from the Mill Creek corridor** — the parcel boundary itself touches the NHD-sourced creek
  line.
- Owner of record: **Albatross To Home At Old Hickory, LLC**.
- Largest, cleanest candidate found: private ownership, fully vacant, directly on the corridor,
  zoned for exactly the kind of use (rural/low-density) that has real room to move once capacity
  constraints ease.

### SECONDARY — 0 Brittany Park Dr (parcel 16200029600)

- **29.01 acres**, zoning code RS20/RS7.5, but the assessor's own land-use field reads
  **"VACANT ZONED MULTI FAMILY."**
- **$3,000,000 land value / $0 improvement.**
- **98 ft from the Mill Creek corridor.**
- Owner of record: **Millwood Housing Partners III, LLC**.
- Lower execution risk *if* the multi-family designation reflects a real, current entitlement —
  flagged `needs_verification` in SLADE, not `verified`, since the assessor land-use code isn't
  the same as a direct Metro Planning zoning-ordinance confirmation.

### SECONDARY — 0 Hickory Hollow Pkwy (parcel 16300007000)

- **22.28 acres**, zoned AR2A, **215 ft from the corridor**, $371,000 land value, $0 improvement.
- Owner of record: **5135 Hickory Hollow, LLC**.
- Sits near the Hickory Hollow / Global Mall redevelopment area — a separately well-documented
  Nashville growth corridor. Worth checking whether this owner has other holdings nearby before
  outreach (possible existing relationship or plan Southern View should know about going in).

### FLAGGED — 0 Barnes Rd (parcel 17300001700)

- **50.43 acres**, zoned AR2A, **327 ft from the corridor**, $1,534,100 land value, $0
  improvement.
- Owner of record: **Columbia Gulf Transmission, LLC** — a natural-gas pipeline transmission
  company. Real, specific risk: this ownership strongly suggests an existing pipeline easement or
  right-of-way crosses some or all of the parcel, which would reduce genuinely buildable acreage
  below the assessor's raw number. Needs a title/plat check before this goes any further — not
  disqualifying on its own, but a materially different risk profile than the other three.

## 3. What's NOT confirmed yet (read before doing anything with this)

- **Exact construction limits of the sewer project.** Every public source says "approximately 5
  miles along Mill Creek" — none give exact start/end coordinates. The 700 ft proximity figures
  above are real geometric distances to the creek itself, not confirmation a given parcel sits
  inside the actual construction segment. Next step: call Metro Water Services (project contact
  Justin Pendley) directly for exact limits.
- **No owner contact attempted on any candidate.** All four are `listing_status = unknown` and
  `slade_sites.status = researching`, not `verified`.
- **No conflict check run** — mandatory per `SLADE/docs/VERIFICATION.md` before anything goes near
  Joey Locker or Southern View Development, and not yet done.
- **Brittany Park Dr's multi-family entitlement is unconfirmed** — assessor land-use code only,
  not checked against Metro Planning's own zoning record.
- **Barnes Rd's pipeline easement extent is unknown** — not checked against a title or plat
  record.

None of the four opportunities above are `ready_to_deliver` in SLADE, and shouldn't be treated as
such — they're `discovered`, per LODE's own pipeline (`SLADE/docs/LODE.md` step 14: discovery
finds a plausible match, it doesn't clear it for delivery).

## 4. Data sources

- Metro Water Services project page: <https://www.nashville.gov/departments/water/projects>
  (Nolensville Sewer Replacement Project, #25SC0020).
- USGS National Hydrography Dataset, Mill Creek flowline, Davidson County, TN:
  `https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer` (layer 6).
- Metro Nashville Cadastral/Parcels GIS layer (owner/acreage/zoning/value for every candidate):
  `https://maps.nashville.gov/arcgis/rest/services/Cadastral/Parcels/MapServer` — already
  imported into this project's own `parcels` table, 2026-09-29.
- This session's own `entitlement_cases` data (Council District 4 anchor point, and the two real
  nearby Nolensville Pike rezonings) — Metro Nashville Legistar (`webapi.legistar.com`) and Metro
  Planning Commission Action Agendas, both collected 2026-09-29.

## 5. Priority next steps

1. Call Metro Water Services (Justin Pendley) for the exact 5-mile construction segment — this is
   the single highest-value confirmation, since it could rule in or out any of the four candidates
   entirely.
2. Attempt to identify and contact the owner of 14446 Old Hickory Blvd (Albatross To Home At Old
   Hickory, LLC) — no contact info found yet in this pass.
3. Confirm Brittany Park Dr's multi-family zoning directly against Metro Planning's record.
4. Title/plat check on the Barnes Rd parcel for the Columbia Gulf Transmission easement extent.
5. Conflict check against Joey Locker / Southern View Development before any of this goes further.

## 6. Structured data

Written directly into SLADE: `slade_organizations` (Southern View Development),
`slade_contacts` (Joey Locker), `slade_buy_boxes` (criteria as stated — no acreage/price range
given yet), `slade_sites` × 4, `slade_site_facts` × 9, `slade_opportunities` × 2 (the primary and
the multi-family secondary — Hickory Hollow and Barnes Rd kept as researched sites without a
formal opportunity record yet, pending the flagged unknowns above), `slade_tasks` × 1 (the
Metro Water Services follow-up call).
