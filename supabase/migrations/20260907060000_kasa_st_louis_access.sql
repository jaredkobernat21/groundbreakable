-- Personalizes KASA Acquisitions' (Rafael Nunez) dashboard (Jared,
-- 2026-09-07: "now kasa"). Unlike Dan Lynch/Alexander Vaught/Fredo, this
-- needs no new market or fresh research: KASA is the same persona
-- (distressed residential cash buyer) in the same metro as Fredo
-- (Florissant, MO is a St. Louis County suburb), and the St. Louis
-- market + real distress data just seeded for Fredo
-- (20260907050000_fredo_st_louis_expansion.sql -- the LRA's 8,224-
-- property inventory, the Building Division's live vacant-buildings
-- data, the two resolved Martin Luther King Dr parcels) is genuinely
-- relevant here too, not a reused placeholder. His profile already had
-- property_types containing "redevelopment" from account creation, so
-- the same-day distress-match scoring fix (clientMatchScoring.ts)
-- applies to him immediately.
--
-- Florissant/St. Louis County itself isn't separately tracked -- "St.
-- Louis" here is the same metro-area proxy already used for Alexander
-- Vaught's Bonner Springs/Basehor access to Piper, not a claim that
-- Florissant-specific data exists. His other two stated states (FL, TX)
-- remain fully untracked and are noted as deferred, same as every other
-- footprint gap on the other three accounts.

insert into investor_markets (investor_id, market_id)
select (select id from investor_profiles where full_name = 'Rafael Nunez'), id from markets where slug = 'st-louis-mo';

update opportunity_profiles
set
  target_market_ids = target_market_ids || (select array_agg(id) from markets where slug = 'st-louis-mo'),
  notes = notes || E'\n\nUpdated 2026-09: granted access to the St. Louis market (Jared: "now kasa") -- same real ' ||
    'distress data just seeded for Fredo (Arbor House Buyers), a same-persona/same-metro account (Florissant is a ' ||
    'St. Louis County suburb). Florissant/St. Louis County itself isn''t separately tracked -- this is a metro-area ' ||
    'proxy, same convention as Alexander Vaught''s Bonner Springs/Basehor access to Piper before Kansas City KS ' ||
    'existed as its own market. Florida and Texas (his other two stated states) remain fully untracked.'
where investor_profile_id = (select id from investor_profiles where full_name = 'Rafael Nunez');
