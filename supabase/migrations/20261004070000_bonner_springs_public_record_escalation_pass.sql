-- Bonner Springs Industrial Park -- deep public-record escalation pass (Jared's 2026-10-04
-- "deep public-record research update," using Bonner Springs as his calibration example). This
-- pass VERIFIED Jared's specific leads by actually fetching them, not copying his text --
-- independently confirmed the Johnson County parcel record and the Whippoorwill Substation
-- ordinance, and resolved the single biggest open question every prior pass left hanging:
-- Evergy vs. BPU territory. Also caught and CORRECTS a real error from the prior deep-research
-- pass (20261004040000): that pass's natural-gas finding (Kansas Gas Service / Southern Star
-- Central Gas Pipeline) does not hold up against the city's own Utilities page, which names
-- Atmos Energy as the gas utility -- retracted below rather than left standing.
--
-- GEOGRAPHY RESOLVED: Bonner Springs genuinely spans Wyandotte (majority), Leavenworth (small
-- western slice), AND Johnson County (small slice south across the Kansas River) -- the city's
-- own Industrial Park page citing "Johnson County" was correct, not an error; the park sits in
-- that cross-river Johnson County portion. Combined with Evergy's own Kansas Metro tariff listing
-- Johnson County communities as served, and the city's Utilities page naming Evergy (not BPU) with
-- no territory-split language for this area: Evergy serves this park. VERIFIED.
--
-- potential_score moves 67 -> 71: power_grid gains real points for the resolved utility-territory
-- question and an independently-verified named substation; land_expansion gains a point for 2
-- real parcel owners identified via the escalation workflow. Everything else is unchanged this
-- pass -- the gas correction is a retraction, not new evidence, and isn't separately points-scored
-- (natural gas is supporting evidence under power_grid's checklist, not its own weighted factor).

insert into sources (agency, title, source_type, url, published_date) values
  ('Johnson County, KS', 'Property Detail -- Quick Ref ID R170052 (4101 Powell Dr)', 'public_record',
   'https://taxbill.jocogov.org/Property-Detail?PropertyQuickRefID=R170052', null),
  ('City of Bonner Springs', 'Site Layout and Notes, Bonner Industrial Drive (Planning Agenda Item 2536)', 'agency_document',
   'https://www.bonnersprings.org/AgendaCenter/ViewFile/Item/2536?fileID=5729', null),
  ('City of Bonner Springs', 'Ordinance No. 2605 -- Special Use Permit SUP-03-25, Whippoorwill Substation', 'public_record',
   'https://kspublicnotices.newzgroup.com/KSLegals/2025/33804-2025-12-18_10019.pdf', '2025-12-18'),
  ('Evergy', 'Kansas Metro Detailed Tariffs', 'agency_document',
   'https://www.evergy.com/-/media/documents/billing/kansas-metro/detailed-tariffs/ks-metro-rates.pdf', null),
  ('City of Bonner Springs', 'Utilities', 'agency_document',
   'https://www.bonnersprings.org/1192/12404/Utilities', null);

update catalysts set
  potential_score = 71,
  potential_score_components = '[
    {"key":"power_grid","points":22,"evidence":["Evergy''s KCC-approved Large Load Power Service (LLPS) tariff and \"Path to Power\" active-queue process (Docket 25-EKME-315-TAR) applies territory-wide across Evergy''s Kansas Central/Kansas Metro service area (unchanged, VERIFIED)","RESOLVED this pass: the Evergy-vs-BPU territory question left open by every prior pass is settled -- the City of Bonner Springs'' own Utilities page lists Evergy (electric) with no mention of BPU for this area; combined with the park''s confirmed Johnson County location and Evergy''s own Kansas Metro tariff explicitly listing Johnson County communities as served, Evergy -- not BPU -- serves this park. VERIFIED.","A named, addressed Evergy substation was independently verified near the city: the Whippoorwill Substation, 120 S. 110th Street, approved under City Ordinance 2605 / Special Use Permit SUP-03-25 (signed Dec 15, 2025), explicitly labeled a DISTRIBUTION substation (not transmission) in the ordinance -- VERIFIED existence/type."],"unknowns":["Distance from the Industrial Park''s actual centroid to the Whippoorwill Substation could not be calculated without precise park boundary coordinates -- Requires Direct Confirmation","No transmission line voltage, substation capacity, or MW figure confirmed specific to this park","CORRECTED this pass: the prior pass''s natural-gas finding (Kansas Gas Service / Southern Star Central Gas Pipeline) is retracted -- the city''s own Utilities page identifies Atmos Energy as the actual gas utility; BTM gas potential is Unknown After Public-Record Search pending a new pipeline-proximity search specific to Atmos Energy"],"status":"supported"},
    {"key":"land_expansion","points":12,"evidence":["~265-acre established industrial park, flat topography, entirely above the 100-year floodplain (unchanged)","Two parcel owners identified this pass via the parcel-research escalation workflow: 4101 Powell Ave., LLC (Johnson County Tax Office parcel R170052, VERIFIED) and J. Coleman Enterprises, L.P. (found via a Bonner Industrial Drive site-plan filing in the city''s planning-agenda archive, SUPPORTED, not yet matched to a specific parcel ID)"],"unknowns":["Full parcel-by-parcel ownership roster for the park''s remaining 20+ businesses has not been completed -- Johnson County''s AIMS GIS viewer (aims.jocogov.org) is confirmed as the right tool but has not yet been directly queried","Vacant/contiguous available acreage still unconfirmed"]},
    {"key":"fiber_connectivity","points":6,"evidence":["Zayo operates real long-haul fiber routes near this region (KC-Omaha, KC-Tulsa-Dallas corridors) -- SUPPORTED at a regional level (unchanged)"],"unknowns":["No named carrier or route confirmed at this specific park -- last-mile availability REQUIRES DIRECT CONFIRMATION from a carrier"],"status":"supported"},
    {"key":"government_incentives","points":6,"evidence":["Actively marketed by the city for industrial use, highlighting K-7 highway access (unchanged)"],"unknowns":["No data-center-specific incentive program identified"]},
    {"key":"development_entitlement","points":7,"evidence":["Established light-industrial zoning already in place; 20+ existing businesses operating there is a real precedent (unchanged)"],"unknowns":["I-1 designation is SUPPORTED via search synthesis, not independently re-verified against the primary city zoning code page this pass"]},
    {"key":"physical_environmental_risk","points":10,"evidence":["FEMA''s own live NFHL ArcGIS REST MapServer identify query at the park''s approximate coordinates returned Zone X (Area of Minimal Flood Hazard) -- VERIFIED (unchanged)"],"unknowns":["One representative point query, not an exhaustive query across the full ~265 acres"]},
    {"key":"water_cooling","points":4,"evidence":["City-operated water treatment plant, 2 MGD capacity, built explicitly to provide capacity for community expansion -- VERIFIED (unchanged)","City-operated wastewater plant, 1.4 MGD capacity, currently at 55% utilization -- VERIFIED (unchanged)"],"unknowns":["Figures are city-wide utility capacity, not a large-industrial-load-specific allocation study"],"status":"verified"},
    {"key":"transportation_workforce","points":4,"evidence":["Marketed with convenient access to K-7 Highway and the interstate system (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  serving_utility = 'Evergy (electric) -- VERIFIED and now RESOLVED: the City of Bonner Springs'' own Utilities page lists Evergy (electric) and Atmos Energy (gas) for this area, with no mention of BPU and no utility-territory-split language. Bonner Springs genuinely spans Wyandotte, Leavenworth, AND Johnson counties -- the Industrial Park specifically sits in the city''s Johnson County portion, and Evergy''s own Kansas Metro tariff explicitly lists Johnson County communities as served. This resolves the Evergy-vs-BPU question every prior pass on this row left open: Evergy, not BPU, serves this park.',
  power_notes = 'Served by Evergy (large-load power-service tariff territory, 75MW+; KCC-approved "Path to Power" queue, Docket 25-EKME-315-TAR). RESOLVED this pass: this park sits in Bonner Springs'' Johnson County portion and is confirmed served by Evergy, not BPU -- see serving_utility. A named, addressed Evergy substation was also independently verified nearby: the Whippoorwill Substation, 120 S. 110th Street, approved under City Ordinance 2605 / Special Use Permit SUP-03-25 (signed Dec 15, 2025), explicitly labeled a DISTRIBUTION substation (not transmission) -- its existence does not imply available capacity or MW headroom at this park, and its distance from the park''s actual centroid could not be calculated without precise boundary coordinates. REQUIRES DIRECT CONFIRMATION for substation capacity, transmission voltage/distance, and MW figure.',
  natural_gas_notes = 'CORRECTED this pass: the prior pass''s claim that Southern Star Central Gas Pipeline / Kansas Gas Service serves this park does not hold up -- the City of Bonner Springs'' own Utilities page identifies Atmos Energy as the actual natural-gas utility serving this area. VERIFIED utility identity; Atmos Energy''s own upstream pipeline supplier and pipeline distance/diameter near this specific park are Unknown After Public-Record Search this pass -- a new pipeline-proximity search specific to Atmos Energy is the right next step, not a repeat of the retracted Southern Star claim.',
  btm_potential_status = null,
  owners = '[
    {"name":"4101 Powell Ave., LLC","mailing_address":"PO Box 12542, Kansas City, KS 66012","last_verified":"2026-10-04","source":"https://taxbill.jocogov.org/Property-Detail?PropertyQuickRefID=R170052","notes":"VERIFIED via Johnson County Tax Office. Parcel Quick Ref ID R170052, property address 4101 Powell Dr, legal description \"Bonner Springs Industrial Park East Lots 1 Thru 4 Lt 2 BSC 14 2\", appraised land value $644,930, approximately 8,693 sq ft of buildings. No acreage field on the county record itself."},
    {"name":"J. Coleman Enterprises, L.P.","mailing_address":"PO Box 456, Bonner Springs, KS 66012","last_verified":"2026-10-04","source":"https://www.bonnersprings.org/AgendaCenter/ViewFile/Item/2536?fileID=5729","notes":"SUPPORTED -- found via a \"Site Layout and Notes, Bonner Industrial Drive\" site-plan filing in the city''s planning-agenda archive, not yet cross-checked against the county assessor for a specific parcel ID or acreage figure."}
  ]'::jsonb,
  primary_advantage = 'The single biggest open question from every prior pass on this site -- whether Evergy or BPU serves this park -- is now RESOLVED: Evergy serves it, confirmed via the city''s own Utilities page and tariff documents. A real, named, addressed Evergy substation (Whippoorwill, 120 S. 110th St) was independently verified nearby, and 2 real parcel owners (4101 Powell Ave., LLC and J. Coleman Enterprises, L.P.) were identified via county records and a city planning filing -- Site Control is no longer a blank slate.',
  primary_risk = 'Substation distance, transmission voltage, and MW figure remain unconfirmed -- the Whippoorwill Substation''s existence does not establish available capacity at this park. Ownership is only partially resolved: 2 of the park''s 20+ businesses have an identified owner; a full parcel-by-parcel roster requires directly querying Johnson County''s AIMS GIS viewer, not just searching. A corrected natural-gas finding (Atmos Energy, not Kansas Gas Service) means BTM gas potential is now an open question again, not a prior "Supported" finding.',
  developer_assessment = 'pursue',
  developer_takeaway = 'The Evergy-vs-BPU uncertainty that clouded every prior pass on this site is resolved: Evergy confirmed serves this park, with a real, named, addressed distribution substation (Whippoorwill) nearby. Two parcel owners are now identified via county records and a city planning filing, moving Site Control from "research pending" to a real, if partial, start. The decisive remaining question is the same one that matters everywhere in this metro -- actual substation capacity, transmission voltage, and MW -- plus completing the parcel roster via Johnson County''s AIMS GIS tool and re-researching gas infrastructure now that Atmos Energy (not Kansas Gas Service) is confirmed as the real utility. A developer should request a Path to Power assessment from Evergy specifically referencing the Whippoorwill service area, and query AIMS GIS directly for the remaining parcels.',
  next_steps = array[
    'Submit a Path to Power inquiry to Evergy, referencing the Whippoorwill Substation service area specifically.',
    'Query Johnson County''s AIMS GIS viewer (aims.jocogov.org) directly for the remaining parcel owners, parcel IDs, and acreage across the park.',
    'Contact Atmos Energy for pipeline distance, diameter, and delivery capacity to this park (corrects the prior pass''s retracted Kansas Gas Service assumption).',
    'Contact Lumen, Zayo, or a carrier-neutral broker for last-mile fiber confirmation.',
    'Contact 4101 Powell Ave., LLC and J. Coleman Enterprises, L.P. directly (via their recorded mailing addresses) regarding sale/option willingness.'
  ],
  unknowns_to_verify = array[
    'Substation capacity, transmission voltage/distance, and MW figure specific to this park (Requires Direct Confirmation -- Evergy)',
    'Full parcel-by-parcel ownership roster beyond the 2 owners identified this pass (Partially Resolved -- query Johnson County AIMS GIS directly)',
    'Atmos Energy pipeline distance, diameter, and delivery capacity -- the prior Kansas Gas Service / Southern Star finding was retracted this pass (Unknown After Public-Record Search -- contact Atmos Energy)',
    'Last-mile fiber carrier availability at the park specifically (Requires Direct Confirmation -- carrier)',
    'Vacant/contiguous available acreage (Requires Direct Confirmation -- park leasing office or AIMS GIS)'
  ],
  additional_source_ids = array[
    (select id from sources where url ilike '%kansasreflector.com%new-kansas-rules%'),
    (select id from sources where url ilike '%fox4kc.com%12-6b-data-center%'),
    (select id from sources where url ilike '%curb.kansas.gov%CURB_News_25Q4%'),
    (select id from sources where url ilike '%utilitydive.com%data-center-large-load%'),
    (select id from sources where url ilike '%bonnersprings.org%Wastewater-Division%'),
    (select id from sources where url ilike '%burnsmcd.com%bonner-springs-water-plant%'),
    (select id from sources where url ilike '%bonnersprings.org%Customer-Service%'),
    (select id from sources where url ilike '%sdxcentral.com%zayo-expands%'),
    (select id from sources where url ilike '%taxbill.jocogov.org%R170052%'),
    (select id from sources where url ilike '%bonnersprings.org%AgendaCenter%Item/2536%'),
    (select id from sources where url ilike '%kspublicnotices.newzgroup.com%33804%'),
    (select id from sources where url ilike '%evergy.com%ks-metro-rates%'),
    (select id from sources where url ilike '%bonnersprings.org%1192/12404%')
  ],
  last_verified_at = now()
where title = 'Bonner Springs Industrial Park';
