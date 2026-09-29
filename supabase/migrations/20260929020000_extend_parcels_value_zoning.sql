-- Nashville/Davidson County's parcel GIS layer carries assessor data
-- (appraised land/improvement/total value, zoning, land use, most recent
-- sale) joined directly to the parcel record -- richer than what Douglas
-- County KS's layer exposed for Lawrence. Adding columns to capture it
-- rather than discarding it: this is exactly the land/improvement value +
-- zoning data docs/DATA_INTELLIGENCE_PIPELINE.md section 6.3 flagged as
-- needed for Underutilized/Distress opportunity scoring, and section 3
-- flagged Assemblage as blocked without real ownership data -- now most of
-- what's needed for both is available for a market that has it, at no
-- cost, via the same free ArcGIS pattern already used for Lawrence.
alter table parcels
  add column land_value numeric,
  add column improvement_value numeric,
  add column total_value numeric,
  add column zoning text,
  add column land_use_code text,
  add column land_use_description text,
  add column last_sale_price numeric,
  add column last_sale_date date;
