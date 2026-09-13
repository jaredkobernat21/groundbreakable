-- Onboards Aaron (The Oklahoma Buyer, info@theoklahomebuyer.com) as a new
-- Intelligence-tier account (Jared, 2026-09-08): a distressed-property
-- cash buyer/flipper working the Tulsa, OK metro. Same persona as Fredo
-- (Arbor House Buyers) and KASA Acquisitions -- see clientMatchScoring.ts's
-- distress-match path (property_types containing 'redevelopment') -- but
-- unlike them, Aaron gets a stronger "emerging area" match bonus turned on
-- (multiple watches_* flags, not just watches_housing_shortage) because he
-- explicitly asked for it: "a plus if you can get distressed properties in
-- an emerging/developing area (using the plans signals and
-- projects/development)."
--
-- His auth.users row was created directly via the Supabase admin API
-- (service-role client, auth.admin.createUser) rather than the usual
-- manual-Studio process -- same end state, no invite email sent yet.
-- Jared can trigger his actual login (magic link / password reset) from
-- Supabase Studio whenever he's ready to hand Aaron real access.
--
-- Data below is scoped exactly to his own stated priority order:
-- (1) off-market gems: tax resale/liens, pre-foreclosure docket, absentee
-- owners, code violations, and one flagship real find (an HOA lien
-- foreclosure priced at a third of its own building's comps); (2) real
-- emerging-area growth signals (a $1B+ employer, a downtown TIF plan, a
-- federal tech-hub award, and Owasso/Bixby capital projects) so the
-- match-scoring "emerging area" bonus has real content to score against;
-- (3) current/active sheriff-sale auctions, deliberately kept low-impact
-- and summarized in aggregate rather than itemized, exactly as he asked
-- ("more investors know about them by then").
--
-- Every fact traces to a real, dated public source: Tulsa County
-- Treasurer (June resale auction + land list), Tulsa County Assessor,
-- OSCN, City of Tulsa code enforcement (EnerGov/Code Enforcement Status
-- Map), Meta's own April 2026 press release + Tulsa World, Downtown Tulsa
-- Partnership, the federal EDA, NewsOn6, the OWRB, and the City of Bixby.
-- The 5 RealtyTrac-sourced auction leads carry forward from the
-- previously-delivered AaronTULOKpreview.pdf (ROQ Invest); the Unit 802
-- HOA-foreclosure find is new, cross-referenced from a Tulsa County
-- Sheriff's Office auction listing against the Assessor's record for the
-- building's Unit 701 to confirm the discount is real.

-- --- account ---

insert into investor_profiles (id, full_name, role, professional_role, subscription_tier) values
  ('f612a417-f5e0-4ca2-a6d9-137d66fbdb4c', 'Aaron', 'investor', 'investor', 'intelligence');

-- --- markets ---

insert into markets (slug, name, state, center_lat, center_lng, default_zoom) values
  ('tulsa-ok', 'Tulsa', 'OK', 36.1540, -95.9928, 12),
  ('owasso-ok', 'Owasso', 'OK', 36.2695, -95.8547, 13),
  ('bixby-ok', 'Bixby', 'OK', 35.9420, -95.8833, 13);

insert into investor_markets (investor_id, market_id)
select 'f612a417-f5e0-4ca2-a6d9-137d66fbdb4c', id from markets where slug in ('tulsa-ok', 'owasso-ok', 'bixby-ok');

-- --- opportunity profile ---
-- property_types containing 'redevelopment'/'infill' is the existing
-- signal that flags a profile as distress-oriented (see Fredo). The
-- watches_* flags below are deliberately broader than Fredo's (which
-- only turns on watches_housing_shortage) -- Aaron explicitly asked for
-- an emerging-area bonus, and keywordBonus in clientMatchScoring.ts
-- reads these flags directly against shift/opportunity keywords
-- (employer, road, utility, capital-improvement, housing).

insert into opportunity_profiles (
  investor_profile_id, profile_name, is_active, profile_type,
  target_market_ids, property_types,
  watches_employer_announcements, watches_road_investment, watches_utility_expansion,
  watches_capital_improvements, watches_housing_shortage,
  strategic_preferences, notes
) values (
  'f612a417-f5e0-4ca2-a6d9-137d66fbdb4c', 'Primary', true, 'investor_developer',
  (select array_agg(id) from markets where slug in ('tulsa-ok', 'owasso-ok', 'bixby-ok')),
  array['redevelopment', 'infill']::text[],
  true, true, true,
  true, true,
  array['buy_and_hold']::text[],
  E'Aaron, The Oklahoma Buyer (info@theoklahomebuyer.com). Opportunistic distressed-property cash buyer/flipper -- ' ||
  E'no fixed price ceiling, single-family, any condition, working Tulsa + a 45-minute radius (Owasso, Bixby & beyond). ' ||
  E'Priority order per his own instructions (2026-09-08): (1) off-market gems -- tax liens/resale, pre-foreclosures, ' ||
  E'absentee owners, code violations; (2) a bonus for distress signals sitting in high-comp-ARV or emerging/developing ' ||
  E'areas; (3) current/active sheriff-sale auctions included but deliberately lower priority, since by auction stage ' ||
  E'more investors already know about them.\n\n' ||
  E'Prior deliverable on file: AaronTULOKpreview.pdf (ROQ Invest), a RealtyTrac-sourced 5-lead auction briefing -- ' ||
  E'those 5 leads are carried into this account''s Opportunities feed below, tagged medium (auction-stage, already ' ||
  E'publicly visible) rather than high. The flagship new find is an HOA-lien foreclosure at the same building as one ' ||
  E'of those 5 leads (4350 E 67th St, Willow Creek Condos III), priced at roughly a third of the building''s own ' ||
  E'comps -- HOA sheriff sales draw far fewer bidders than the bank/servicer sales that dominate the same auction ' ||
  E'docket, making it a genuinely overlooked lead rather than a repeat of the PDF''s auction-stage picks.'
);

-- --- sources ---

insert into sources (id, agency, title, source_type, url, published_date) values
  ('ac000000-0000-4000-8000-000000000001', 'Tulsa County Treasurer', 'June Real Estate (Tax Resale) Auction', 'agency_document', 'https://www2.tulsacounty.org/treasurer/properties-for-sale/june-real-estate-auction/', null),
  ('ac000000-0000-4000-8000-000000000002', 'Tulsa County Treasurer', '2026 Tax Resale Land List (report TR01033, 1,371 parcels)', 'agency_document', 'https://www2.tulsacounty.org/media/w1oda5pc/land-list.pdf', '2026-04-27'),
  ('ac000000-0000-4000-8000-000000000003', 'Tulsa County Treasurer', 'Tax Roll / Delinquent Tax Search', 'agency_gis', 'http://www.treasurer.tulsacounty.org/taxrollviewer/TaxSearch.aspx', null),
  ('ac000000-0000-4000-8000-000000000004', 'Oklahoma State Courts Network (OSCN)', 'District Court Docket Search — Tulsa County', 'public_record', 'https://www.oscn.net/dockets/Search.aspx', null),
  ('ac000000-0000-4000-8000-000000000005', 'Tulsa County Assessor', 'Property Search (owner name + mailing address vs. situs address, all parcels)', 'agency_gis', 'https://assessor.tulsacounty.org/', null),
  ('ac000000-0000-4000-8000-000000000006', 'Tulsa County Assessor', 'Property record — 4350 E 67th St Unit 701 Bldg C-19 (parcel R74125830431392)', 'agency_gis', 'https://assessor.tulsacounty.org/Property/Info?accountNo=R74125830431392', null),
  ('ac000000-0000-4000-8000-000000000007', 'Tulsa County Sheriff''s Office', 'Property Auctions (sheriff-sale docket)', 'public_record', 'https://tcso.org/resources/property-auctions/', null),
  ('ac000000-0000-4000-8000-000000000008', 'City of Tulsa', 'EnerGov Self-Service Portal — Code Case search by address', 'agency_gis', 'https://tulsaok.tylertech.com/EnerGov4934/SelfService', null),
  ('ac000000-0000-4000-8000-000000000009', 'City of Tulsa', 'Code Enforcement Status Map', 'agency_gis', 'https://www.cityoftulsa.org/code', null),
  ('ac000000-0000-4000-8000-000000000010', 'RealtyTrac', '74136 / Tulsa County foreclosure & auction listings', 'other', 'https://www.realtytrac.com/tulsa-county-ok/foreclosure/auction/', null),
  ('ac000000-0000-4000-8000-000000000011', 'Meta', 'Breaking Ground on a New AI-Optimized Data Center in Tulsa, Oklahoma ("Project Anthem")', 'press_release', 'https://about.fb.com/news/2026/04/breaking-ground-new-ai-optimized-data-center-tulsa-oklahoma/', '2026-04-01'),
  ('ac000000-0000-4000-8000-000000000012', 'Tulsa World', 'Meta breaks ground on $1B+ AI data center at Fair Oaks Industrial Park', 'news', 'https://tulsaworld.com/news/local/business/article_325632db-1899-41b0-b810-4ace687f282e.html', '2026-04-01'),
  ('ac000000-0000-4000-8000-000000000013', 'Downtown Tulsa Partnership', 'DTP Shares New Plan for Downtown Tulsa, Guiding Nearly $30 Million in Investment', 'press_release', 'https://downtowntulsa.com/release/dtp-shares-new-plan-for-downtown-tulsa-guiding-nearly-30-million-in-investment', '2026-01-15'),
  ('ac000000-0000-4000-8000-000000000014', 'U.S. Economic Development Administration', 'Tulsa Tech Hub designation ($51M, Regional Technology and Innovation Hubs program)', 'agency_document', 'https://www.eda.gov/funding/programs/regional-technology-and-innovation-hubs/2023/Tulsa-Tech-Hub', null),
  ('ac000000-0000-4000-8000-000000000015', 'NewsOn6', 'Owasso Public Works consolidated facility construction timeline (~$30M, E 116th St)', 'news', 'https://www.newson6.com/story/685414f806606323c48112cf/owasso-public-works-facility-construction-timeline', null),
  ('ac000000-0000-4000-8000-000000000016', 'Oklahoma Water Resources Board (OWRB)', 'Bixby Public Works Authority receives $9,850,000 loan for water/wastewater system improvements', 'agency_document', 'https://oklahoma.gov/owrb/news-and-events/media/2025/bixby-public-works-authority-receives-9850000-loan-for-water-and-wastewater-system-improvements-from-the-owrb.html', '2025-01-01'),
  ('ac000000-0000-4000-8000-000000000017', 'City of Bixby', '2026 Bond — Downtown Master Plan public improvements', 'agency_document', 'https://www.bixbyok.gov/786/2026-Bond', null);

-- --- shifts: off-market discovery channels + one flagship gem (distress) ---

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, address, lat, lng, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'tulsa-ok'), 'distress', 'tax_resale_list',
    'Tulsa County''s 2026 tax resale land list carries 1,371 delinquent parcels countywide',
    'Oklahoma counties hold an annual real-estate tax resale on the second Monday of June (Title 68 O.S. §3113/3125) for parcels 3+ years delinquent. The live 2026 Land List (report TR01033, data as of 4/27/2026) lists 1,371 numbered parcels with parcel number, legal description, land-use code, and minimum bid (2/3 of assessed value or total delinquent taxes+costs, whichever is less). Owasso and Bixby addresses both appear on the countywide list (~23 mentions each) alongside Tulsa proper. Owners can redeem right up to auction start, so the list shrinks daily -- pull fresh close to the June date.',
    '2026-04-27', 'high', null, null, null, array['investor','developer']::shift_audience[],
    'ac000000-0000-4000-8000-000000000002', now()
  ),
  (
    (select id from markets where slug = 'tulsa-ok'), 'distress', 'tax_excess_resale',
    'A year-round Excess Resale inventory of unsold/repeat tax-resale properties is also public',
    'Separate from the annual June auction, the Treasurer maintains an Excess Resale list of properties that didn''t sell (or sold and reverted) at a prior resale -- available for purchase outside the once-a-year auction window, a genuinely off-cycle channel most casual auction-followers miss.',
    '2026-09-08', 'medium', null, null, null, array['investor','developer']::shift_audience[],
    'ac000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'tulsa-ok'), 'distress', 'hoa_lien_foreclosure',
    'HOA lien foreclosure at 4350 E 67th St Unit 802 (Willow Creek Condos III) appraised at $20,600 -- a third of the building''s own comps',
    'Case CJ-2025-5225: Willow Creek [HOA] v. Cornerstone, scheduled on the Tulsa County Sheriff''s Oct 7, 2026 auction docket. The county Assessor''s own record for this building''s Unit 701 (parcel R74125830431392) carries a current Fair Cash Market Value of $60,400 -- nearly 3x this unit''s $20,600 appraisal. HOA-plaintiff sheriff sales sit on the same public docket as bank/servicer sales but draw far fewer competing bidders, who mostly watch for the big loan-servicer names.',
    '2026-10-07', 'high', '4350 E 67th St Unit 802, Tulsa, OK 74136', 36.066485, -95.928198, array['investor','developer']::shift_audience[],
    'ac000000-0000-4000-8000-000000000007', now()
  ),
  (
    (select id from markets where slug = 'tulsa-ok'), 'distress', 'pre_foreclosure_docket_method',
    'OSCN''s Tulsa County District Court docket search can surface mortgage-foreclosure (CJ) filings before they ever reach a sheriff sale',
    'OSCN''s free docket search filters by county and filed-date range, and civil mortgage-foreclosure cases file under case type CJ -- the same case-type prefix behind every existing sheriff-sale listing (compare CJ-2025-xxxx case numbers above), just caught earlier in the pipeline, before the sheriff-sale stage every other investor is already watching. No dedicated "foreclosure" flag exists, so it takes scanning CJ filings against known plaintiff patterns (banks/servicers/mortgage trusts) rather than a clean filtered export -- a real but manual/scriptable channel, flagged here as needing follow-up rather than fully automated yet.',
    '2026-09-08', 'medium', null, null, null, array['investor']::shift_audience[],
    'ac000000-0000-4000-8000-000000000004', now()
  ),
  (
    (select id from markets where slug = 'tulsa-ok'), 'distress', 'absentee_owner_method',
    'Tulsa County Assessor''s public property search exposes the standard absentee-owner tell: mailing address vs. situs address',
    'assessor.tulsacounty.org is free, requires no login, and covers every parcel in the county -- each record shows owner name and mailing address alongside the property''s actual (situs) address, so an owner whose mail goes somewhere else is directly visible parcel-by-parcel. No official bulk export/API from the Assessor itself; third-party resellers (Regrid, ReportAll) offer bulk parcel extracts if volume lookups are ever needed.',
    '2026-09-08', 'medium', null, null, null, array['investor']::shift_audience[],
    'ac000000-0000-4000-8000-000000000005', now()
  ),
  (
    (select id from markets where slug = 'tulsa-ok'), 'distress', 'code_violation_lookup_method',
    'City of Tulsa code enforcement is address-by-address only -- no bulk dataset like some cities publish, best used to confirm candidates already found elsewhere',
    'The EnerGov Self-Service Portal returns every code case on a given address since 2018, and a separate Code Enforcement Status Map shows cases visually -- but neither offers a bulk export or API. Roughly 22,000 violations across 18,000 cases are investigated citywide per year per the city''s own reporting, so the raw volume is real, just not queryable in bulk. Treat as a verification step on a candidate already surfaced via tax-resale/foreclosure data, not as a primary sourcing funnel by itself.',
    '2026-09-08', 'low', null, null, null, array['investor']::shift_audience[],
    'ac000000-0000-4000-8000-000000000008', now()
  ),
  (
    (select id from markets where slug = 'tulsa-ok'), 'distress', 'sheriff_auction_docket',
    'Tulsa County Sheriff ran 80+ mortgage-foreclosure sheriff sales across Sept-Oct 2026 alone -- public, competitive, deliberately lower priority here',
    'Seven consecutive weekly auction dockets (Sept 9 - Oct 21, 2026) list dozens of bank/servicer foreclosure cases across Tulsa, Broken Arrow, Bixby, Owasso, Sand Springs, Jenks, Collinsville, and Skiatook, appraised roughly $0-$841,500. Every one of these is already publicly listed and actively watched by other investors by the time it reaches this docket -- exactly the "more investors already know about them" dynamic flagged as lower priority. Kept here in aggregate, not itemized case-by-case, as background market context rather than a primary lead source.',
    '2026-09-08', 'low', null, null, null, array['investor']::shift_audience[],
    'ac000000-0000-4000-8000-000000000007', now()
  );

-- --- shifts: real emerging-area growth signals (plans/infrastructure/business) ---

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, address, lat, lng, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'tulsa-ok'), 'business', 'major_employer_announcement',
    'Meta breaks ground on a $1B+, 340-acre AI-optimized data center ("Project Anthem") at Fair Oaks Industrial Park, east Tulsa',
    'Groundbreaking April 2026 at 11th St & Creek Turnpike; 1,000+ construction jobs, ~100 permanent jobs, and Meta itself committing $25M+ to local road and water infrastructure upgrades around the site -- the single largest committed private investment found anywhere in Aaron''s tracked footprint, with real dollars going into the surrounding infrastructure, not just the site itself.',
    '2026-04-01', 'high', 'Fair Oaks Industrial Park (11th St & Creek Turnpike), Tulsa, OK', 36.14786, -95.73211, array['developer','investor']::shift_audience[],
    'ac000000-0000-4000-8000-000000000011', now()
  ),
  (
    (select id from markets where slug = 'tulsa-ok'), 'plans', 'downtown_tif_plan',
    'Downtown Tulsa''s 2nd Amended TIF Project Plan adopted, guiding ~$28-30M across 41 curated downtown projects over 10 years',
    'Adopted Jan 15, 2026 by the Downtown Tulsa Partnership -- a real, dated, TIF-funded public-realm investment plan for downtown Tulsa, not a proposal.',
    '2026-01-15', 'medium', 'Downtown Tulsa, OK', null, null, array['developer','investor']::shift_audience[],
    'ac000000-0000-4000-8000-000000000013', now()
  ),
  (
    (select id from markets where slug = 'tulsa-ok'), 'business', 'federal_tech_hub_designation',
    'Tulsa named one of 12 national Tech Hubs, a $51M federal EDA award targeting autonomous systems/AI/drone industry clusters',
    'Projected by Tulsa Innovation Labs to support roughly 60,000 tech-sector jobs regionally -- a metro-level, multi-year growth signal rather than a single site.',
    '2026-01-01', 'medium', 'Tulsa, OK metro', null, null, array['developer','investor']::shift_audience[],
    'ac000000-0000-4000-8000-000000000014', now()
  ),
  (
    (select id from markets where slug = 'owasso-ok'), 'infrastructure', 'public_works_facility',
    'Owasso''s ~$30M consolidated Public Works facility under construction at E 116th St, targeting completion ~Sept 2026',
    'A real, dated capital-improvement project (not a proposal) -- Public Works consolidation of this scale typically signals a city investing ahead of growth.',
    '2026-01-01', 'medium', 'E 116th St, Owasso, OK', null, null, array['developer','investor']::shift_audience[],
    'ac000000-0000-4000-8000-000000000015', now()
  ),
  (
    (select id from markets where slug = 'bixby-ok'), 'infrastructure', 'downtown_master_plan_and_utility_upgrade',
    'Bixby pairs a $14M+ Downtown Master Plan with a $9.85M OWRB loan for water/wastewater system upgrades',
    'The Downtown Master Plan funds public improvements south of the Arkansas River; the separate OWRB-financed loan covers lift stations and downtown sewer replacement -- utility capacity and downtown public-realm investment moving together, the same "infrastructure ahead of demand" pattern worth watching in any market.',
    '2025-01-01', 'medium', 'Downtown Bixby, OK', null, null, array['developer','investor']::shift_audience[],
    'ac000000-0000-4000-8000-000000000016', now()
  );

-- --- growth_areas (corridors) ---

insert into growth_areas (market_id, name, momentum_state, narrative, thesis, catalyst_timeline, geom) values
  (
    (select id from markets where slug = 'tulsa-ok'),
    'East Tulsa / Fair Oaks – Creek Turnpike Corridor',
    'accelerating',
    E'Meta broke ground April 2026 on a $1B+, 340-acre AI data center at Fair Oaks Industrial Park.\nMeta itself is funding $25M+ of local road and water infrastructure upgrades around the site.\n1,000+ construction jobs, ~100 permanent jobs.\nThe single largest committed private investment found anywhere in Aaron''s tracked footprint.',
    'A distressed property anywhere near this corridor benefits from real, already-funded infrastructure spending (not just a project promise) and a wave of construction-phase workers needing nearby housing -- worth weighting distress leads in east Tulsa zip codes (74115, 74134) higher on that basis alone.',
    '[
      {"year":"2026","label":"Meta breaks ground on Project Anthem data center, Fair Oaks Industrial Park","status":"occurred"},
      {"year":"2026","label":"Meta-funded road/water infrastructure upgrades begin around the site","status":"occurred"}
    ]'::jsonb,
    ST_GeomFromText('MULTIPOLYGON(((-95.745 36.138, -95.719 36.138, -95.719 36.158, -95.745 36.158, -95.745 36.138)))', 4326)
  ),
  (
    (select id from markets where slug = 'bixby-ok'),
    'Bixby Downtown / Arkansas River Corridor',
    'emerging',
    E'A $14M+ Downtown Master Plan is funding public improvements south of the Arkansas River.\nA separate $9.85M OWRB loan is financing water/wastewater upgrades (lift stations, downtown sewer replacement) in the same area.\nBoth are real, dated commitments, not proposals.',
    'Utility capacity and downtown public-realm investment moving together in the same window is the same "infrastructure ahead of demand" pattern worth watching in any growth market -- Bixby-area distress leads in or near downtown carry that tailwind.',
    '[
      {"year":"2025","label":"OWRB approves $9.85M loan for Bixby water/wastewater system upgrades","status":"occurred"},
      {"year":"2026","label":"Downtown Master Plan public improvements underway","status":"occurred"}
    ]'::jsonb,
    ST_GeomFromText('MULTIPOLYGON(((-95.895 35.951, -95.869 35.951, -95.869 35.971, -95.895 35.971, -95.895 35.951)))', 4326)
  );

-- --- development_opportunities ---
-- The flagship find (Unit 802) leads at 'high' strength; the 5 RealtyTrac/
-- AaronTULOKpreview.pdf leads carry forward at 'medium' -- real, sourced,
-- steep discounts, but auction-stage and already publicly visible, per
-- Aaron's own stated lower priority for that tier.

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'tulsa-ok'),
    '4350 E 67th St Unit 802, Tulsa, OK 74136',
    36.066485, -95.928198,
    'HOA Lien Foreclosure — Priced at a Third of Building Comps', 'high', 'distress', 'development',
    array['hoa_lien_foreclosure','below_building_comps','off_radar_vs_bank_sale'],
    array[
      'HOA (not bank) foreclosure -- case CJ-2025-5225, Willow Creek [HOA] v. Cornerstone -- appraised at just $20,600, on the Tulsa County Sheriff''s Oct 7, 2026 auction docket',
      'Same building''s Unit 701 carries a county Assessor Fair Cash Market Value of $60,400 -- nearly 3x this unit''s appraisal, confirming the discount is real rather than an AVM error',
      'HOA-plaintiff sheriff sales sit on the same public docket as bank/servicer sales but draw far fewer competing bidders, who mostly watch for the big loan-servicer names dominating the rest of that week''s list',
      'Willow Creek Condos III (built 1970, 1-bed/1-bath units) has real rental comps in the $1,000-$1,450/mo range elsewhere in the complex -- genuine post-rehab cash-flow upside on a sub-$21K basis'
    ],
    array['ac000000-0000-4000-8000-000000000006'::uuid, 'ac000000-0000-4000-8000-000000000007'::uuid],
    '2026-09-08'
  ),
  (
    (select id from markets where slug = 'tulsa-ok'),
    '3541 E Ute St, Tulsa, OK 74115',
    36.183057, -95.936732,
    'Active Foreclosure — Steepest Discount to Zip Comps', 'medium', 'distress', 'development',
    array['active_foreclosure','off_mls','steep_avm_discount'],
    array[
      'RealtyTrac AVM of $57,571 ($53.31/sq ft) sits at less than half the 74115 zip''s $111/sq ft median -- the steepest apparent discount of any lead sourced for this account',
      'Confirmed absent from active Zillow/Redfin MLS inventory -- an off-MLS auction lead, not a public listing',
      '74115''s median sale price rose 13.3% YoY even as $/sq ft dipped -- a zip in flux, worth underwriting conservatively',
      'Already on RealtyTrac''s public auction feed, so treat as lower priority than the off-market/tax-resale/HOA leads above -- other investors can see this one too'
    ],
    array['ac000000-0000-4000-8000-000000000010'::uuid],
    '2026-09-08'
  ),
  (
    (select id from markets where slug = 'tulsa-ok'),
    '12920 E 32nd St, Tulsa, OK 74134',
    36.115883, -95.832153,
    'Active Foreclosure — East Tulsa', 'medium', 'distress', 'development',
    array['active_foreclosure','off_mls'],
    array[
      'RealtyTrac AVM of $148,544, active foreclosure/auction status confirmed absent from active MLS inventory',
      'East Tulsa (74134) location -- within range of the Fair Oaks/Creek Turnpike corridor''s Meta-driven infrastructure investment',
      'Already on RealtyTrac''s public auction feed, so treat as lower priority than the off-market/tax-resale/HOA leads above'
    ],
    array['ac000000-0000-4000-8000-000000000010'::uuid],
    '2026-09-08'
  ),
  (
    (select id from markets where slug = 'bixby-ok'),
    '8904 E 133rd Pl S, Bixby, OK 74008',
    35.969651, -95.878798,
    'Active Foreclosure — Bixby', 'medium', 'distress', 'development',
    array['active_foreclosure','off_mls'],
    array[
      'RealtyTrac AVM of $212,064, active foreclosure/auction status confirmed absent from active MLS inventory',
      'Bixby-area auction AVMs run materially higher than Tulsa proper ($210K-$290K vs. Tulsa''s $58K-$150K per the same RealtyTrac pull) -- a higher-basis, higher-ARV-ceiling market within the 45-minute radius',
      'Sits within Bixby''s tracked downtown/Arkansas River growth corridor, which is carrying real, funded infrastructure investment (see growth_areas)',
      'Already on RealtyTrac''s public auction feed, so treat as lower priority than the off-market/tax-resale/HOA leads above'
    ],
    array['ac000000-0000-4000-8000-000000000010'::uuid],
    '2026-09-08'
  ),
  (
    (select id from markets where slug = 'owasso-ok'),
    '7905 N 128th East Ave, Owasso, OK 74055',
    36.269959, -95.830544,
    'Active Foreclosure — Owasso', 'medium', 'distress', 'development',
    array['active_foreclosure','off_mls'],
    array[
      'RealtyTrac AVM of $245,918, active foreclosure/auction status confirmed absent from active MLS inventory',
      'Owasso-area auction AVMs run materially higher than Tulsa proper ($210K-$290K vs. Tulsa''s $58K-$150K per the same RealtyTrac pull) -- a higher-basis, higher-ARV-ceiling market within the 45-minute radius',
      'Owasso is mid-construction on a ~$30M Public Works consolidation project, a real capital-investment signal for a city investing ahead of growth',
      'Already on RealtyTrac''s public auction feed, so treat as lower priority than the off-market/tax-resale/HOA leads above'
    ],
    array['ac000000-0000-4000-8000-000000000010'::uuid],
    '2026-09-08'
  );
