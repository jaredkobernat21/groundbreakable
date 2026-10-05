-- Bonner Springs Industrial Park -- refinement pass (Jared's 2026-10-04 "Bonner Springs
-- refinement pass" brief). Explicitly NOT a rebuild: every verified/strong existing field (265
-- acres, Light Industrial zoning, outside the 100-year floodplain, Evergy, Whippoorwill
-- Substation, the 2 identified parcel owners, Zayo regional fiber, City of Bonner Springs water/
-- wastewater, favorable entitlement, existing sources) is preserved untouched below -- this
-- migration only ADDS the new power-as-a-gate/Development Gates/Location+Access fields and fixes
-- one real contradiction the brief caught: the prior developer_takeaway claimed "water and
-- wastewater capacity are confirmed with available headroom," which overstates what the
-- underlying facts actually support (city-wide MGD/utilization figures, never a load-specific
-- allocation study) -- water_capacity_status is now the honest single source of truth
-- ('capacity_indicated', not 'capacity_verified'), and developer_takeaway is rewritten to never
-- claim more than that status supports.
--
-- POWER, run deeper per the brief's §2-4: Whippoorwill re-confirmed as DISTRIBUTION-only
-- (independently corroborating Ordinance 2605/SUP-03-25, not just repeating it); no
-- transmission-class substation or line found specifically near this park despite checking
-- Evergy's own named transmission projects (De Soto, Riverside, McNew-Reno, Buffalo Flats -- none
-- in this corridor) and SPP's open studies (which turned out to be BPU/Quindaro, a different
-- utility's territory, a market signal only). Evergy's Path to Power queue is real and
-- system-wide (~15GW total interest) but nothing capacity-specific is confirmed for this park --
-- power_qualification lands on 'utility_path_indicated', not higher. This is a GATE, not a score
-- input to inflate -- development_gates.power = yellow, and developer_assessment moves from
-- 'pursue' to 'screen': strong non-power fundamentals justify a utility/site-control screen, but
-- the site is not yet power-qualified for a 50-100+ MW target.
--
-- BTM gas upgraded with a real primary source (Southern Star Central Gas Pipeline's own Master
-- Point List, document CSI062, confirms an actual delivery point IN Bonner Springs -- VERIFIED,
-- stronger than the prior "supported via city-wide gas utility" framing) -- gas_transmission_operator
-- is now tracked separately from gas_pipeline_operator (Atmos Energy remains the correct LOCAL
-- distribution utility; Southern Star is the separate upstream transmission company).
--
-- Land/site-control: attempted a corrected GIS query against the park's actual boundary: a
-- geocode of "Bonner Industrial Dr & 43rd St" came back in Shawnee, KS (wrong city/zip) --
-- recognized as a bad match and NOT used to query Wyandotte County's GIS against wrong
-- coordinates. Genuinely Cannot Be Resolved This Pass, not skipped -- no new owners found beyond
-- the existing 2. Two nearby industrial properties (VanTrust''s 720 N 118th St site, Compass 70
-- Logistics Park) were checked and confirmed to be separate, distinct properties, not part of
-- this park.
--
-- potential_score moves 71 -> 72 (small, deliberately not large): power_grid +1 for the Southern
-- Star delivery-point verification (real new evidence); land/water/fiber/transportation unchanged
-- -- their underlying facts didn't change this pass, only their labeling got more precise, which
-- the new power_qualification/development_gates/water_capacity_status fields now carry instead
-- of inflating the weighted sum.

update catalysts set
  why_this_site = 'Established, favorably zoned industrial park with confirmed utility and gas infrastructure. Large-load power qualification is the principal item separating this site from an active pursuit.',
  potential_score = 72,
  potential_score_components = '[
    {"key":"power_grid","points":23,"evidence":["Evergy''s KCC-approved Large Load Power Service (LLPS) tariff and \"Path to Power\" active-queue process (Docket 25-EKME-315-TAR) -- re-confirmed with real detail this pass: 25MW+ loads evaluated, up to 4 active queue slots, ~15GW of total system interest (roughly half potentially Kansas) -- a real, named, system-wide mechanism -- VERIFIED","Whippoorwill Substation re-confirmed as a DISTRIBUTION facility via independent search, corroborating Ordinance 2605/SUP-03-25 -- VERIFIED","Southern Star Central Gas Pipeline''s own Master Point List (document CSI062) confirms an actual delivery point IN Bonner Springs -- VERIFIED, upgraded from the prior pass''s city-wide-only framing"],"unknowns":["No transmission-class substation or line found specifically near this park -- checked Evergy''s own named transmission projects (De Soto, Riverside, McNew-Reno, Buffalo Flats) and SPP''s open studies (which turned out to be BPU/Quindaro, a different utility''s territory -- a market signal only, not site infrastructure)","No MW figure, voltage, or Bonner-Springs-specific interconnection request confirmed","power_qualification: utility_path_indicated -- a real tariff/queue mechanism and nearby infrastructure exist, but nothing capacity-specific to this park is confirmed. This is a GATE, not fully cleared."],"status":"supported"},
    {"key":"land_expansion","points":12,"evidence":["~265-acre established industrial park, flat topography, entirely above the 100-year floodplain (unchanged, VERIFIED)","2 parcel owners identified via county records and a city planning filing (unchanged)"],"unknowns":["Full parcel-by-parcel ownership roster beyond the 2 owners remains incomplete -- a corrected GIS query attempt this pass geocoded to the wrong city (Shawnee, KS) and was correctly discarded rather than queried against bad coordinates; Cannot Be Resolved This Pass, not skipped","Two nearby industrial properties (VanTrust''s 720 N 118th St site, Compass 70 Logistics Park) confirmed this pass to be separate, distinct properties, not part of this park"]},
    {"key":"fiber_connectivity","points":6,"evidence":["Zayo operates real long-haul fiber routes near this region (KC-Omaha, KC-Tulsa-Dallas) -- SUPPORTED at a regional level (unchanged)"],"unknowns":["No Lumen or AT&T presence found specific to this corridor despite a dedicated search this pass -- fiber_carriers stays Zayo-only"],"status":"supported"},
    {"key":"government_incentives","points":6,"evidence":["Actively marketed by the city for industrial use (unchanged)"],"unknowns":["No data-center-specific incentive program identified"]},
    {"key":"development_entitlement","points":7,"evidence":["Established light-industrial zoning with 20+ operating businesses -- re-confirmed this pass (one stale/mismatched search snippet claiming \"70 acres/14 businesses\" was checked and discarded, not used)"],"unknowns":["I-1 designation SUPPORTED via search synthesis, not independently re-verified against the primary city zoning code page"]},
    {"key":"physical_environmental_risk","points":10,"evidence":["FEMA Zone X (Area of Minimal Flood Hazard) VERIFIED via live NFHL query (unchanged)"],"unknowns":[]},
    {"key":"water_cooling","points":4,"evidence":["City-operated 2 MGD water plant and 1.4 MGD wastewater plant at 55% utilization (unchanged facts)","City''s own water-plant materials frame the new plant as industrial-growth-oriented (\"secured two growing industrial projects that need a good water supply\")"],"unknowns":["These are city-wide capacity/utilization figures, never a load-specific allocation study -- water_capacity_status: capacity_indicated, not capacity_verified. Narrative must never claim more than this."],"status":"supported"},
    {"key":"transportation_workforce","points":4,"evidence":["Direct K-7 Highway frontage; 32 mi / 33 min to Kansas City International Airport (unchanged/re-confirmed)"],"unknowns":[]}
  ]'::jsonb,
  power_qualification = 'utility_path_indicated',
  nearest_substation_type = 'distribution',
  utility_expansion_signals = 'Evergy Path to Power queue active system-wide (~15GW interest); none confirmed tied to this park specifically',
  expansion_requirement = 'unknown',
  gas_transmission_operator = 'Southern Star Central Gas Pipeline',
  fiber_carriers = array['Zayo'],
  water_capacity_status = 'capacity_indicated',
  location_access = '{
    "kc_metro_position": "Western KC metro (Wyandotte/Johnson County line)",
    "interstate_name": "I-70",
    "k7_distance_miles": 0,
    "airport_distance_miles": 32,
    "airport_drive_minutes": 33,
    "rail": "Union Pacific line through Bonner Springs; Kansas City Inland Port intermodal hub (BNSF/UP/CPKC/NS) ~20 mi east -- no freight rail confirmed serving this park directly",
    "industrial_context": "Established industrial corridor adjacent to Compass 70 Logistics Park"
  }'::jsonb,
  development_gates = '{
    "power": "yellow",
    "land": "yellow",
    "site_control": "yellow",
    "entitlement": "green",
    "btm_gas": "yellow",
    "fiber": "yellow",
    "water": "yellow",
    "environmental": "green"
  }'::jsonb,
  primary_advantage = 'Light Industrial zoning, a confirmed natural-gas delivery point, and two identified parcel owners support a real, if still partial, site-control and infrastructure picture.',
  primary_risk = 'Large-load power is not yet qualified — the nearby substation is distribution-only, and no transmission-class capacity has been confirmed for this specific park.',
  developer_assessment = 'screen',
  developer_takeaway = 'Bonner Springs Industrial Park offers established Light Industrial zoning, confirmed Evergy electric service, and a verified natural-gas delivery point (Southern Star Central Gas Pipeline). Water and wastewater infrastructure exist with city-indicated headroom, but no load-specific capacity study confirms availability for a large continuous draw. The critical gating item is large-load power: Whippoorwill Substation is distribution-only, and no transmission-class infrastructure or utility capacity has been confirmed. Strong non-power fundamentals justify a utility and site-control screen — not yet an active pursuit.',
  next_steps = array[
    'Request a large-load capacity assessment from Evergy via its Path to Power process, including confirmation of nearby transmission-class infrastructure.',
    'Confirm gas delivery capacity with Southern Star Central Gas Pipeline and Atmos Energy.',
    'Contact identified landowners (4101 Powell Ave., LLC and J. Coleman Enterprises, L.P.) regarding site control.',
    'Confirm fiber last-mile availability with Zayo or an alternate carrier.'
  ],
  unknowns_to_verify = array[
    'Transmission-class infrastructure and voltage near the park',
    'Available MW / large-load capacity',
    'Firm energization timeline',
    'Full parcel ownership',
    'Industrial-load-specific water/wastewater allocation',
    'Fiber last-mile availability'
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
    (select id from sources where url ilike '%bonnersprings.org%1192/12404%'),
    (select id from sources where url ilike '%wikipedia.org%Southern_Star_Central_Gas_Pipeline%')
  ],
  last_verified_at = now()
where title = 'Bonner Springs Industrial Park';
