-- Backfills `catalysts` rows for the Tampa/Columbus/Mansfield/Appalachian
-- Ohio markets added in the four prior 2026-10-02 migrations. Those
-- migrations populated `shifts` only -- but the live national map (the
-- investor dashboard's primary view as of the 2026-09-30 redesign) renders
-- from `catalysts`, not `shifts` (see getNationalCatalystsWithSource).
-- Nothing showed up on the map because no catalysts existed for these
-- markets yet.
--
-- catalysts.latitude/longitude are NOT NULL, unlike shifts' nullable
-- lat/lng -- so every row here needed a real, geocoded point (via
-- OpenStreetMap/Nominatim, cross-checked against independently-sourced
-- addresses, not estimated from memory). Several of our best shifts don't
-- have one confirmed, exact site:
--   - EnergiAcres' "Stargate Ohio" proposal (Belmont County) has no site
--     chosen at all -- modeled using the existing, already-established
--     'potential_data_center' sub-model (catalyst_type =
--     'potential_data_center', status = 'rumored', confidence =
--     'unconfirmed', wide influence_radius_meters), exactly like the
--     Project Linda / Google Nebraska / Lawrence-readiness rows already
--     live in this table -- same "this pin marks the general area only,
--     not a detected site" language.
--   - The Mink Street Land Co. complex and PowerConneX gas plant (both
--     western Licking County, OH) ARE real, reported, named projects
--     (not rumors) but their sites are only described by nearby road
--     names, not a street address -- both anchored to the same
--     geocoded "Mink Street SW, Jersey Township" point, with address
--     text explicitly saying the exact site boundary wasn't
--     independently geocoded.
--   - Several infrastructure megaprojects (Selmon Expressway, I-70
--     Zanesville, the US-30 bridge near SR 98) are corridors, not
--     points -- anchored to the most specific real, named landmark tied
--     to each project (e.g. Selmon's own Bay-to-Bay/MacDill gathering
--     space) or, failing that, a city-level representative point,
--     clearly not claimed as the exact structure location.
--
-- catalyst_score computed by hand per lib/catalysts/score.ts's documented
-- formula (type weight + investment scale + reinforcing signals +
-- regional reach) -- same "human-curated, computed-formula-as-starting-
-- point" convention the rest of this table already uses. signal_categories
-- / signal_confidence / power_load_mw are populated only for the one
-- potential_data_center row (EnergiAcres) -- per this table's own existing
-- comment, those columns are "meaningless/empty for every other
-- catalyst_type."
--
-- Every row sets related_shift_id back to the exact shifts row it
-- originated from (the dual-FK the 2026-09-25 extend-catalysts migration
-- added for this purpose), and source_id reuses the existing `sources`
-- rows the four prior migrations already inserted -- no source rows are
-- re-inserted here.

insert into catalysts (
  market_id, title, catalyst_type, description, address, latitude, longitude,
  influence_radius_meters, status, estimated_value, estimated_scale_note,
  confidence, signal_categories, signal_confidence, power_load_mw,
  catalyst_score, reason_for_catalyst_classification, why_it_matters,
  expected_timeline, related_context, source_id, related_shift_id
) values

-- 1. TAMPA -- South Selmon Expressway
(
  (select id from markets where slug = 'tampa-fl'),
  'South Selmon Expressway Capacity Project',
  'infrastructure_project',
  'THEA''s $362 million widening of the South Selmon Expressway from two to three lanes each direction across 4.5 miles between Downtown Tampa and Gandy Blvd, modernizing 26 bridges. Pin anchored at Bay-to-Bay Blvd & MacDill Ave, the specific intersection where the project adds a dog park/gathering space -- not the full 4.5-mile corridor.',
  'MacDill Ave & Bay to Bay Blvd, Tampa, FL (one point along a 4.5-mile corridor)',
  27.9198910, -82.4936980,
  3200, 'under_construction', 362000000, '4.5 miles widened, 26 bridges modernized',
  'reported', '{}', null, null,
  8, 'Medium-impact infrastructure type + a $362M investment figure clearing the $100M threshold + multiple reinforcing project-scope details + a multi-mile corridor radius.',
  'Major toll-funded capacity expansion directly through the Downtown Tampa/South Tampa corridor -- relevant to any development near the Selmon between downtown and Gandy Blvd.',
  'Started spring 2026, completion targeted 2030',
  array['Funded via toll revenue (THEA)', 'Modernizes 26 bridges including a Hillsborough River span', 'Adds noise walls, redesigned underpasses, and intelligent transportation systems'],
  (select id from sources where url = 'https://tbbwmag.com/2026/02/19/south-selmon-expressway-rebuild-spring-2026/'),
  (select id from shifts where event = 'South Selmon Expressway Capacity Project ($362M) begins construction, Downtown Tampa to Gandy Blvd' limit 1)
),

-- 2. TAMPA -- Downtown Tampa Interchange (I-275/I-4)
(
  (select id from markets where slug = 'tampa-fl'),
  'Downtown Tampa Interchange (I-275/I-4) Rebuild',
  'infrastructure_project',
  'FDOT''s $227.5 million safety/operational rebuild of the I-275/I-4 interchange just north of Downtown Tampa ("Malfunction Junction") -- six new bridges, eight bridge widenings, handling ~200,000 vehicles/day. More than halfway complete as of mid-2026.',
  'I-275 at I-4 interchange ("Malfunction Junction"), Tampa, FL',
  27.9890529, -82.4537419,
  3200, 'under_construction', 227500000, '6 new bridges, 8 bridge widenings/modifications',
  'reported', '{}', null, null,
  8, 'Medium-impact infrastructure type + a $227.5M investment figure clearing the $100M threshold + multiple reinforcing project-scope details + a multi-mile corridor radius.',
  'One of the highest-traffic interchanges in the region, directly north of Downtown Tampa -- relevant to any development with access needs along I-275 or I-4 near downtown.',
  'Started fall 2023, completion targeted spring 2027',
  array['Contractor: The Lane Construction Corporation', 'Handles ~200,000 vehicles/day', 'More than 50% complete as of mid-2026'],
  (select id from sources where url = 'https://www.fdottampabay.com/project/839/445057-1-52-01'),
  (select id from shifts where event = 'Downtown Tampa Interchange (I-275/I-4) rebuild, $227.5M, more than halfway complete' limit 1)
),

-- 3. TAMPA -- H5/Novacap Franklin Exchange acquisition
(
  (select id from markets where slug = 'tampa-fl'),
  'Franklin Exchange Carrier Hotel (H5/Novacap acquisition from 365 Data Centers)',
  'data_center',
  'Carrier-dense colocation building in downtown Tampa, acquired by the H5 Data Centers / Novacap joint venture from 365 Data Centers as part of a 3-facility U.S. acquisition (with Buffalo NY and Nashville TN). Willkie Farr & Gallagher advised on the deal.',
  '655 N Franklin St, Tampa, FL',
  27.9495970, -82.4586818,
  800, 'operating', null, 'Existing operating carrier hotel; deal value not disclosed',
  'reported', '{}', null, null,
  5, 'High-impact type (data center) + reinforcing deal-structure details, but no disclosed transaction value and a single-building (not regional) footprint.',
  'Private-equity consolidation of existing Tampa data center / carrier-hotel capacity -- signals institutional capital actively repositioning around Tampa''s power/colocation assets, distinct from new ground-up construction.',
  'Deal reported February 2026',
  array['Part of a 3-facility JV acquisition (Buffalo NY, Nashville TN, Tampa FL)', 'Seller: 365 Data Centers', 'Advised by Willkie Farr & Gallagher'],
  (select id from sources where url = 'https://www.willkie.com/news/2026/02/willkie-advises-novacap-and-h5-data-centers'),
  (select id from shifts where event = 'H5 Data Centers / Novacap joint venture acquires Tampa carrier hotel (Franklin Exchange) from 365 Data Centers' limit 1)
),

-- 4. COLUMBUS -- Meta Prometheus supercluster
(
  (select id from markets where slug = 'columbus-oh'),
  'Meta "Prometheus" Supercluster',
  'data_center',
  'Meta''s gigawatt-capable AI data center supercluster under construction in New Albany, backed by nuclear power agreements with TerraPower, Oklo, and Vistra -- expected to be the world''s first gigawatt-capable data center, at least 5 buildings.',
  '1500 Beech Rd SW, New Albany, OH',
  40.0705477, -82.7542968,
  800, 'under_construction', null, 'Gigawatt-capable; 5+ buildings',
  'reported', '{}', null, null,
  5, 'High-impact type (data center) + reinforcing power-deal details, but no disclosed total project cost and a single-campus footprint.',
  'Would be the world''s first gigawatt-capable data center -- a scale signal for the entire New Albany/Licking County cluster''s power and infrastructure demand.',
  'Reported online 2026',
  array['Power partners: TerraPower, Oklo, Vistra', 'TerraPower: 2 new Natrium units (up to 690MW) + rights to 6 more', 'Meta buying 2.1GW+ from Vistra plants'],
  (select id from sources where url = 'https://spectrumnews1.com/oh/columbus/news/2026/01/09/meta-lines-up-massive-supply-of-nuclear-power-to-energize-ai-data-centers'),
  (select id from shifts where event = 'Meta lines up multi-gigawatt nuclear power (TerraPower, Oklo, Vistra) to fuel New Albany''s "Prometheus" supercluster' limit 1)
),

-- 5. COLUMBUS -- Intel Ohio One fab
(
  (select id from markets where slug = 'columbus-oh'),
  'Intel "Ohio One" Semiconductor Fab',
  'major_employer',
  'Intel''s two-fab, $28 billion semiconductor campus in New Albany -- broke ground September 2022, repeatedly delayed, now targeting Mod 1 complete 2030 and Mod 2 complete 2031.',
  '8255 Innovation Campus Way W, New Albany, OH',
  40.0884107, -82.7612428,
  800, 'under_construction', 28000000000, 'Two-fab campus',
  'reported', '{}', null, null,
  8, 'High-impact type (major employer) + a $28B investment figure clearing the $100M threshold + multiple reinforcing delay/timeline details.',
  'One of the largest single private investments in Ohio history -- a defining anchor for the entire New Albany/Licking County corridor regardless of its repeated delays.',
  'Mod 1 targeted 2030, Mod 2 targeted 2031 (originally 2025)',
  array['Groundbreak: September 2022', 'Original target: 2025; now Mod 1: 2030, Mod 2: 2031', 'Progress confirmed slow but not cancelled as of August 2026'],
  (select id from sources where url = 'https://www.wosu.org/2026-08-26/slow-progress-continues-at-intels-new-albany-semiconductor-fab-still-set-to-open-by-2031'),
  (select id from shifts where event = 'Intel''s $28B New Albany semiconductor fab remains delayed to 2030/2031, slow progress continues' limit 1)
),

-- 6. COLUMBUS -- EdgeConneX conversion
(
  (select id from markets where slug = 'columbus-oh'),
  'EdgeConneX New Albany (Innovation Campus Way)',
  'data_center',
  'EdgeConneX''s conversion of an existing ~525,000 sq ft warehouse into a data center (Phase I, targeted complete April 2026), plus a planned 700,000 sq ft Phase II building with an 80,000 sq ft gas-generator energy center.',
  '9850 Innovation Campus Way, New Albany, OH',
  40.0890494, -82.7514752,
  800, 'under_construction', null, 'Phase I: 525,000 sq ft conversion; Phase II: 700,000 sq ft new build',
  'reported', '{}', null, null,
  5, 'High-impact type (data center) + reinforcing phase/scale details, but no disclosed total project cost and a single-site footprint.',
  'A warehouse-to-data-center conversion plus a large planned Phase II -- direct evidence of the New Albany cluster''s buildout continuing to add real square footage, not just announcements.',
  'Phase I complete ~April 2026; Phase II substantially complete targeted Q3 2027',
  array['Filed with City of New Albany, June 2025', 'Phase II adds an 80,000 sq ft gas-fired energy center', 'Part of EdgeConneX''s 1.2M+ sq ft New Albany plan'],
  (select id from sources where url = 'https://www.datacenterdynamics.com/en/news/edgeconnex-files-to-convert-warehouse-and-build-new-700000-sq-ft-data-center-in-new-albany-ohio/'),
  (select id from shifts where event = 'EdgeConneX files to convert 525,000 sq ft warehouse into data center, plans 700,000 sq ft Phase II, New Albany' limit 1)
),

-- 7. COLUMBUS -- Mink Street Land Co. complex (site described by road names only)
(
  (select id from markets where slug = 'columbus-oh'),
  'Mink Street Land Co. Data Center Complex (Jersey Township)',
  'data_center',
  'A real, named, permitted proposal -- Mink Street Land Company LLC filed an Ohio EPA wetlands permit for a 6-building, ~1.66M sq ft data center complex on a 399-acre site in Jersey Township, described only as east of Mink St, north of Beaver Rd, south of Jug St -- no single street address exists. This pin is anchored to a geocoded point on Mink St SW itself, not the specific 399-acre parcel, which was not independently geocoded.',
  'Near Mink St SW, Jersey Township, Licking County, OH (399-acre site boundary not independently geocoded)',
  40.0661377, -82.7291453,
  4800, 'planning_entitlement', null, '6 buildings, ~1.66M sq ft, 399 acres',
  'reported', '{}', null, null,
  6, 'High-impact type (data center) + multiple reinforcing scale details (buildings, sq ft, acreage, construction dates) + a widened radius reflecting the site itself only being described by road boundaries, not a parcel address.',
  'A proposed complex at nearly 2x EdgeConneX''s Phase II scale -- another real, filed (not rumored) data center project adding to the New Albany/western Licking County cluster''s cumulative land and power demand.',
  'Permit-listed construction window: Dec. 1, 2026 - Nov. 30, 2031',
  array['Applicant: Mink Street Land Company LLC (New Albany office)', 'Wetlands permit filed with Ohio EPA, Aug. 2026', 'Permit lists construction start Dec. 2026, end Nov. 2031'],
  (select id from sources where url = 'https://thefalloutfiles.substack.com/p/wetlands-permit-filed-for-proposed'),
  (select id from shifts where event = 'Wetlands permit filed for proposed 1.66M sq ft, 6-building data center complex in Jersey Township, Licking County' limit 1)
),

-- 8. COLUMBUS -- PowerConneX gas plant (site described by intersection only)
(
  (select id from markets where slug = 'columbus-oh'),
  'PowerConneX Gas-Fired Power Plant (western Licking County)',
  'infrastructure_project',
  'PowerConneX Inc. (an EdgeConneX affiliate) notified the Ohio Power Siting Board it will seek permits for a natural gas plant of up to 120MW on 48.6 acres northwest of the Rt. 161 / Mink St intersection, built specifically to serve nearby data centers. This pin is anchored to a geocoded point on Mink St itself, not the specific 48.6-acre parcel, which was not independently geocoded.',
  'Near Rt. 161 & Mink St, western Licking County, OH (48.6-acre site boundary not independently geocoded)',
  40.0661377, -82.7291453,
  4800, 'site_selection', null, 'Up to 120MW, 48.6 acres',
  'reported', '{}', null, null,
  5, 'Medium-impact infrastructure type + reinforcing capacity/site details + a widened radius reflecting the site only being described by an intersection, not a parcel address.',
  'A power plant proposed specifically to serve data centers is itself evidence of how much new generation this cluster is driving -- directly relevant to any project relying on the same regional grid.',
  'Construction anticipated as early as Q4 2025; commercial operation possibly Q1 2026',
  array['Applicant: PowerConneX Inc. (EdgeConneX affiliate)', 'Regulator: Ohio Power Siting Board', 'Built specifically to serve nearby data centers'],
  (select id from sources where url = 'https://www.thereportingproject.org/gas-fired-power-plant-to-serve-data-center-is-proposed-for-western-licking-county/'),
  (select id from shifts where event = 'PowerConneX (EdgeConneX affiliate) proposes up to 120MW gas-fired power plant to serve New Albany-area data centers' limit 1)
),

-- 9. COLUMBUS -- Columbus Crossroads (I-70/71 downtown split)
(
  (select id from markets where slug = 'columbus-oh'),
  'Columbus Crossroads (I-70/71 Downtown Ramp Up)',
  'infrastructure_project',
  'ODOT''s long-running reconstruction of the I-70/71 downtown Columbus split -- $700M invested to date, $250M more committed for future phases (2D, Phase 3 still in design). Pin anchored near High St downtown, not an exact ramp centerline.',
  'I-70/I-71 split, Downtown Columbus, OH (near High St)',
  39.9649552, -83.0011399,
  3200, 'under_construction', 700000000, '$700M invested to date, $250M more committed',
  'reported', '{}', null, null,
  8, 'Medium-impact infrastructure type + a $700M-to-date investment figure clearing the $100M threshold + multiple reinforcing phase details + a multi-ramp downtown-corridor radius.',
  'The single busiest, most accident-prone highway segment in central Ohio -- directly shapes access and development value throughout downtown Columbus.',
  'Downtown phases under construction; Phase 2D and Phase 3 in design',
  array['Agency: ODOT ("Downtown Ramp Up" project)', 'Active work includes bridge demolition on SR 315 and I-71/I-70 ramps', 'Future phases: 2D (I-70/71 east interchange), Phase 3'],
  (select id from sources where url = 'https://spectrumnews1.com/oh/columbus/news/2026/03/24/odot-i-70-71-impacts-in-columbus'),
  (select id from shifts where event = 'ODOT''s Columbus Crossroads (I-70/71 downtown split) reconstruction continues, $700M invested, $250M more committed' limit 1)
),

-- 10. MANSFIELD -- US-30 bridge replacement, Crawford County
(
  (select id from markets where slug = 'mansfield-oh'),
  'US-30 Bridge Replacement at SR 98 (Crawford County)',
  'infrastructure_project',
  'ODOT''s replacement of the east and west US-30 bridges over the Norfolk Southern Railroad near SR 98 -- eastbound SR 98 ramp reopened Sept. 17, 2026 after a 120-day closure; full completion estimated August 2027. Pin anchored at Crestline, OH, the nearest named community -- not the exact bridge location.',
  'US-30 at SR 98, Crawford County, OH (near Crestline; exact bridge coordinates not independently geocoded)',
  40.7875572, -82.7365677,
  1600, 'under_construction', null, 'Two bridge spans (east and west) over Norfolk Southern RR',
  'reported', '{}', null, null,
  4, 'Medium-impact infrastructure type + reinforcing scope/timeline details, but no disclosed project cost and an imprecise, city-level anchor point.',
  'Direct US-30 corridor disruption/improvement in Crawford County -- relevant to any logistics or industrial site depending on this stretch of the corridor.',
  'Ramp reopened Sept. 17, 2026; full completion estimated August 2027',
  array['East and west bridge spans over Norfolk Southern RR', 'Eastbound SR 98 ramp closed 120 days, reopened Sept. 17, 2026', 'Agency: ODOT'],
  (select id from sources where url = 'https://www.richlandsource.com/2026/09/10/odot-cautions-crawford-county-drivers-on-road-construction-projects/'),
  (select id from shifts where event = 'U.S. 30 bridge replacement over Norfolk Southern RR near SR 98 (Crawford County) under construction, ramp reopened Sept. 17' limit 1)
),

-- 11. MANSFIELD -- Newman Technology expansion
(
  (select id from markets where slug = 'mansfield-oh'),
  'Newman Technology Mansfield Plant Expansion',
  'major_employer',
  'Newman Technology Inc. (Tier 1 automotive supplier, ~40 years in Mansfield) is expanding its plant with a new 24,500 sq ft building anchored by a 1,500-ton press, adding 70 jobs and retaining its ~630-person workforce. State-approved Job Creation Tax Credit.',
  '100 Cairns Rd, Mansfield, OH',
  40.8056430, -82.5194450,
  800, 'approved', 74000000, '24,500 sq ft new building, 70 jobs added, 630 jobs retained',
  'reported', '{}', null, null,
  6, 'High-impact type (major employer) + a $74M investment figure (above $10M, below the $100M top tier) + multiple reinforcing jobs/payroll/incentive details.',
  'A real, incentive-backed manufacturing expansion at an established ~40-year employer -- a concrete anchor for the Mansfield/Richland County corridor''s industrial base.',
  'Expansion over the next 2-3 years',
  array['Adds an estimated $3.55M in new annual local payroll', '70 new jobs (half entry-level, half skilled trades/leadership, $25-35/hr)', 'State of Ohio Job Creation Tax Credit: 1.225% for 6 years'],
  (select id from sources where url = 'https://www.richlandsource.com/2026/03/02/newman-technology-plans-74-million-expansion-on-mansfields-north-side/'),
  (select id from shifts where event = 'Newman Technology announces $74M expansion at its Mansfield plant (100 Cairns Road), 70 new jobs' limit 1)
),

-- 12. APPALACHIAN OHIO -- EnergiAcres "Stargate Ohio" (no site chosen -- potential_data_center sub-model)
(
  (select id from markets where slug = 'eastern-appalachian-ohio'),
  'EnergiAcres "Stargate Ohio" Proposal (no site selected)',
  'potential_data_center',
  'EnergiAcres has floated a 2-3 gigawatt AI data center campus ("Stargate Ohio") on thousands of acres somewhere in Belmont County, citing the county''s gas infrastructure and transmission access, targeting commercial operation by Q2 2029. The proposal first became public when a resident raised it at a June 25, 2026 county commissioners'' meeting -- commissioners themselves said it was news to them, with no advance information from the company. No site has been chosen and no application has been filed. This pin marks the general Belmont County area only, anchored at the county seat (St. Clairsville) -- not a proposed or detected site.',
  'Belmont County, OH (no confirmed site -- pin anchored at St. Clairsville, the county seat)',
  40.0806266, -80.9000916,
  20000, 'rumored', null, '2-3GW proposed capacity (range, unconfirmed)',
  'unconfirmed', array['power', 'natural_gas'], 'medium', 2000,
  5, 'High-impact type (potential data center) + one real signal (power, ~2-3GW, treated conservatively as 2,000MW) with a reinforcing natural-gas/transmission-access category, driving a medium confidence tier via the power-threshold rule + wide county-scale watch radius reflecting genuine site uncertainty. No dollar figure, developer entity, or site has been disclosed.',
  'A proposed project of this scale (2-3GW) would be a massive load for any grid in this region, but the company itself has given county officials no advance information and no site -- logged as an early, unconfirmed signal, not a claim of a real project at a specific location.',
  'Targeting Q2 2029 commercial operation, if real',
  array['Surfaced publicly by a resident at a June 25, 2026 commissioners'' meeting, not by the company', 'County commissioners said they had received no advance information', 'Cited rationale: county''s gas infrastructure and transmission access'],
  (select id from sources where url = 'https://rivernews.org/2026/06/25/questions-remain-after-proposed-ai-data-center-surfaces-in-belmont-county/'),
  (select id from shifts where event = 'EnergiAcres proposes 2-3GW "Stargate Ohio" AI data center campus in Belmont County -- no site chosen, county caught off guard' limit 1)
),

-- 13. APPALACHIAN OHIO -- I-70 Zanesville reconstruction
(
  (select id from markets where slug = 'eastern-appalachian-ohio'),
  'I-70 Reconstruction Through Zanesville',
  'infrastructure_project',
  'ODOT''s ~$90 million, multi-phase reconstruction of I-70 through Zanesville (US-40 to SR-93), affecting 16 bridges including crossings of the Licking and Muskingum rivers. Contractor: Shelly & Sands. Pin anchored at Zanesville -- a representative point for this corridor segment, not the exact alignment.',
  'I-70 through Zanesville, OH (US-40 to SR-93; representative city-level point, not exact alignment)',
  39.9401426, -82.0050190,
  1600, 'under_construction', 90000000, '16 bridges affected',
  'reported', '{}', null, null,
  5, 'Medium-impact infrastructure type + a $90M investment figure (above $10M, below the $100M top tier) + multiple reinforcing scope details + an imprecise, city-level anchor point.',
  'A major, active multi-year reconstruction directly through Zanesville -- relevant to any development along this I-70 segment through the city.',
  'Targeting October 2027 completion',
  array['Contractor: Shelly & Sands', 'Affects 16 bridges, including Licking and Muskingum river crossings', 'Agency: ODOT'],
  (select id from sources where url = 'https://www.constructionequipmentguide.com/shelly-and-sands-continues-work-on-zanesvilles-i-70/65575'),
  (select id from shifts where event = 'I-70 reconstruction through Zanesville ($90M, 16 bridges) remains active multi-year project, targeting October 2027 completion' limit 1)
),

-- 14. APPALACHIAN OHIO -- Sterling Teal International expansion
(
  (select id from markets where slug = 'eastern-appalachian-ohio'),
  'Sterling Teal International Zanesville Expansion',
  'major_employer',
  'Sterling Teal International Inc. is expanding into Muskingum County, repurposing the former Cardinal Health facility in Zanesville and creating 30 new jobs, supported by JobsOhio, OhioSE, and the Zanesville-Muskingum County Port Authority, including a $75,000 JobsOhio Revitalization Grant.',
  '3540 East Pike, Zanesville, OH',
  39.9428578, -81.9804910,
  800, 'approved', null, '30 new jobs; repurposes an existing facility',
  'reported', '{}', null, null,
  5, 'High-impact type (major employer) + reinforcing jobs/grant/partner details, but no disclosed total project cost (only a $75,000 incentive grant, well below the investment-scale threshold).',
  'A real, incentive-backed employer expansion reusing existing industrial space in Zanesville -- a modest but concrete signal for the Appalachian Ohio corridor''s economic activity.',
  'Announced July 2025',
  array['Repurposes the former Cardinal Health facility', '$75,000 JobsOhio Revitalization Grant', 'Supported by JobsOhio, OhioSE, and the Zanesville-Muskingum County Port Authority'],
  (select id from sources where url = 'https://highlandcountypress.com/headlines/sterling-teal-international-inc-announces-expansion-zanesville'),
  (select id from shifts where event = 'Sterling Teal International Inc. expands into Zanesville, repurposing former Cardinal Health facility, 30 new jobs' limit 1)
);
