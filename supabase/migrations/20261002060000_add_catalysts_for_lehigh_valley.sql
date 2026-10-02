-- Catalysts backfill for the Lehigh Valley, PA market (same lesson as the
-- 2026-10-02 Tampa/Ohio catalysts backfill: the live national map renders
-- from `catalysts`, not `shifts`, and catalysts.latitude/longitude are
-- NOT NULL -- done in the same pass as the shifts migration this time so
-- nothing is missing a second round).
--
-- 8 catalysts seeded, covering every shift with a real or honestly-
-- approximate site. Seven are real, named, filed projects (catalyst_type
-- 'data_center' or 'infrastructure_project') even where contested or still
-- under review -- NOT rumors. One ("Lower Macungie Township Data Center
-- Readiness Signal") is the genuine "Possible" / unconfirmed case: a real
-- anticipatory zoning ordinance with explicitly no named project behind
-- it, modeled using this table's existing potential_data_center
-- convention (see Project Deep Blue / Google Mega Data Center Proposal /
-- Lawrence & Fayetteville readiness-signal rows already live in this
-- table for the exact same pattern).
--
-- Excluded from catalysts (kept in shifts only, same discipline as
-- Tampa's withdrawn American Tower proposal):
--   - Air Products' 2.6M sq ft data center -- formally denied, no appeal,
--     dead. No 'cancelled' pin added; the market's shift record already
--     captures it as a real signal about local regulatory risk.
--   - Allentown's Bill 20 / Bill 52 zoning ordinances and the PPL rate
--     settlement -- citywide/state-level regulatory actions, not points.
--   - The two regional-overview shifts (LVPC tracking 7 proposals / 16
--     ordinances) -- regionwide statistics, not a site.
--
-- catalyst_score computed by hand per lib/catalysts/score.ts's documented
-- formula, same as the Tampa/Ohio pass. signal_categories/
-- signal_confidence/power_load_mw populated only for the one
-- potential_data_center row; left empty/null for every other catalyst_type
-- per this table's own existing convention.
--
-- Every row sets related_shift_id back to its originating shifts row
-- (via exact event-text match) and source_id by exact URL match against
-- the sources rows the sibling shifts migration inserted -- no sources
-- are re-inserted here. This migration must be pushed AFTER
-- 20261002050000_add_lehigh_valley_pa_market_shifts.sql, since that's
-- where both the sources rows and the shifts rows this one links back to
-- are created. Two lookups use `ilike` instead of `like` because their
-- source URLs contain capitalized path segments (TierPoint,
-- Chair-introduces-Bill-52) that a case-sensitive match would silently
-- miss -- the same bug worth flagging for future migrations.
--
-- Note (Jared, 2026-10-02): shifts are being retired as a collection
-- target going forward -- catalysts now cover what shifts used to, so
-- future market passes should write catalysts only, not shifts. This
-- market's shifts migration is being pushed anyway since this catalysts
-- migration already depends on it; the retirement starts with the next
-- new market, not a cleanup of this or any existing market's data.

insert into catalysts (
  market_id, title, catalyst_type, description, address, latitude, longitude,
  influence_radius_meters, status, estimated_value, estimated_scale_note,
  confidence, signal_categories, signal_confidence, power_load_mw,
  catalyst_score, reason_for_catalyst_classification, why_it_matters,
  expected_timeline, related_context, source_id, related_shift_id
) values

-- 1. TierPoint Tek Park acquisition + 100MW expansion
(
  (select id from markets where slug = 'lehigh-valley-pa'),
  'TierPoint Tek Park (100MW Expansion)',
  'data_center',
  'TierPoint''s $175M acquisition of its previously-leased Tek Park data center campus (137 acres, former AT&T Optoelectronics HQ), now undergoing a 100MW power expansion targeted for completion in the second half of 2026.',
  '9999 Hamilton Blvd, Breinigsville, PA (Upper Macungie Township)',
  40.5431431, -75.6598043,
  800, 'under_construction', 175000000, 'Existing 122,000 sq ft / 16MW facility expanding to 100MW',
  'reported', '{}', null, null,
  8, 'High-impact type (data center) + a $175M investment figure clearing the $100M threshold + multiple reinforcing expansion details.',
  'The Lehigh Valley''s first confirmed hyperscale-adjacent power expansion at an already-operating facility -- direct evidence of real, funded buildout, not just proposals.',
  '100MW expansion targeted complete H2 2026',
  array['$240M securitization financing', '~100 jobs added, 350+ construction/engineering jobs during buildout', 'Acquisition completed Oct. 23, 2025'],
  (select id from sources where url ilike '%globenewswire%tierpoint%'),
  (select id from shifts where event = 'TierPoint acquires Tek Park data center campus for $175M, launches 100MW expansion' limit 1)
),

-- 2. PPL substation for TierPoint
(
  (select id from markets where slug = 'lehigh-valley-pa'),
  'PPL Substation for TierPoint Tek Park Expansion',
  'infrastructure_project',
  'PPL Electric Utilities acquired Upper Macungie property for $1.75M to build a substation adding capacity specifically for TierPoint''s Tek Park 100MW expansion -- went before the Township Board of Supervisors for a vote (Resolution #2026-36) on Aug. 6, 2026.',
  'Near 9999 Hamilton Blvd, Upper Macungie Township, PA (exact substation parcel not independently geocoded)',
  40.5431431, -75.6598043,
  1600, 'land_acquired', 1750000, 'New substation serving an existing 100MW data center expansion',
  'reported', '{}', null, null,
  4, 'Medium-impact infrastructure type + an investment figure below the $10M tier + reinforcing utility/customer details.',
  'Concrete, named physical infrastructure -- not a proposal or a filing -- directly enabling a confirmed data center expansion. Exactly the "existing/planned infrastructure that supports a build" signal.',
  'Supervisors vote scheduled Aug. 6, 2026',
  array['Utility: PPL Electric Utilities', 'Customer: TierPoint (Tek Park)', 'Resolution #2026-36'],
  (select id from sources where url like '%upper-macungie-supervisors-to-vote%'),
  (select id from shifts where event = 'PPL substation request for TierPoint''s Tek Park expansion goes before Upper Macungie supervisors' limit 1)
),

-- 3. Atlas Industrial data center campus
(
  (select id from markets where slug = 'lehigh-valley-pa'),
  'Atlas Industrial Data Center Campus',
  'data_center',
  'A data center campus proposed for a consolidated 410-acre site directly across from Parkland High School -- originally pitched at 5.1M sq ft across six buildings, revised to three ~492,285 sq ft buildings plus a 40,680 sq ft accessory building, an electrical substation, and a cell tower (~1.5M sq ft total). Site owned by the Jeras Corporation. Facing sustained community opposition and demands for a public hearing.',
  '2493 N Cedar Crest Blvd, South Whitehall Township, PA',
  40.5896083, -75.5250005,
  1600, 'planning_entitlement', null, '410-acre site; building plan revised from 5.1M to ~1.5M sq ft across 3 buildings + accessory',
  'reported', '{}', null, null,
  5, 'High-impact type (data center) + reinforcing scale/ownership details, but no disclosed project cost and still under contested municipal review, not yet approved.',
  'The largest, most contested single proposal in the region -- directly tied to a dedicated PPL transmission/substation project (see Orefield Project catalyst) built specifically to serve it.',
  'Under South Whitehall Township planning commission review',
  array['Site owner: Jeras Corporation (3 consolidated parcels)', 'PPL building a dedicated substation/transmission corridor toward this site', 'Sustained organized community opposition, demands for public hearing'],
  (select id from sources where url like '%5-1-million-square-foot-atlas-industrial%'),
  (select id from shifts where event = '5.1M sq ft "Atlas Industrial" data center campus proposed across from Parkland High School, South Whitehall Township' limit 1)
),

-- 4. PPL Orefield Project (substation/transmission toward Atlas Industrial)
(
  (select id from markets where slug = 'lehigh-valley-pa'),
  'PPL "Orefield Project" Substation & Transmission Corridor',
  'infrastructure_project',
  'PPL Electric Utilities purchased 30+ acres to build a new substation and a 200-250-foot-wide, 2-mile transmission corridor toward an undisclosed "new customer facility" -- the location and distance correspond to the Atlas Industrial data center site. Pending PUC approval, construction targeted to start summer 2026, completion summer 2028.',
  'Huckleberry Road & Herman Lane, South Whitehall Township, PA',
  40.6167805, -75.5920509,
  1600, 'land_acquired', null, '30+ acres purchased; 2-mile, 200-250 ft wide transmission corridor planned',
  'reported', '{}', null, null,
  4, 'Medium-impact infrastructure type + reinforcing scale/timeline details, but no disclosed project cost.',
  'The clearest "infrastructure that can/does support a data center build" signal in the region -- a utility building dedicated grid capacity toward a specific, named proposal before that proposal has even been approved.',
  'Construction targeted summer 2026; completion targeted summer 2028, pending PUC approval',
  array['Adjacent to PPL''s existing Susquehanna-Wescosville transmission line', 'Customer not disclosed by PPL, but corridor direction/distance matches the Atlas Industrial site', 'Regulator: Pennsylvania PUC'],
  (select id from sources where url like '%ppl-proposes-new-electric-lines%'),
  (select id from shifts where event = 'PPL''s "Orefield Project" substation and 2-mile transmission corridor proposed to serve undisclosed customer near Atlas Industrial site' limit 1)
),

-- 5. Prologis Allen Township conversion
(
  (select id from markets where slug = 'lehigh-valley-pa'),
  'Prologis Allen Township Data Center Conversion',
  'data_center',
  'Allen Township approved (unanimous vote, March 24, 2026) Prologis''s conversion of its existing 1.01M sq ft warehouse into what''s being called the Lehigh Valley''s first hyperscale data center -- closed-loop cooling (no ongoing water consumption), onsite solar offsetting grid demand, planned completion year 2028.',
  '2500 Liberty Drive, Allen Township, PA',
  40.7017264, -75.4801064,
  800, 'approved', null, '1.01M sq ft existing warehouse converting to data center',
  'reported', '{}', null, null,
  5, 'High-impact type (data center) + reinforcing design/approval details, but no disclosed conversion cost.',
  'The first data center conversion actually approved (not just proposed) in the Lehigh Valley -- and the only one so far pairing closed-loop cooling with onsite solar, a real precedent for how future projects might be designed to ease local opposition.',
  'Planned completion year 2028',
  array['Unanimous Allen Township Board of Supervisors approval, March 24, 2026', 'Closed-loop cooling eliminates ongoing water consumption', 'Onsite solar offsets grid demand'],
  (select id from sources where url like '%allen-township-approves-1-million%'),
  (select id from shifts where event = 'Allen Township approves conversion of 1.01M sq ft Prologis warehouse into Lehigh Valley''s first hyperscale data center' limit 1)
),

-- 6. Allentown 2401 W Emaus Ave conversion
(
  (select id from markets where slug = 'lehigh-valley-pa'),
  'Allentown Data Center Conversion (2401 W. Emaus Ave)',
  'data_center',
  'A developer''s proposal to convert an existing 224,000 sq ft warehouse into a data center (with a 23,000+ sq ft addition), under multiple rounds of Allentown Planning Commission review and revision following neighbor pushback.',
  '2401 W Emaus Ave, Allentown, PA',
  40.5678094, -75.4751235,
  800, 'planning_entitlement', null, '224,000 sq ft existing building + 23,000+ sq ft addition',
  'reported', '{}', null, null,
  5, 'High-impact type (data center) + reinforcing scale/revision-history details, but no disclosed project cost.',
  'The proposal explicitly moving forward under Allentown''s own newly-passed data center ordinance (Bill 20) -- a live test case for how the city''s new rules actually apply.',
  'Under ongoing planning commission review as of mid-2026',
  array['Existing warehouse conversion, not greenfield', 'Revised multiple times after community feedback', 'Reviewed in parallel with Allentown''s Bill 20/52 zoning changes'],
  (select id from sources where url like '%allentown-planning-commission-to-review%'),
  (select id from shifts where event = 'Developer revises Allentown warehouse-to-data-center conversion proposal at 2401 W. Emaus Ave amid planning commission review' limit 1)
),

-- 7. Lower Mount Bethel Tech Center
(
  (select id from markets where slug = 'lehigh-valley-pa'),
  '"Lower Mount Bethel Tech Center" Proposal',
  'data_center',
  'A proposed $5+ billion, 1.2-gigawatt data center campus, originally pitched for 450 acres, sparking sustained organized community opposition. Revised map amendment application now seeks to rezone ~239 acres to industrial use (~100 acres of farmland already envisioned for future electric-utility use, ~102 acres of existing quarry property, plus remaining undeveloped land), centered around Depues Ferry Road.',
  'Gravel Hill Rd & Martins Creek Belvidere Hwy, Lower Mount Bethel Township, PA',
  40.8398706, -75.1175513,
  1600, 'planning_entitlement', 5000000000, '1.2GW capacity; rezoning revised from 450 to 239 acres',
  'reported', '{}', null, null,
  8, 'High-impact type (data center) + a $5B+ investment figure clearing the $100M threshold + multiple reinforcing scale/opposition details.',
  'The single largest dollar figure and power figure of any Lehigh Valley proposal found -- and the one facing the most intense, organized community resistance, making its outcome a bellwether for how far the region''s boom can actually go.',
  'Revised rezoning application under active review',
  array['Original pitch: 450 acres; revised rezoning request: 239 acres', 'Includes ~102 acres of existing quarry property and ~100 acres of farmland already slated for utility use', 'Packed town hall, sustained organized resident opposition'],
  (select id from sources where url like '%residents-fight-rural-farm-takeover%'),
  (select id from shifts where event = '"Lower Mount Bethel Tech Center" -- $5B+, 1.2GW data center proposal sparks fierce opposition, revised to 239-acre rezoning request' limit 1)
),

-- 8. Lower Macungie readiness signal (the one genuine "Possible"/potential_data_center case)
(
  (select id from markets where slug = 'lehigh-valley-pa'),
  'Lower Macungie Township Data Center Readiness Signal (no project identified)',
  'potential_data_center',
  'INFERRED / PREDICTED: no data center project has been proposed in Lower Macungie Township. The township''s Board of Commissioners nonetheless approved advertising data-center-specific zoning amendments (conditional use in Industrial, Highway Enterprise, and Office/Research/Light Industrial districts, with annual water/power usage reporting and noise/vibration studies), explicitly modeled on neighboring Upper Macungie''s ordinance. This pin marks that anticipatory readiness posture, not a detected project -- same pattern as this table''s existing Fayetteville/Lawrence readiness-signal rows.',
  'Lower Macungie Township, PA (no project or site identified)',
  40.5283573, -75.5951077,
  6000, 'rumored', null, 'No project exists -- zoning readiness only',
  'unconfirmed', array['rezoning'], null, null,
  6, 'High-impact type (potential data center) + 3 reinforcing cited context bullets + wide township-scale watch radius, but only one real signal category (anticipatory, modeled-on-a-neighbor zoning action) -- per the signal bible, one category alone never earns a confidence tier, which is why signal_confidence is left null.',
  'A neighboring township (Upper Macungie) already has a confirmed, named data center (TierPoint) and a denied one (Air Products); Lower Macungie pre-emptively regulating ahead of any actual proposal is the clearest "possible" signal in the region -- genuinely distinct from Atlas/Lower Mount Bethel/Prologis/Allentown, which are all real, named, filed projects.',
  'No active timeline -- anticipatory only',
  array['Board of Commissioners approved advertising amendments, April 2026', 'Explicitly modeled on Upper Macungie''s existing ordinance', 'No named project, developer, site, or MW figure exists'],
  (select id from sources where url like '%lower-macungie-advances-data-center-ordinance%'),
  (select id from shifts where event = 'Lower Macungie Township advances anticipatory data center zoning ordinance -- no named project behind it' limit 1)
);
