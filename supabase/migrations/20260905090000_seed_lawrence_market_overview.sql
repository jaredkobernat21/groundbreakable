-- Real, sourced Market indicators for Lawrence, KS -- every figure below
-- was independently fetched and confirmed against its cited page during
-- this research pass (2026-09-05), not taken on a research assistant's
-- summary alone, except median household income (Neilsberg's page
-- itself returned HTTP 403 on direct fetch -- the figure is taken from a
-- search-engine result snippet of that page, hence 'reported' rather
-- than 'verified' confidence). census.gov and the two employer-directory
-- pages (edclawrence.com, growlawrence.org) also returned 403 on direct
-- fetch and could not be used as primary sources this pass.

insert into sources (agency, title, source_type, url, published_date) values
  ('Lawrence Journal-World (Town Talk)', 'Latest Census numbers show Lawrence lost population; only Kansas city of 40K or more to post a loss', 'news',
   'https://www2.ljworld.com/weblogs/town_talk/2026/may/15/latest-census-numbers-show-lawrence-lost-population-only-kansas-city-of-40k-or-more-to-post-a-loss/', '2026-05-15'),
  ('U.S. Bureau of Labor Statistics (via FRED)', 'All Employees: Total Nonfarm in Lawrence, KS (MSA) [LAWR920NA]', 'agency_document',
   'https://fred.stlouisfed.org/series/LAWR920NA', '2026-08-21'),
  ('U.S. Bureau of Labor Statistics (via FRED)', 'Unemployment Rate in Lawrence, KS (MSA) [LAWR920UR]', 'agency_document',
   'https://fred.stlouisfed.org/series/LAWR920UR', '2026-09-02'),
  ('Lawrence Journal-World (Town Talk)', 'With half the year done, Lawrence again on pace to set record low for single family home construction', 'news',
   'https://www2.ljworld.com/weblogs/town_talk/2026/jul/21/with-half-the-year-done-lawrence-again-on-pace-to-set-record-low-for-single-family-home-construction/', '2026-07-21'),
  ('Neilsberg (citing U.S. Census Bureau ACS)', 'Lawrence, KS Median Household Income -- 2025 Update', 'other',
   'https://www.neilsberg.com/insights/lawrence-ks-median-household-income/', '2026-01-01'),
  ('The Lawrence Times', 'Lawrence UPS hub set to close this year', 'news',
   'https://lawrencekstimes.com/2025/03/26/lawrence-ups-hub-to-close/', '2025-03-26');

insert into market_indicators (market_id, metric_key, label, unit, current_value, current_value_date, prior_value, prior_value_date, change_absolute, change_percent, trend, notes, source_id, confidence)
select
  m.id, 'population', 'Population', 'people',
  96367, '2025-07-01', 96441, '2024-07-01', -74, -0.0767, 'down',
  'Lawrence was reportedly the only Kansas city of 40,000+ residents to post a population loss in this estimate cycle.',
  (select id from sources where url = 'https://www2.ljworld.com/weblogs/town_talk/2026/may/15/latest-census-numbers-show-lawrence-lost-population-only-kansas-city-of-40k-or-more-to-post-a-loss/'),
  'verified'
from markets m where m.slug = 'lawrence-ks';

insert into market_indicators (market_id, metric_key, label, unit, current_value, current_value_date, prior_value, prior_value_date, change_absolute, change_percent, trend, notes, source_id, confidence)
select
  m.id, 'nonfarm_employment', 'Nonfarm Employment', 'thousands_of_jobs',
  54.7, '2026-07-01', 54.7, '2025-07-01', 0, 0.0, 'flat',
  'Lawrence, KS MSA, seasonally adjusted.',
  (select id from sources where url = 'https://fred.stlouisfed.org/series/LAWR920NA'),
  'verified'
from markets m where m.slug = 'lawrence-ks';

insert into market_indicators (market_id, metric_key, label, unit, current_value, current_value_date, prior_value, prior_value_date, change_absolute, change_percent, trend, notes, source_id, confidence)
select
  m.id, 'unemployment_rate', 'Unemployment Rate', 'percent',
  3.5, '2026-07-01', 3.5, '2025-07-01', 0, 0.0, 'flat',
  'Lawrence, KS MSA.',
  (select id from sources where url = 'https://fred.stlouisfed.org/series/LAWR920UR'),
  'verified'
from markets m where m.slug = 'lawrence-ks';

insert into market_indicators (market_id, metric_key, label, unit, current_value, current_value_date, prior_value, prior_value_date, change_absolute, change_percent, trend, notes, source_id, confidence)
select
  m.id, 'single_family_permits', 'Single-Family Building Permits', 'permits',
  36, '2025-12-31', 57, '2024-12-31', -21, -0.3684, 'down',
  'A record low for Lawrence -- the 4th time in 5 years (with 2024, 2023, 2022, 2011) the city has built under 100 new single-family homes in a year. Duplex permitting is up over the same window (36 through June 2026 vs. 16 through June 2025), a partial offset not reflected in this single-family-only figure.',
  (select id from sources where url = 'https://www2.ljworld.com/weblogs/town_talk/2026/jul/21/with-half-the-year-done-lawrence-again-on-pace-to-set-record-low-for-single-family-home-construction/'),
  'verified'
from markets m where m.slug = 'lawrence-ks';

insert into market_indicators (market_id, metric_key, label, unit, current_value, current_value_date, prior_value, prior_value_date, change_absolute, change_percent, trend, notes, source_id, confidence)
select
  m.id, 'median_household_income', 'Median Household Income', 'usd',
  69746, '2024-12-31', 68756, '2023-12-31', 990, 0.0144, 'up',
  'ACS-derived estimate via Neilsberg; the underlying page could not be independently re-fetched to confirm this pass (returned HTTP 403), so this is Reported rather than Verified confidence.',
  (select id from sources where url = 'https://www.neilsberg.com/insights/lawrence-ks-median-household-income/'),
  'reported'
from markets m where m.slug = 'lawrence-ks';

insert into market_overviews (market_id, summary, major_employers, major_employers_note, recent_employer_changes, new_business_activity, source_ids)
select
  m.id,
  'Lawrence''s population dipped slightly in the latest Census estimate and single-family home construction fell to a record low in 2025, while jobs and unemployment held flat -- a market that reads as plateauing rather than growing. The one confirmed employer move in this window was a closure (UPS''s local hub), though household income and duplex permitting both ticked up as a partial counterweight.',
  array['University of Kansas'],
  'The University of Kansas is Lawrence''s dominant employer beyond reasonable dispute, but a fuller ranked list with employee counts would need a direct pull from the city/chamber''s major-employers pages (edclawrence.com, growlawrence.org), both of which returned access errors during this research pass -- other names found via secondary aggregators had inconsistent, unverified employee counts and were left out rather than presented as fact.',
  array['UPS closed its Lawrence hub at 331 NE Industrial Lane on June 17, 2025, an estimated 80-100 employees affected (unconfirmed by the company), as part of a nationwide network-optimization push -- no comparable employer expansion was found in the same window.'],
  null, -- honestly no verifiable public data found for new business formation/licensing specific to Lawrence or Douglas County this pass
  array[(select id from sources where url = 'https://lawrencekstimes.com/2025/03/26/lawrence-ups-hub-to-close/')]
from markets m where m.slug = 'lawrence-ks';
