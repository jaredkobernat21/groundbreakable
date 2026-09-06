-- Seventh Lawrence research pass (Jared, 2026-09-06): infrastructure/CIP
-- data, following up on a prior research note that Lawrence's CIP PDF
-- "wasn't worth the poppler-utils detour" -- found real, current,
-- specific figures through the Lawrence Times' own CIP coverage instead
-- of the raw PDF, no PyMuPDF needed this time.
--
-- Two new major infrastructure items, both previously untracked:
--   - Municipal Services and Operations (MSO) Campus: $130M, the
--     single largest capital project in the city's 5-year CIP. Phase 1
--     is complete and operational as of a 2026-09-05 LJWorld story (one
--     day before this research); Phase 2 ($57.5M GMP approved
--     2025-10-14) is under construction toward a fall 2027 finish.
--     Address is only ever given as "near O'Connell Rd and Venture Park
--     Dr" / "the former Farmland Industries site" -- neither resolves in
--     the Census geocoder, so this is a shift (nullable lat/lng) rather
--     than a projects row, same handling as Mercato/Floret Hill/Cedar
--     Grove/Langston Way earlier this session.
--   - Downtown Transit Station: $2.03M, real address (8th & Vermont St,
--     City Lot #14), construction targeted for completion Q3 2026 per
--     the site-selection coverage.
--   - K-10 west leg utility relocations ($6M, 2026) -- a corridor-wide
--     utility project, no single address, added with nullable lat/lng.
--
-- Also enriched the two already-tracked street shifts (Iowa St, Mass
-- St) with their real CIP line-item budgets, and confirmed via search
-- that 711 New Hampshire's stage is still accurate: the exclusivity
-- agreement wasn't allowed to simply expire -- the City Commission's
-- 2026-06-09 vote (already on file) specifically deferred to negotiate
-- a new agreement, with a $100,000 sale price now confirmed. Description
-- updated with that detail; stage (review_planning) unchanged since
-- nothing has been formally approved or denied yet.

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('Lawrence Journal-World', 'Lawrence''s Municipal Services and Operations staff is ''really proud to work'' at new, more efficient campus', 'news',
     'https://www2.ljworld.com/news/city-government/2026/sep/05/lawrences-municipal-services-and-operations-staff-is-really-proud-to-work-at-new-more-efficient-campus/', '2026-09-05'),
    ('The Lawrence Times', 'Lawrence city commissioners approve $57.5M for second phase of city''s municipal services campus', 'news',
     'https://lawrencekstimes.com/2025/10/14/lawrencecitycomm-mso-phase2-gmp/', '2025-10-14'),
    ('The Lawrence Times', 'Lawrence City Commission to weigh in on proposed 5-year capital improvement plan', 'news',
     'https://lawrencekstimes.com/2025/06/16/citycomm-pre-2026-2030-cip/', '2025-06-17'),
    ('The Lawrence Times', 'Lawrence City Commission approves plans for downtown bus station near 8th and Vermont', 'news',
     'https://lawrencekstimes.com/2024/12/17/downtown-transit-station-site/', '2024-12-17')
  returning id, url
),
market as (
  select id from markets where slug = 'lawrence-ks'
)

insert into shifts (market_id, category, shift_type, event, description, event_date, stage, impact, audience, address, lat, lng, source_id, raw_data)
select market.id, 'infrastructure'::shift_category, 'municipal_facility',
  'Municipal Services and Operations Campus: Phase 1 complete, Phase 2 underway toward $130M total',
  '50-acre consolidated city operations campus on the former Farmland Industries fertilizer plant site, near O''Connell Rd and Venture Park Dr in eastern Lawrence. Phase 1 (Streets, Traffic, Stormwater, Water Distribution, Wastewater Collection, Administration, Construction Management, and Engineering & Development divisions) is complete and operational as of Sept. 2026. Phase 2 (Solid Waste division and the central vehicle maintenance garage, $57.5M GMP approved 2025-10-14) is under construction, targeting a fall 2027 finish. Total project cost ~$130 million -- the single largest item in the city''s 2026-2030 Capital Improvement Plan. No street address resolves in the Census geocoder -- no fabricated coordinate.',
  '2026-09-05'::date, 'Phase 1 complete and operational -- Phase 2 under construction', 'high'::shift_impact,
  array['contractor', 'investor']::shift_audience[], 'Near O''Connell Rd and Venture Park Dr, Lawrence, KS',
  null, null, (select id from new_sources where new_sources.url like '%more-efficient-campus%'),
  '{"total_cost_usd": 130000000, "phase2_gmp_usd": 57500000, "phase2_completion_target": "fall 2027"}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'transit_station',
  'Downtown Transit Station under construction at 8th and Vermont',
  'New downtown bus station at City parking Lot #14 (8th & Vermont St), selected Dec. 2024 after a two-site final review. Total budget $2.03 million (~$1.6M federal, ~$406K city match from transit sales tax revenue). Design began late 2025, construction was slated to start early 2026 with completion targeted for Q3 2026. Includes bus bays, weather canopies, benches, restrooms, and staffed security 6am-8pm Mon-Sat.',
  '2024-12-17'::date, 'Construction underway -- completion targeted Q3 2026', 'medium'::shift_impact,
  array['contractor']::shift_audience[], '800 Vermont St, Lawrence, KS',
  38.969323781031, -95.237032208363, (select id from new_sources where new_sources.url like '%downtown-transit-station-site%'),
  '{"total_budget_usd": 2030000, "federal_share_usd": 1600000, "city_match_usd": 406000}'::jsonb
from market
union all
select market.id, 'infrastructure'::shift_category, 'utility_relocation',
  'K-10 west leg utility relocations: $6M budgeted for 2026',
  'City-wide Capital Improvement Plan line item for utility relocations tied to the Kansas Highway 10 west leg expansion -- $6 million budgeted for 2026, part of a $386.5M five-year (2026-2030) CIP with $157.3M (40%) allocated to 2026 alone. Corridor-wide utility work, not a single site -- no fabricated coordinate.',
  '2025-06-17'::date, 'Budgeted for 2026', 'medium'::shift_impact,
  array['contractor', 'developer']::shift_audience[], 'K-10 west leg corridor, Lawrence, KS',
  null, null, (select id from new_sources where new_sources.url like '%citycomm-pre-2026-2030-cip%'),
  '{"budget_2026_usd": 6000000, "cip_total_2026_2030_usd": 386500000}'::jsonb
from market;

update shifts set
  description = description || ' Budgeted at $1.2M in the city''s adopted 2026-2030 Capital Improvement Plan.'
where market_id = (select id from markets where slug = 'lawrence-ks')
  and event = 'Iowa Street mill and overlay nearing completion';

update shifts set
  description = description || ' The full 14th-to-23rd corridor reconfiguration this grant is part of is budgeted at $4.7M in the city''s adopted 2026-2030 Capital Improvement Plan.'
where market_id = (select id from markets where slug = 'lawrence-ks')
  and event = 'Massachusetts Street bus stops awarded $50,000 grant';

update projects set
  description = description || ' The City Commission''s 2026-06-09 deferral (rather than an outright sale approval) was specifically to negotiate a new exclusivity agreement after the original one''s June 2026 expiration -- the proposed sale price is $100,000.'
where market_id = (select id from markets where slug = 'lawrence-ks') and title = '711 New Hampshire';
