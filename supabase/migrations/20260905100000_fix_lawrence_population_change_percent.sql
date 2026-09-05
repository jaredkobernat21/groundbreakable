-- Fix a 100x arithmetic error in the population indicator seeded by
-- 20260905090000: change_percent must be a fraction (0.0144 = 1.44%,
-- matching every other row in that migration), but population was
-- seeded as -0.0767 (i.e. -7.67%) when -74/96441 is actually -0.000767
-- (-0.0767%) -- the card was rendering "-7.7%" instead of the correct
-- "-0.1%".
update market_indicators
set change_percent = -74.0 / 96441.0
where metric_key = 'population'
  and market_id = (select id from markets where slug = 'lawrence-ks');
