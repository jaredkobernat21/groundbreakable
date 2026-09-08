-- Corrects an error from the prior migration (Jared, 2026-09-08: "That
-- property says sold on Zillow listing"). 15020 Parallel Road was
-- sourced from LandWatch/Land and Farm aggregator listings, which can
-- lag actual MLS status -- Zillow shows it sold. Presenting a sold
-- property as a directly-buyable opportunity on Dan Lynch's dashboard
-- would be actively misleading, so it's removed outright rather than
-- left in any form. The underlying finding it was based on (this stretch
-- of Parallel Rd, ~0.25 mi from the live PRZ-005-26 / PPDP-03-26
-- rezoning case, is Basehor's active growth edge) still stands and
-- remains supported by the rezoning case itself, already on file
-- separately as a shift -- only this specific since-sold listing is
-- being retracted.

delete from development_opportunities
where address = '15020 Parallel Road, Basehor, KS 66007';

delete from sources
where id = 'a1000000-0000-4000-8000-000000000014';
