-- Real, sourced market_indicators for the Nashville market (Jared,
-- 2026-09-29's "fill Nashville with real data" ask), matching the same 5
-- metrics every other market carries (population, median_household_income,
-- nonfarm_employment, unemployment_rate, single_family_permits). Every
-- figure below is pulled directly from FRED (which republishes BLS/Census
-- series) or Census ACS data as reported by DataUSA.io -- current and
-- prior-year values are both real, dated points from those series, not
-- estimated or interpolated. single_family_permits uses a trailing
-- 12-month sum (not a single month) to stay comparable to how other
-- markets' annual permit counts read -- computed from FRED's monthly
-- NASH947BP1FH series, Sep 2025-Aug 2026 vs Sep 2024-Aug 2025.

with new_sources as (
  insert into sources (agency, title, source_type, url, published_date) values
    ('U.S. Census Bureau (via FRED)', 'Resident Population in Nashville-Davidson--Murfreesboro--Franklin, TN (MSA) [NVLPOP]',
     'agency_document', 'https://fred.stlouisfed.org/series/NVLPOP', '2025-01-01'),
    ('DataUSA.io (citing U.S. Census Bureau ACS)', 'Nashville-Davidson--Murfreesboro--Franklin, TN Median Household Income',
     'other', 'https://datausa.io/profile/geo/nashville-davidson-murfreesboro-franklin-tn', '2024-01-01'),
    ('U.S. Bureau of Labor Statistics (via FRED)', 'All Employees: Total Nonfarm in Nashville-Davidson--Murfreesboro--Franklin, TN (MSA) [NASH947NA]',
     'agency_document', 'https://fred.stlouisfed.org/series/NASH947NA', '2026-08-01'),
    ('U.S. Bureau of Labor Statistics (via FRED)', 'Unemployment Rate in Nashville-Davidson--Murfreesboro--Franklin, TN (MSA) [LAUMT473498000000003]',
     'agency_document', 'https://fred.stlouisfed.org/series/LAUMT473498000000003', '2026-07-01'),
    ('U.S. Census Bureau (via FRED)', 'New Private Housing Units Authorized by Building Permits: 1-Unit Structures in Nashville-Davidson--Murfreesboro--Franklin, TN (MSA) [NASH947BP1FH]',
     'agency_document', 'https://fred.stlouisfed.org/series/NASH947BP1FH', '2026-08-01')
  returning id, url
),
market as (
  select id from markets where slug = 'nashville-tn'
)

insert into market_indicators (market_id, metric_key, label, unit, current_value, current_value_date, prior_value, prior_value_date, change_absolute, change_percent, trend, notes, source_id, confidence)
select market.id, 'population', 'Population', 'people',
  2197416, '2025-01-01'::date, 2162758, '2024-01-01'::date, 34658, 1.6027, 'up',
  'Nashville-Davidson--Murfreesboro--Franklin MSA, annual estimate.',
  (select id from new_sources where url like '%NVLPOP%'), 'verified'
from market
union all
select market.id, 'median_household_income', 'Median Household Income', 'usd',
  85447, '2024-01-01'::date, 82499, '2023-01-01'::date, 2948, 3.5734, 'up',
  'Nashville-Davidson--Murfreesboro--Franklin MSA, Census ACS 1-year estimate.',
  (select id from new_sources where url like '%datausa.io%'), 'verified'
from market
union all
select market.id, 'nonfarm_employment', 'Nonfarm Employment', 'thousands_of_jobs',
  1201.2, '2026-08-01'::date, 1193.8, '2025-08-01'::date, 7.4, 0.6199, 'up',
  'Nashville-Davidson--Murfreesboro--Franklin MSA, seasonally adjusted.',
  (select id from new_sources where url like '%NASH947NA%'), 'verified'
from market
union all
select market.id, 'unemployment_rate', 'Unemployment Rate', 'percent',
  3.0, '2026-07-01'::date, 3.3, '2025-07-01'::date, -0.3, -9.0909, 'down',
  'Nashville-Davidson--Murfreesboro--Franklin MSA.',
  (select id from new_sources where url like '%LAUMT473498000000003%'), 'verified'
from market
union all
select market.id, 'single_family_permits', 'Single-Family Building Permits', 'permits',
  12520, '2026-08-01'::date, 13519, '2025-08-01'::date, -999, -7.3893, 'down',
  'Trailing 12-month sum (Sep 2025-Aug 2026 vs. Sep 2024-Aug 2025), Nashville MSA -- a single month is too volatile to read as a trend on its own.',
  (select id from new_sources where url like '%NASH947BP1FH%'), 'verified'
from market;
