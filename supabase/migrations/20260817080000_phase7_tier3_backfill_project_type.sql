-- Phase 7, Tier 3 (part 2a): backfills projects.project_type for every
-- existing Topeka row (Phase 1 deliberately left it null -- no reliable
-- controlled-vocabulary signal to map from category/subcategory alone
-- without guessing). Each value below was read directly off that
-- project's own description/subcategory text, reviewed row by row
-- against the source text before writing this migration -- nothing
-- inferred beyond what the description states. 5 of 47 rows stay null
-- because the source genuinely doesn't describe a physical use (e.g.
-- "no construction described in the source", "no specific development
-- plan for the area yet").
--
-- Also corrects plan_category on 2 rows from 'infrastructure' to
-- 'public_investment' -- a value the Phase 1 backfill never produced
-- (its CASE mapping had no path to it) even though the column allows it.
-- Both are funding programs/packages (a citywide capital program, a
-- proposed county capital/debt package), not physical construction, so
-- 'public_investment' fits the schema's intent better than
-- 'infrastructure'.
--
-- This is data curation, not schema change -- purely additive/corrective
-- updates to existing nullable columns.

update projects set project_type = 'residential' where id = 'edc3c870-511b-4c1a-b02b-020a6d74e744'; -- Z26/08 SENT Holdings LLC Rezoning (duplex potential)
update projects set project_type = 'residential' where id = 'abdbf95e-f9a5-4c8d-89ee-cb1a12d02e37'; -- Z26/09 Watson Real Estate Development Rezoning (single-family home)
update projects set project_type = 'mixed_use' where id = '4f7aec79-8352-448b-9a08-23099bad0d73'; -- A26/02 Annexation, SW Gage & 37th (church + commercial + multifamily)
update projects set project_type = 'infrastructure' where id = '39b4a9fd-96d5-4962-b825-6091a1d769d9'; -- Z26/04 Kanza OZ LLC Rezoning, SE Madison Street (stormwater retention)
update projects set project_type = 'commercial' where id = '18fa9ce1-9d45-47e3-8a0d-d3ef82e827ed'; -- Z26/05 Azura Credit Union Rezoning, SW Polk Street (corporate parking lot)
update projects set project_type = 'multifamily' where id = '816d87bc-e5d0-4ab8-93ab-399d281bf944'; -- CU26/03 Kanza OZ LLC Enclosed Garage Conditional Use (250-unit apartment accessory)
update projects set project_type = 'multifamily' where id = '09c87906-4eea-413c-85f3-81d1eb5110aa'; -- Z26/02 Calupi Investments Townhome Rezoning, SE 25th Street (24 townhomes)
update projects set project_type = 'commercial' where id = '8f34ff6d-19a5-42e1-a22e-5a55fbe95137'; -- PUD26-01 Noller-Topeka Properties PUD Amendment (C-4 automotive uses)
update projects set project_type = 'residential' where id = 'a22fc453-bc0b-439f-8e72-fde36176ab79'; -- P26-02 Shorey Estates Subdivision No. 2 Replat (21 single-family lots)
update projects set project_type = 'residential' where id = '88418503-18ae-489d-af75-80d0124818da'; -- CU26/02 Short-Term Rental Conditional Use, SW Medford Avenue
update projects set project_type = 'other' where id = 'e4ad091c-f0ce-4402-8054-922e17261191'; -- CU26/01 Archdiocese of Kansas City Parking Expansion (institutional, not commercial/public)
update projects set project_type = 'other' where id = '42f26f1d-f9b2-41fe-860a-efd3e1a40d5e'; -- CPA26/01 Historic Old Town Neighborhood Plan Update (a plan, not a physical development)
update projects set project_type = 'multifamily' where id = '56a2b36d-3f7d-49c8-a37c-b8c7e4ac7704'; -- Urish Road Rezoning (18 duplex units)
update projects set project_type = 'retail' where id = '05ae73cc-337c-440f-bcb4-38e8fb889128'; -- Raising Cane's West Topeka
update projects set project_type = 'industrial' where id = 'c0c18b47-18a5-4d4b-918a-52c25888c0ae'; -- Burlingame Road Rezoning (Valley Self Storage) -- rezoned to I-1 Light Industrial
update projects set project_type = 'mixed_use' where id = '868f75e9-6ee7-483c-98ee-fbb8a771d26b'; -- The Hutch (Project View District Apartments) -- 192 apartments + ground-floor retail
update projects set project_type = 'commercial' where id = 'c50b1bfb-d703-4240-82cb-ff5c7d6c2397'; -- Topeka Subaru Dealership Expansion
update projects set project_type = 'multifamily' where id = 'f816892c-a702-475d-a4f1-7a499e32e519'; -- SW Villa Drive Duplexes (10 duplexes, 20 units)
update projects set project_type = 'multifamily' where id = 'ebd7ac90-e71a-45dd-b5de-b87dcdedd968'; -- Resource Housing Group Affordable Housing (42 units)
update projects set project_type = 'multifamily' where id = 'a8cf5ee8-4cdd-4ee5-812d-d11c47a36cfe'; -- Johnson-Betts Meadows (176 units, six buildings)
update projects set project_type = 'multifamily' where id = '9a940899-d31c-4f34-83b3-9b1eef22959b'; -- Union at Tower District (250 units)
update projects set project_type = 'infrastructure' where id = 'afa631f2-a3f7-405a-a118-d523c14795d9'; -- I-70 Polk-Quincy Viaduct Reconstruction
update projects set project_type = 'infrastructure', plan_category = 'public_investment' where id = '5568ec89-e105-4191-b722-bf2576d5203d'; -- City of Topeka 2026 Public Works Program -- a citywide capital program, not a single physical asset
update projects set project_type = 'commercial' where id = 'dc58a9bb-11d1-4158-aaae-fa67ffe1a8f8'; -- Link Innovation Labs Opening
update projects set project_type = 'infrastructure' where id = '6d1975b5-abac-4bf4-a93b-d800dd72e01c'; -- SW Huntoon St Reconstruction
update projects set project_type = 'infrastructure' where id = 'c0e20e9e-ec93-4d39-80f0-3c710ea24db8'; -- SW 45th St Shared-Use Path
update projects set project_type = 'infrastructure' where id = '7e5a6556-230e-4220-b321-dbcf4bb0a2af'; -- SW 57th St Pavement Rehabilitation
update projects set project_type = 'public', plan_category = 'public_investment' where id = 'c376512d-3662-4988-a18e-4ca6d5ed2a0c'; -- Shawnee County 2026 Proposed Parks Capital Package -- proposed capital/debt package, not yet adopted
update projects set project_type = 'residential' where id = '007312df-ce35-407b-98b3-f4245cff3a09'; -- Cedarhurst of Topeka Cottage Expansion (34 independent-living cottages)
update projects set project_type = 'commercial' where id = 'fde5c538-5af2-41b1-b900-6abe17454da6'; -- Evergy Topeka Office Building Exterior Renovation
update projects set project_type = 'industrial' where id = '999813fa-01dd-4f74-b6f6-2ba6e08d0577'; -- Reser's Fine Foods Topeka Expansion
-- ae834a15 Security Benefit Kansas Workforce Expansion: left null -- "no construction described in the source"
-- ad79991a Magellan Financial Expansion (Project Omega): left null -- no construction or facility described
update projects set project_type = 'industrial' where id = '0c541f5b-17d6-4062-962a-050a6e359421'; -- HF Rubber Manufacturing Expansion
update projects set project_type = 'industrial' where id = 'f11eb3fd-cf7c-45d6-9532-e96c1fd3cda0'; -- J.M. Smucker / Big Heart Pet Brands Topeka Plant Expansion
update projects set project_type = 'commercial' where id = '4c6046ee-c4bb-4df9-ba8f-b015f8248097'; -- Spore.Bio U.S. Operations at Link Innovation Labs (lab tenant lease)
update projects set project_type = 'multifamily' where id = 'bafd3928-3381-49db-bac2-8b96685031d5'; -- NW Lyman Road / NW Vail Avenue Duplex Rezoning (up to 80 units)
update projects set project_type = 'infrastructure' where id = '99a57fe3-0e1c-491b-998b-b51ce6736df4'; -- U.S. 24 Reconstruction, Kansas Avenue to Muddy Creek
-- adcd7220 Klaton LLC Land Assembly near SW 6th and Wanamaker: left null -- "no specific development plan for the area yet" per Klausman
-- ebee8cb2 Menninger Clock Tower Acquisition: left null -- "no development timeline announced"
update projects set project_type = 'infrastructure' where id = 'c3a135da-d6cb-41ea-aaf5-7880c7862075'; -- SW Topeka Blvd Reconstruction (SW 15th to SW 21st)
update projects set project_type = 'infrastructure' where id = 'ef429566-27fd-4020-8f2a-6861d2bc187c'; -- SE 6th Ave Mill/Overlay & Bridge Repair
update projects set project_type = 'infrastructure' where id = '122852f6-ca46-4a43-b362-a1baadc9d8f5'; -- SW Fairlawn Rd Reconstruction & Shunga Bridge Repair
update projects set project_type = 'infrastructure' where id = 'd7dbc2a8-cb36-44f8-a00b-043d5934c55a'; -- SW Topeka Blvd Rehabilitation (SW 29th to SW 37th)
update projects set project_type = 'infrastructure' where id = 'f14ad78c-aaf5-4e30-bbfa-2b80fedc4c83'; -- Central Highland Park Phase 2 Pavement Reconstruction
update projects set project_type = 'retail' where id = 'df8a1de8-ae1e-4922-86c0-3afef280abc1'; -- QuikTrip Commercial/Retail Development
-- d2154e7f A26/01 Oldcastle Annexation, NW 17th Street: left null -- no development use described
