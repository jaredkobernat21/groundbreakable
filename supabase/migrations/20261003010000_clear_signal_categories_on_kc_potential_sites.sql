-- Data-hygiene fix: the 3 Kansas City rows converted to
-- `prospective_data_center_site` in 20261002090000 kept their pre-
-- conversion `signal_categories` tags (power/land_assembly/etc.) from when
-- they were plain `infrastructure_project`/`rumored` rows. That field is
-- only meaningful for `potential_data_center` per this schema's own
-- established convention (see types.ts/dcStage.ts comments) -- harmless
-- today (computeDcStage checks catalyst_type before ever looking at
-- signal_categories, so these 3 still correctly render as "Potential," not
-- "Possible"), but still wrong data that could confuse a future signal-
-- category-based query or admin view. The Nashville pass
-- (20261002100000) got this right at conversion time; this just brings
-- KC's 3 rows in line with the same convention.

update catalysts
set signal_categories = '{}'
where catalyst_type = 'prospective_data_center_site' and signal_categories <> '{}';
