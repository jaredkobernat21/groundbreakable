-- Closes a real gap found while auditing every market for coverage
-- (Jared, 2026-09-07): Gardner and Spring Hill, KS both had real
-- infrastructure/momentum shifts on file (sewer capacity expansion,
-- road extension, KDOT interchange study) and a growth_areas polygon
-- each, but zero development_opportunities -- meaning Dan Lynch, who
-- targets both, had no specific parcel to act on in either market.
--
-- Both parcels below are real, currently-marketed land listings
-- directly inside the growth corridors those existing shifts describe
-- (Gardner's 199th St extension corridor; Spring Hill's Renner Rd /
-- Connect56 interchange corridor), cross-checked across two
-- independent listing sources each for consistent address/acreage/
-- price. Neither has a verified geocode, so latitude/longitude are
-- left null rather than estimated -- an address without a pin beats a
-- pin without a source.
--
-- Perry, KS is deliberately left with zero development_opportunities:
-- its only real, addressed listing (Brown Subdivision) is Dan's own
-- active build, not a new opportunity to surface to him, and no other
-- real distressed/for-sale parcel or credible listing turned up in a
-- direct search. Bettendorf, IA (Joel's other market) is also left as
-- is -- the only "listings" found for it were generic foreclosure-
-- aggregator marketing pages with no verifiable individual addresses,
-- which fails this project's sourcing bar.

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a8000000-0000-4000-8000-000000000001', 'Arrowhead Land Company', 'W 199th St Lot AHLC12, Gardner, KS 66030 (12.5 +/- acres, $600,000, agent Shea Miller)', 'other', 'https://www.highrises.com/realestateandhomes-detail/W-199th-St-Lot-AHLC12_Gardner_KS_66030_M91115-74143', null),
  ('a8000000-0000-4000-8000-000000000002', 'LoopNet', '19615 S Renner Rd, Spring Hill, KS 66083 (4.1 acres, $265,000)', 'other', 'https://www.loopnet.com/property/19615-s-renner-rd-spring-hill-ks-66083/20091-9P680000000005/', null);

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'gardner-ks'),
    '26755 W 199th St, Gardner, KS 66030 (12.5 +/- acres)',
    null, null,
    'Blacktop-Frontage Land Position -- 199th St Growth Corridor', 'medium', 'early_project', 'development',
    array['raw_land','utilities_at_road','growth_corridor_adjacent'],
    array[
      'Sits directly on W 199th St, the same corridor Gardner is actively extending toward the Cedar Niles/Renner growth area (199th St extension construction began Dec 2025)',
      'Blacktop road frontage with utilities available at the road, per the listing (agent Shea Miller, Arrowhead Land Company) -- not raw, unimproved acreage',
      'An identical adjacent 12.5+/- acre parcel is also available from the same seller, allowing a larger assembled position if desired',
      'Verify current listing status directly with Arrowhead Land Company before an offer -- not independently confirmed via a live MLS pull'
    ],
    array['a8000000-0000-4000-8000-000000000001'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'spring-hill-ks'),
    '19615 S Renner Rd, Spring Hill, KS 66083 (4.1 acres)',
    null, null,
    'Land Position -- Renner Rd Growth Corridor', 'medium', 'early_project', 'development',
    array['raw_land','growth_corridor_adjacent'],
    array[
      'Sits directly in the Renner Rd corridor KDOT''s "Connect56" study is evaluating for a future I-35/US-56/175th St interchange, explicitly framed around anticipated growth',
      'Also inside the growth band tied to Spring Hill''s planned wastewater treatment plant expansion (0.13 MGD today, up to 30 MGD planned) -- utility capacity is being built ahead of demand here',
      'Listed on both Compass and LoopNet -- cross-referenced across two independent sources, not a single listing',
      'Verify current listing status and zoning directly before an offer -- not independently confirmed via a live MLS pull'
    ],
    array['a8000000-0000-4000-8000-000000000002'::uuid],
    '2026-09-07'
  );
