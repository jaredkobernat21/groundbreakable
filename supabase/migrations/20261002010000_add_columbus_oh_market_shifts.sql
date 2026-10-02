-- New market: Columbus, OH (Jared, 2026-10-02 ask: repeat the Tampa-pass
-- methodology for Columbus/central Ohio). Same shell-row pattern as
-- Nashville/Tampa: market row + hand-researched, sourced shifts, no
-- fabricated data.
--
-- Unlike Tampa (where the honest finding was a regulatory backlash with
-- almost no actual construction), central Ohio -- specifically New
-- Albany/Licking County just northeast of Columbus proper -- is one of
-- the largest real hyperscale data center buildouts in the country
-- (Meta, Google, Amazon, Microsoft, EdgeConneX, more). The signal here is
-- genuinely a boom, but a contested one: AEP Ohio's landmark data-center-
-- specific rate tariff (PUCO-approved, large loads must pay for their own
-- grid buildout) exists precisely because the buildout is real and
-- utility-scale; manufacturers are fighting AEP's demand forecasts; and
-- new gas-fired power plants are being proposed just to feed the data
-- centers' power draw. Intel's $28B New Albany chip fab -- a different,
-- non-data-center project in the same immediate geography -- is included
-- too since it's a massive, real, repeatedly-delayed "shift" any
-- developer/investor in this market needs to know about.
--
-- A Rickenbacker Airport/Anduril ($70M state-funded airside expansion)
-- item was researched and deliberately left out: multiple real articles
-- confirm the project, but none gave a specific, citable announcement
-- date for the airport-expansion-specific story (as opposed to Anduril's
-- own facility, which is a different project) -- left out rather than
-- guessed, same discipline as Topeka's one ungeocodable address.
--
-- Three sources below use month-level precision because that's the
-- precision available: the OMA/AEP demand-forecast dispute (dated to
-- "February 2026" by the Ohio Manufacturers' Association report, no
-- specific day found), the EdgeConneX Phase I city filing (reported only
-- as "filed in June 2025"), and the PowerConneX gas-plant meeting date
-- (recovered from the source page's relative-age metadata -- "~605 days
-- before 2026-10-02" -- rather than a printed date, so treated as
-- approximate: 2025-02-19).

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('PUCO (via GovDelivery)', 'PUCO orders AEP Ohio to create data center specific tariff', 'agency_document',
     'https://content.govdelivery.com/accounts/OHPUC/bulletins/3e8bb79', '2025-07-09'),
    ('AEP Ohio', 'AEP Ohio Updates PUCO on Data Center Load: Figures Show Tariff is Working', 'press_release',
     'https://www.aepohio.com/company/news/view?releaseID=10753', '2026-02-12'),
    ('Utility Dive', 'Manufacturers say AEP Ohio still inflating data center demand after halving forecast', 'news',
     'https://www.utilitydive.com/news/aep-ohio-data-center-load-tariff-oma-manufacturers/811583/', '2026-02-01'),
    ('State News (statenews.org)', 'Ohio House bill would extend data center tariff to rest of state', 'news',
     'https://www.statenews.org/government-politics/2026-03-02/ohio-house-bill-would-extend-data-center-tariff-to-rest-of-state', '2026-03-02'),
    ('Spectrum News 1 Columbus', 'Meta lines up massive supply of nuclear power to energize AI data centers', 'news',
     'https://spectrumnews1.com/oh/columbus/news/2026/01/09/meta-lines-up-massive-supply-of-nuclear-power-to-energize-ai-data-centers', '2026-01-09'),
    ('DataCenterDynamics', 'EdgeConneX files to convert warehouse and build new 700,000 sq ft data center in New Albany, Ohio', 'news',
     'https://www.datacenterdynamics.com/en/news/edgeconnex-files-to-convert-warehouse-and-build-new-700000-sq-ft-data-center-in-new-albany-ohio/', '2025-06-01'),
    ('The Fallout Files', 'Wetlands permit filed for proposed 1.66 million-square-foot data center complex in Licking County', 'news',
     'https://thefalloutfiles.substack.com/p/wetlands-permit-filed-for-proposed', '2026-08-25'),
    ('The Reporting Project (Licking County)', 'Gas-fired power plant to serve data center is proposed for western Licking County', 'news',
     'https://www.thereportingproject.org/gas-fired-power-plant-to-serve-data-center-is-proposed-for-western-licking-county/', '2025-02-19'),
    ('Spectrum News 1 Columbus', 'ODOT warns of new I-70/71 impacts in Columbus', 'news',
     'https://spectrumnews1.com/oh/columbus/news/2026/03/24/odot-i-70-71-impacts-in-columbus', '2026-03-24'),
    ('WOSU Public Media', 'Slow progress continues at Intel''s New Albany semiconductor fab, still set to open by 2031', 'news',
     'https://www.wosu.org/2026-08-26/slow-progress-continues-at-intels-new-albany-semiconductor-fab-still-set-to-open-by-2031', '2026-08-26')
  returning id, url
),
new_market as (
  insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
  values ('columbus-oh', 'Columbus', 'OH', 39.9612, -82.9988, 11)
  on conflict (slug) do nothing
  returning id
),
market as (
  select id from new_market
  union all
  select id from markets where slug = 'columbus-oh'
  limit 1
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'infrastructure'::shift_category, 'utility_rate_filing',
  'PUCO orders AEP Ohio to create a data-center-specific electricity rate tariff',
  'The Public Utilities Commission of Ohio adopted a settlement (AEP Ohio, PUCO staff, Ohio Consumers'' Counsel, and others) requiring AEP Ohio to file a new tariff for large new data center customers: a minimum take-or-pay of 85% of subscribed electricity usage for up to 12 years, regardless of actual consumption. AEP Ohio was also ordered to lift its prior moratorium on connecting new data centers once the tariff was in place -- the Ohio analog of Tampa Electric''s large-load tariff filing.',
  '2025-07-09'::date, 'Approved/ordered', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%govdelivery%'),
  '{"minimum_take_or_pay_pct": 85, "contract_term_years": 12, "load_threshold_mw": 25, "regulator": "PUCO"}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'regulatory_update',
  'AEP Ohio reports 5,642 MW of signed data center load under new tariff as of Feb. 12, 2026',
  'Following PUCO''s approval of its data-center tariff, AEP Ohio reported that data centers and developers had signed binding contracts totaling 5,642 megawatts of load as of Feb. 12, 2026 -- framed by AEP as evidence the tariff structure is working as intended (committing real load rather than speculative reservations).',
  '2026-02-12'::date, 'Reported', 'high'::shift_impact, array['developer', 'investor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%aepohio.com%'),
  '{"signed_load_mw": 5642, "as_of": "2026-02-12"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'regulatory_controversy',
  'Ohio Manufacturers'' Association says AEP Ohio still inflating data center demand forecasts despite tariff',
  'The Ohio Manufacturers'' Association released a report arguing AEP Ohio continues to inflate its electricity demand forecasts even after the new data center tariff forced it to cut its stated large-load forecast from 30 GW to 13 GW -- OMA contends the remaining figure still reflects "tariff mechanics, not new customer demand," a dispute relevant to anyone pricing in future grid capacity or rate pressure in the market.',
  '2026-02-01'::date, 'Ongoing dispute', 'medium'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%utilitydive%'),
  '{"forecast_cut_from_gw": 30, "forecast_cut_to_gw": 13, "disputing_party": "Ohio Manufacturers'' Association"}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'process_improvement',
  'Ohio House bill proposes extending AEP''s data-center tariff model statewide',
  'A bill introduced in the Ohio House would extend the large-load/data-center tariff structure piloted by AEP Ohio to utilities across the rest of the state, a direct result of the AEP settlement''s visibility and the broader fight over who pays for data-center grid buildout.',
  '2026-03-02'::date, 'Introduced', 'medium'::shift_impact, array['developer', 'investor']::shift_audience[], null,
  null::double precision, null::double precision, (select id from new_sources where url like '%statenews.org%'),
  '{"scope": "statewide (Ohio)"}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'power_supply_deal',
  'Meta lines up multi-gigawatt nuclear power (TerraPower, Oklo, Vistra) to fuel New Albany''s "Prometheus" supercluster',
  'Meta signed nuclear power agreements with three providers to help energize its AI data centers, including the Prometheus supercluster under construction in New Albany -- expected to be the world''s first gigawatt-capable data center, made up of at least five buildings. TerraPower will fund two new Natrium units (up to 690MW, as early as 2032) plus rights to six more (2.1GW by 2035); Oklo will develop a 1.2GW power campus in Pike County (possibly online 2030); and Meta will buy 2.1GW+ from two operating Vistra nuclear plants in Ohio (plus a third in Pennsylvania) and their planned expansions.',
  '2026-01-09'::date, 'Under construction (Prometheus); power deals signed', 'high'::shift_impact, array['developer', 'investor']::shift_audience[], 'New Albany, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%nuclear-power-to-energize%'),
  '{"facility": "Meta Prometheus supercluster", "buildings": "5+", "capacity": "gigawatt-capable (first of its kind)", "power_partners": ["TerraPower", "Oklo", "Vistra"]}'::jsonb
from market
union all
select market.id, 'building'::shift_category, 'under_construction',
  'EdgeConneX files to convert 525,000 sq ft warehouse into data center, plans 700,000 sq ft Phase II, New Albany',
  'EdgeConneX filed with the City of New Albany (June 2025) to convert an existing 524,525 sq ft warehouse at 9850 Innovation Campus Way into a data center (Phase I, targeted complete April 2026, opening early 2027). Phase II adds a new two-story 700,000 sq ft data center building plus an 80,000 sq ft energy center housing gas-fired generators, targeted substantially complete by Q3 2027 -- part of EdgeConneX''s plan for 1.2M+ sq ft of data center space in New Albany.',
  '2025-06-01'::date, 'Phase I under conversion; Phase II planned', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], '9850 Innovation Campus Way, New Albany, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%edgeconnex-files-to-convert%'),
  '{"phase_1_sf": 525000, "phase_1_target_complete": "2026-04", "phase_2_sf": 700000, "phase_2_energy_center_sf": 80000, "phase_2_target": "Q3 2027"}'::jsonb
from market
union all
select market.id, 'plans'::shift_category, 'development_planned',
  'Wetlands permit filed for proposed 1.66M sq ft, 6-building data center complex in Jersey Township, Licking County',
  'Mink Street Land Company LLC (New Albany office) filed a wetlands permit with the Ohio EPA for a proposed six-building, ~1.66 million sq ft data center complex on a 399-acre site in Jersey Township -- east of Mink Street, north of Beaver Road, south of Jug Street. The permit lists a construction start of Dec. 1, 2026 and a scheduled end date of Nov. 30, 2031.',
  '2026-08-25'::date, 'Permit filed, not yet under construction', 'medium'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'Jersey Township (near Mink St / Beaver Rd / Jug St), Licking County, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%wetlands-permit-filed%'),
  '{"applicant": "Mink Street Land Company LLC", "buildings": 6, "total_sf": 1660000, "site_acres": 399, "construction_start": "2026-12-01", "construction_end": "2031-11-30"}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'PowerConneX (EdgeConneX affiliate) proposes up to 120MW gas-fired power plant to serve New Albany-area data centers',
  'PowerConneX Inc., an affiliate of data center developer EdgeConneX, notified the Ohio Power Siting Board and local stakeholders it will seek state permits for a natural gas power plant of up to 120MW on 48.6 acres northwest of the Rt. 161 / Mink St intersection in western Licking County, to serve nearby data centers. Construction was anticipated to begin as early as Q4 2025, with commercial operation possible by Q1 2026.',
  '2025-02-19'::date, 'Proposed (state permitting)', 'medium'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'Rt. 161 & Mink St (northwest intersection), western Licking County, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%gas-fired-power-plant-to-serve%'),
  '{"applicant": "PowerConneX Inc. (EdgeConneX affiliate)", "capacity_mw": 120, "site_acres": 48.6, "regulator": "Ohio Power Siting Board"}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'infrastructure_project',
  'ODOT''s Columbus Crossroads (I-70/71 downtown split) reconstruction continues, $700M invested, $250M more committed',
  'ODOT''s "Downtown Ramp Up" / Columbus Crossroads project rebuilding the I-70/71 split through downtown Columbus has drawn $700 million in investment to date with another $250 million committed for future phases; later phases (2D: I-70/71 east interchange; Phase 3) remain in design, not yet under construction. As of late March 2026, active work included overnight closures for bridge demolition and ramp reconstruction on SR 315 and the I-71/I-70 ramps.',
  '2026-03-24'::date, 'Under construction (downtown phases); future phases in design', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'I-70/I-71 split, Downtown Columbus, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%odot-i-70-71-impacts%'),
  '{"invested_to_date_usd": 700000000, "future_phases_committed_usd": 250000000, "agency": "ODOT", "future_phases": ["Phase 2D (I-70/71 east interchange)", "Phase 3"]}'::jsonb
from market
union all
select market.id, 'business'::shift_category, 'project_delay',
  'Intel''s $28B New Albany semiconductor fab remains delayed to 2030/2031, slow progress continues',
  'Intel''s two-fab "Ohio One" project in New Albany (broke ground September 2022, $28 billion, originally targeted to start production in 2025) remains on its 2025-announced delayed timeline: Mod 1 targeted complete 2030, Mod 2 targeted complete 2031. As of late August 2026, reporting confirmed progress remains slow with no further acceleration, though the project has not been cancelled.',
  '2026-08-26'::date, 'Under construction (delayed, slow progress)', 'high'::shift_impact, array['developer', 'investor', 'contractor']::shift_audience[], 'New Albany, OH',
  null::double precision, null::double precision, (select id from new_sources where url like '%slow-progress-continues-at-intels%'),
  '{"project_cost_usd": 28000000000, "groundbreak": "2022-09", "mod_1_target": 2030, "mod_2_target": 2031, "original_target": 2025}'::jsonb
from market;
