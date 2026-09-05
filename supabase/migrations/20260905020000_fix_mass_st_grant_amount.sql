-- Corrects an oversight in 20260905010000: the Massachusetts Street bus
-- stop investment's own why_it_matters text cites a real "$50,000 grant"
-- but the numeric total_investment_amount/incentive_amount columns were
-- left null in that insert. Fixing forward with an update rather than
-- editing the already-pushed migration, per this project's standard
-- practice for post-seed corrections.

update investments
set total_investment_amount = 50000,
    public_investment_amount = 50000,
    incentive_amount = 50000,
    funding_source = 'Blue Cross and Blue Shield of Kansas "Pathways to a Healthy Kansas" grant'
where market_id = '068b61e6-d717-483c-9fa7-1e814b98d850'
  and project_name = 'Massachusetts Street bus stop improvements';
