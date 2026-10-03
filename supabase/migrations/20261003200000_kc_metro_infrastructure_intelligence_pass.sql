-- KC metro Infrastructure intelligence pass (2026-10-03). Applies the new
-- Infrastructure schema (20261003190000_infrastructure_project_intelligence.sql)
-- to all 13 existing `infrastructure_project` rows across the KC-metro
-- market set (Basehor/Bonner Springs/De Soto/Gardner/Kansas City KS/
-- Lansing/Leavenworth/Lenexa/Olathe/Overland Park/Spring Hill/Tonganoxie,
-- plus Grain Valley and Blue Springs, MO). NO new catalyst rows -- this is
-- a classification/enrichment pass over content already fully researched
-- and sourced in prior passes this session, not new web research. Every
-- infrastructure_type/development_impact_type/development_impact_level/
-- impact_area_notes value below traces directly to that row's own
-- existing description/why_it_matters text and cited source -- nothing
-- new was invented, and anything the existing text doesn't support is
-- left UNKNOWN/empty rather than guessed.
--
-- OPPORTUNITIES CREATED: checked all 13 rows against the 3 existing KC-
-- metro Potential Data Center sites (Eisenhower Road Business Park
-- Corridor/Leavenworth, Bonner Springs Industrial Park, K-7/McIntyre Road/
-- Lansing). related_catalyst_ids is left EMPTY on every row in this
-- migration -- even "Centennial Bridge Replacement," which shares the
-- Leavenworth market with Eisenhower Road, isn't what gave that park its
-- power/land fundamentals, and forcing the link just because they share a
-- market would be exactly the "weak or misleading opportunity" the brief
-- warns against. No genuine Infrastructure -> Potential link exists yet
-- in this metro; that is an honest finding, not a gap in this pass.
--
-- Four of the 13 rows (Lenexa South Lake, Olathe K-10/I-35, Overland Park
-- College Blvd, Spring Hill US-169/Webster) are the KC metro's existing
-- "standing infrastructure capacity" signals from the Data Center Possible-
-- tier research (status 'rumored') -- they describe an area's utility/
-- fiber/rail capacity, not a single discrete construction project, so
-- their infrastructure_type reflects the single MOST-described asset
-- (power or fiber) with the rest captured in infrastructure_subtype
-- prose, rather than forcing an artificial single project description
-- the way a true single-project row (a sewer interceptor, a bridge) gets.
--
-- PEOPLE: kept minimal per the brief's own "avoid a contact directory"
-- instruction -- only the clearly-responsible government/utility entity
-- each row's own source already names, never a fabricated individual
-- contact. Readiness/Next Steps/Why This Site were deliberately NOT
-- populated -- those are Potential-tier UI concepts (see
-- CatalystIntelligencePanel.tsx's Infrastructure block, which never
-- renders them) and would sit unused on an infrastructure_project row.

update catalysts set
  infrastructure_type = 'sewer',
  infrastructure_subtype = '27-inch gravity sewer interceptor plus a new lift station at Duncan/Seymore (~5,600 ft).',
  development_impact_types = array['housing'],
  development_impact_level = 'high',
  impact_area_notes = '180 acres of previously sewer-constrained land east of Buckner Tarsney Road and north of Duncan Road becomes developable -- VERIFIED, per the city''s own 2025-2029 Capital Improvements Plan.',
  people = '{"government": {"municipality": "City of Grain Valley, MO"}}'::jsonb
where title = 'Northeast Sewer Interceptor Phase 1';

update catalysts set
  infrastructure_type = 'sewer',
  infrastructure_subtype = '10-inch sewer main extension (~2,690 ft); currently unfunded.',
  development_impact_types = array['housing'],
  development_impact_level = 'moderate',
  impact_area_notes = 'Opens vacant land west of South Middle School to development -- no specific acreage figure has been published (ESTIMATED extent only, and the row''s own research explicitly flags this as earlier-stage/unfunded, not yet committed).',
  people = '{"government": {"municipality": "City of Grain Valley, MO"}}'::jsonb
where title = 'SW Grain Valley Sewer System Extension';

update catalysts set
  infrastructure_type = 'roads',
  infrastructure_subtype = 'New I-70 interchange near Lefholz Road, in the cost-shared design phase ($450K: Jackson County $150K, Grain Valley $100K, Oak Grove $50K, a private developer $150K).',
  development_impact_types = '{}',
  development_impact_level = 'unknown',
  impact_area_notes = 'Land near the future Lefholz Road interchange on I-70''s east side; which specific parcels would gain access is not yet documented (UNKNOWN). The private co-funder''s development intent is itself unconfirmed in public reporting -- the row''s own source is paywalled and only independently corroborated, not directly read.',
  people = '{"government": {"municipality": "Grain Valley, MO (also Jackson County and Oak Grove, MO as co-funders)"}}'::jsonb
where title = 'I-70 / Lefholz Road Interchange (proposed)';

update catalysts set
  infrastructure_type = 'sewer',
  infrastructure_subtype = 'New 5 MGD wastewater treatment plant plus a new sanitary sewer main and pump station; the city also fully joined WaterOne''s drinking-water service area as of Jan. 2026.',
  development_impact_types = '{}',
  development_impact_level = 'high',
  impact_area_notes = 'New treatment capacity serves Spring Hill''s broader municipal service area; no specific newly-serviceable acreage figure has been published (UNKNOWN). The capacity increase itself -- sized well beyond the city''s current footprint, per its own public hearing record -- is the HIGH-impact evidence, independent of acreage.',
  people = '{"government": {"municipality": "Spring Hill, KS"}}'::jsonb
where title = 'Spring Hill Wastewater Treatment Plant Expansion';

update catalysts set
  infrastructure_type = 'power',
  infrastructure_subtype = 'New Clearview substation and transmission upgrades near 95th St & Sunflower Rd, enabling retirement of an aging De Soto-side substation in 2026.',
  development_impact_types = array['data_center', 'industrial'],
  development_impact_level = 'high',
  impact_area_notes = 'Industrial/data-center-scale land in the De Soto growth corridor served by the new Clearview substation; a specific service-area acreage has not been published (ESTIMATED extent only). Evergy''s own stated purpose -- supporting incoming hyperscale campuses -- is VERIFIED directly from its project page.',
  people = '{"utility": {"utility": "Evergy"}}'::jsonb
where title = 'Evergy De Soto Transmission & Substation Upgrades';

update catalysts set
  infrastructure_type = 'sewer',
  infrastructure_subtype = '11+ water/sewer capital projects (~$245M 5-year CIP) including Cedar Creek WWTP expansion phase two ($36.1M), West Cedar Creek interceptor phase one ($47.1M), and a sanitary sewer extension south of Lone Elm Park.',
  development_impact_types = '{}',
  development_impact_level = 'high',
  impact_area_notes = 'The Lone Elm Park sewer extension is explicitly sized to open approximately 400 acres to new development -- VERIFIED, per the Olathe Reporter''s coverage; the specific development type for that acreage is not yet publicly named, and acreage for the other 10 bundled projects is not separately itemized.',
  people = '{"government": {"municipality": "Olathe, KS"}}'::jsonb
where title = 'Olathe $213M+ Water/Sewer Capital Program';

update catalysts set
  infrastructure_type = 'roads',
  infrastructure_subtype = 'K-10 & Lone Elm Rd interchange rebuild (lane widening, new signalization, updated ramps), the flagship project within a broader $273.3M, 61-project Capital Improvement Program adopted Jan. 6, 2026.',
  development_impact_types = array['industrial', 'logistics'],
  development_impact_level = 'high',
  impact_area_notes = 'Serves Lenexa''s existing, already-developed logistics-park corridor along K-10 -- this is a congestion-relief project for current industrial land use, not one opening new acreage; the city''s own stated rationale (relieving congestion driven by growing logistics parks) is VERIFIED directly from its own announcement.',
  people = '{"government": {"municipality": "Lenexa, KS"}}'::jsonb
where title = 'Lenexa 2026-2030 Capital Improvement Program';

update catalysts set
  infrastructure_type = 'sewer',
  infrastructure_subtype = 'Stormwater improvements, a retaining wall, and sanitary sewer/basin installation serving Lenexa Logistics Centre North Phase II.',
  development_impact_types = array['industrial', 'logistics'],
  development_impact_level = 'high',
  impact_area_notes = 'Scoped specifically to Lenexa Logistics Centre North Phase II; acreage for this phase is not separately published (ESTIMATED, bounded to the named park phase only). A clean, low-ambiguity case -- infrastructure explicitly following already-confirmed industrial demand, per the city''s own council packet, not preceding an unconfirmed one.',
  people = '{"government": {"municipality": "Lenexa, KS"}}'::jsonb
where title = 'Lenexa Logistics Centre North Phase II Utility Extension';

update catalysts set
  infrastructure_type = 'roads',
  infrastructure_subtype = 'New 4-lane Missouri River bridge just north of the current Centennial Bridge; in right-of-way acquisition and final design as of 2026, targeting design complete summer 2027, construction ~2028, completion ~2029-2030.',
  development_impact_types = '{}',
  development_impact_level = 'high',
  impact_area_notes = 'Affects cross-river development pressure on both the Leavenworth, KS and Platte County, MO sides of the only Missouri River crossing in a 38-mile stretch -- no specific acreage figure has been published (INFERRED from the corridor''s unique-access characteristics, not a measured area). The specific development type this access improvement would favor is not yet documented.',
  people = '{"government": {"decision_making_body": "Kansas Department of Transportation (KDOT)"}}'::jsonb
where title = 'Centennial Bridge Replacement';

update catalysts set
  infrastructure_type = 'other',
  infrastructure_subtype = 'Comprehensive-plan utility-corridor designation (transcontinental natural gas line + high-voltage electrical transmission) plus a pending C-2-to-M-1 industrial rezoning (Case Z-26-1); capital plans include a Northeast Sewer Expansion (175th St toward 191st St) and a Johnson County Wastewater force-main integration near Nottingham Creek.',
  development_impact_types = array['industrial', 'data_center'],
  development_impact_level = 'high',
  impact_area_notes = 'City staff have been directed to map "opportunity nodes" along this utility corridor; no specific acreage has been published yet (UNKNOWN -- the mapping itself is still in progress per the city''s own comprehensive-plan process). The pending Z-26-1 rezoning parcel (north of Webster Street between US-169 and Webster) is the one specific, named land area within this corridor.',
  people = '{"government": {"municipality": "Spring Hill, KS", "planning_department": "Spring Hill Planning Commission (comprehensive plan process, restarted early 2026)"}}'::jsonb
where title = 'Spring Hill US-169/Webster Street Industrial Growth Corridor';

update catalysts set
  infrastructure_type = 'power',
  infrastructure_subtype = '161 kV Evergy substation approximately 0.4 miles from the existing multi-tenant data-center campus (former IBM/South Lake site, 11200 Lakeview Ave); fiber-dense corridor, part of the Kansas City metro''s first-in-world Google Fiber market.',
  development_impact_types = array['data_center'],
  development_impact_level = 'high',
  impact_area_notes = 'The existing data-center campus and its own 161 kV substation serve this specific site -- whether nearby undeveloped land could access the same substation capacity has not been documented (UNKNOWN). This row describes standing, already-utilized capacity, not a new project opening new land.',
  people = '{"utility": {"utility": "Evergy"}}'::jsonb
where title = 'Lenexa South Lake Campus Data Center Corridor (Lakeview Avenue)';

update catalysts set
  infrastructure_type = 'power',
  infrastructure_subtype = 'Evergy-approved substation project in the Woodland corridor (S. Woodland St/W. 108th Terrace); BNSF double-track mainline (~88 trains/day, LA-Chicago freight corridor) runs through the area, 30 miles from BNSF''s 2,352-acre Logistics Park Kansas City intermodal facility in Edgerton.',
  development_impact_types = array['industrial', 'data_center'],
  development_impact_level = 'high',
  impact_area_notes = 'A dozen marketed business/industrial parks along the K-10/I-35 corridor (Cedar Creek, Corporate Ridge, College West, and others); specific combined acreage across all of them has not been itemized in available sources (UNKNOWN).',
  people = '{"utility": {"utility": "Evergy"}, "government": {"economic_development_org": "Olathe Economic Development Council"}}'::jsonb
where title = 'Olathe K-10/I-35 Industrial Corridor (Cedar Creek, Corporate Ridge, College West)';

update catalysts set
  infrastructure_type = 'fiber',
  infrastructure_subtype = 'QTS''s dual-fiber-entrance founding data-center facility (12851 Foster Street); legacy Sprint/AT&T telecom backbone from the former Sprint world headquarters campus (now Aspiria); Evergy''s $21.6B, 5+ GW regional generation buildout through 2032, explicitly citing data-center/large-load demand.',
  development_impact_types = array['data_center'],
  development_impact_level = 'high',
  impact_area_notes = 'Existing fiber/telecom infrastructure serves this specific corridor near Foster Street; whether additional undeveloped land nearby could access the same capacity has not been documented (UNKNOWN).',
  people = '{"utility": {"utility": "Evergy"}}'::jsonb
where title = 'Overland Park College Boulevard Telecom & Data Center Corridor';
