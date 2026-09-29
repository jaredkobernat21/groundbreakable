-- Real county GIS parcel data (Douglas County, KS Tax_Parcel layer) carries
-- owner name for free alongside geometry -- adding it now rather than
-- discarding it, since it's the one field that makes Assemblage detection
-- ("adjacent parcels, same/related owner") possible at all. See
-- docs/DATA_INTELLIGENCE_PIPELINE.md section 6.3.
alter table parcels add column owner_name text;
