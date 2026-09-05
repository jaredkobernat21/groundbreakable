-- Corrective migration: the two preceding "early planning signals"
-- migrations (20260904210000 Topeka, 20260904220000 Lawrence) were
-- written without first checking whether the same real cases had already
-- been seeded earlier in this same session (a large pre-existing
-- `projects`/`shifts` dataset for Topeka/Lawrence turned out to already
-- exist, discovered only after pushing). Two distinct bugs resulted:
--
-- 1. Source-row duplication: `insert into sources (...)` doesn't check
--    for an existing row with the same URL, so re-citing a URL that was
--    already in `sources` (citizenjournal.us Topeka PC summary, the
--    Lawrence Times KU Endowment article, the Vail/Lyman Yahoo article)
--    created a second `sources` row instead of reusing the first.
-- 2. That, in turn, meant a later `select id from sources where url = X`
--    lookup (used for the Vail/Lyman Project insert) matched BOTH the
--    old and new rows, and the `from market, duplex_source` cross join
--    inserted the same project twice.
--
-- This migration: (a) repoints the 2 new Topeka shifts at the
-- pre-existing citizenjournal.us source and drops the duplicate source
-- row; (b) drops both duplicate "Vail/Lyman Duplex Development" project
-- rows -- a better, pre-existing "NW Lyman Road / NW Vail Avenue Duplex
-- Rezoning" project already covers this, already correctly marked
-- 'approved'; (c) drops the duplicate Lawrence "KU Endowment" shift and
-- its duplicate source row -- a pre-existing shift already covered this
-- exact event; (d) corrects the new Lawrence "Beacon Landing" Project
-- row, which was seeded as stage='proposed' without knowing a
-- pre-existing shift already showed the City Commission approved the
-- annexation/rezoning on 2026-08-18 -- updated to stage='approved' with
-- an accurate description instead of leaving stale/wrong status.
--
-- The new July 20, 2026 "Planning Commission recommends" Beacon Landing
-- shift is NOT a duplicate -- it's a distinct, earlier lifecycle event
-- (recommendation) than the pre-existing Aug 18 "City Commission
-- approved" shift, and is kept as-is.

-- (a) Repoint Topeka shifts, drop duplicate source
update shifts set source_id = 'd05164ad-668e-4640-a103-418064e20dd1'
where id in ('afa259b0-1bd7-42c9-8717-7fd10e7111c8', '464af79b-690d-4d50-86fe-f067915321a9');

delete from sources where id = 'd2a69679-b40b-4ccb-b5e9-3d98051548c7';

-- (b) Drop duplicate Vail/Lyman projects and their duplicate/orphaned sources
delete from projects where id in ('caa77e58-a24d-4a7c-8bef-7cf35ba9e439', 'e3016763-8356-4fd6-b862-a5264f9b433a');
delete from sources where id = '7291a139-2fec-4e51-b248-78649744167a';

-- (c) Drop duplicate Lawrence KU Endowment shift and its duplicate source
delete from shifts where id = '1ded3c46-907b-4e69-8b56-e5d2f4cee32e';
delete from sources where id = '04f64d45-b011-4912-9404-bf9a0b3f0f90';

-- (d) Correct the Beacon Landing project's stage now that the real
-- outcome (City Commission approval, 2026-08-18) is known
update projects
set stage = 'approved',
    description = 'City Commission approved annexing and rezoning 288 acres west of K-10, south of 6th St, on 2026-08-18 -- called "probably the largest single annexation request in the last three decades" by the city planner. Final mix: 70.1 acres low-density residential (R-2), 16.9 acres medium-density residential (R-3), 23.5 acres high-density residential (R-4), 126.7 acres commercial center, 51 acres open space. Planning Commission had recommended approval of all seven related agenda items on 2026-07-20.'
where id = '29fb6565-e99f-445e-81e8-fc657cfd58c9';
