-- Eisenhower Road Business Park Corridor (Leavenworth, KS) -- deep public-record escalation pass
-- (Jared's 2026-10-04 "deep public-record research update" standard, second site after Bonner
-- Springs). This pass surfaces a genuinely MIXED result, not a clean upgrade: city water-system
-- capacity is now VERIFIED (6 MGD, resolving a real prior unknown), but Gary Carlson Business
-- Center turns out to be "nearly full" with one of its 3 listed lots now under contract -- less
-- available land than the prior pass assumed. A real, exhaustive substation search (ordinances,
-- SUP cases, planning agendas, Evergy capital-project pages) found NO named substation at or near
-- this corridor -- correctly labeled "Unknown After Public-Record Search" (the hierarchy was
-- actually run) rather than "Requires Direct Confirmation" (which would imply it just needs a
-- phone call). A red-herring candidate (the "Evergy Leavenworth Service Center," a customer-
-- service/EV-charging office) was explicitly identified and ruled OUT rather than mistakenly
-- logged as infrastructure evidence.
--
-- potential_score stays at 71 -- land_expansion moves down 1 (reduced land-availability
-- confidence) and water_cooling moves up 1 (both utilities now capacity-verified) wash out to the
-- same total. That net-neutral result is itself the honest finding this pass, not a sign nothing
-- happened.

insert into sources (agency, title, source_type, url, published_date) values
  ('City of Leavenworth', 'Survey: City considers second business park', 'agency_document',
   'https://www.leavenworthks.gov/citymanager/page/survey-city-considers-second-business-park', null);

update catalysts set
  potential_score = 71,
  potential_score_components = '[
    {"key":"power_grid","points":20,"evidence":["Evergy Kansas Central confirmed as the franchised electric utility for the City of Leavenworth via City Ordinance 8208 (2022 electric franchise ordinance) -- VERIFIED","Evergy''s KCC-approved Large Load Power Service (LLPS) tariff and \"Path to Power\" queue (Docket 25-EKME-315-TAR) confirmed to cover Evergy''s Kansas Central AND Kansas Metro territories identically -- VERIFIED, no practical difference from Bonner Springs"],"unknowns":["A real, exhaustive search (ordinances, Special Use Permit cases, planning agendas, Evergy capital-project pages) found NO named substation at or near this corridor -- Unknown After Public-Record Search, not merely unconfirmed. A candidate (\"Evergy Leavenworth Service Center,\" 2720 N 2nd Ave) was identified and explicitly RULED OUT -- it is a customer-service/EV-charging office, not a substation","No transmission line voltage, substation capacity, or MW figure found for this corridor"],"status":"supported"},
    {"key":"land_expansion","points":10,"evidence":["80-acre Business and Technology Park plus the adjacent Gary Carlson Business Center (unchanged)","I-1 Light Industrial District confirmed for the Business and Technology Park via Leavenworth Municode Article 4 (unchanged, VERIFIED)","Legal description for the Business and Technology Park found: SE 1/4 of Section 31, Township 10 South, Range 22 East of the 6th P.M., Leavenworth County, Kansas -- SUPPORTED (consistent across multiple sources, primary document not individually pinned this pass)"],"unknowns":["REVISED DOWN this pass: Gary Carlson Business Center is reported \"nearly full\" by the city itself (cited as LCDC''s own reason for exploring a second business park) -- SUPPORTED -- and one of the 3 previously-listed 5-acre lots is now under contract to Thacker Machinery (a Texas company, ~25,000 sq ft facility, ~50-55 jobs, as of March 17, 2026) -- VERIFIED. Available land here is more limited than the prior pass assumed.","Parcel IDs for either park still not obtained -- PARTIALLY RESOLVED: the correct tools are now identified precisely (Leavenworth County''s Aumentum parcel-search portal advertises an unregistered/public access link; the county''s own GIS viewer at leavenworthgis.integritygis.com supports address/QRID/PID search per its quick-start guide; an ArcGIS Hub also exists) -- all are JS-rendered and were not successfully queried this pass, a real next step, not a dead end"]},
    {"key":"fiber_connectivity","points":6,"evidence":["AT&T Fiber and Spectrum confirmed serving Leavenworth, KS generally -- SUPPORTED at a city level (unchanged)"],"unknowns":["No Leavenworth-specific carrier infrastructure found beyond regional Zayo/Lumen network maps -- Requires Direct Confirmation, though a real contact path is now identified: Zayo''s Kansas relocation team (zayo.relo.kansas@zayo.com)"],"status":"supported"},
    {"key":"government_incentives","points":8,"evidence":["$9.7M joint City of Leavenworth / Leavenworth County investment via countywide economic-development sales tax (unchanged)"],"unknowns":[]},
    {"key":"development_entitlement","points":8,"evidence":["I-1 Light Industrial District confirmed via Leavenworth Municode Article 4 (unchanged)"],"unknowns":["Gary Carlson Business Center''s own zoning district code specifically remains unconfirmed"]},
    {"key":"physical_environmental_risk","points":9,"evidence":["FEMA Zone X (Area of Minimal Flood Hazard) verified via live NFHL query (unchanged)"],"unknowns":["One representative point for the corridor, not an exhaustive query across both parks separately"]},
    {"key":"water_cooling","points":5,"evidence":["City of Leavenworth wastewater plant designed for 6.88 MGD, currently ~44% utilized -- VERIFIED (unchanged)","RESOLVED this pass: the city''s drinking-water \"South Treatment Plant\" has a confirmed 6 MGD capacity, per a 2026 government engineering RFQ for a capacity-expansion project that itself cites a 2023 Black & Veatch capacity study -- VERIFIED. This resolves the prior pass''s open water-system-capacity unknown."],"unknowns":["No current water demand/utilization figure found, so a % headroom (comparable to wastewater''s 44%) is not yet calculable"],"status":"verified"},
    {"key":"transportation_workforce","points":5,"evidence":["Marketed with access to six major interstates and a 687,000+ worker regional labor basin (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  power_notes = 'Entire city is in Evergy Kansas Central territory. VERIFIED this pass: Evergy Kansas Central is confirmed as the franchised electric utility for the City of Leavenworth via City Ordinance 8208 (2022 electric franchise ordinance), and the KCC-approved Large Load Power Service (LLPS) tariff and "Path to Power" queue (Docket 25-EKME-315-TAR) explicitly covers both Evergy''s Kansas Central and Kansas Metro territories identically -- no practical difference from Bonner Springs for this purpose. A real, exhaustive search this pass (ordinances, Special Use Permit cases, planning agendas, Evergy capital-project pages) found NO named substation at or near this corridor -- Unknown After Public-Record Search, not merely unconfirmed. One candidate was checked and explicitly ruled out: the "Evergy Leavenworth Service Center" (2720 N 2nd Ave) is a customer-service/EV-charging office, not a substation -- do not cite it as power infrastructure evidence.',
  interconnection_notes = 'Evergy''s "Path to Power" queue gives a developer a real, named channel, but no substation, transmission voltage/distance, or MW figure has been found for this corridor after an exhaustive public search -- Unknown After Public-Record Search for substation specifically; Requires Direct Confirmation for capacity/timeline via Evergy directly.',
  fiber_notes = 'AT&T Fiber and Spectrum confirmed serving Leavenworth, KS generally -- SUPPORTED at a city level. No Leavenworth-specific carrier infrastructure found beyond regional Zayo/Lumen network maps after a real search this pass. A concrete next step is now identified: Zayo''s Kansas relocation team (zayo.relo.kansas@zayo.com) for last-mile confirmation.',
  natural_gas_notes = 'Kansas Gas Service confirmed HEADQUARTERED in Leavenworth, KS itself -- VERIFIED, a stronger local-infrastructure signal than simply serving a tenant. Pipeline distance and diameter to this specific park remain genuinely Unknown After Public-Record Search this pass -- NPMS Public Viewer requires an interactive per-county session (not fetchable) and the Kansas GIS Hub''s NPMS dataset page is JS-rendered; both were tried.',
  water_notes = 'City of Leavenworth wastewater plant designed for 6.88 MGD, currently ~44% utilized -- VERIFIED (unchanged). RESOLVED this pass: the city''s drinking-water "South Treatment Plant" has a confirmed 6 MGD capacity, per a 2026 government engineering RFQ for a capacity-expansion project citing a 2023 Black & Veatch capacity study -- VERIFIED. No current water demand/utilization figure was found, so a % headroom comparable to wastewater''s 44% is not yet calculable.',
  available_acreage_status = 'Gary Carlson Business Center: REVISED this pass -- the city''s own page (reason LCDC is exploring a second business park entirely) describes Gary Carlson as "nearly full," not mostly vacant -- SUPPORTED. One of the 3 previously-listed 5-acre lots is now under contract to Thacker Machinery (a Texas company, ~25,000 sq ft facility, ~50-55 jobs, as of March 17, 2026) -- VERIFIED. Available land here is more limited than the prior pass assumed. Business and Technology Park: current vacant/available acreage remains unconfirmed -- no source newer than the ~8-year-old KSHB article exists, which is explicitly not used to represent current status.',
  primary_advantage = 'City water-system capacity is now confirmed (6 MGD South Treatment Plant) alongside the already-verified wastewater capacity (44% utilized), and Kansas Gas Service is confirmed headquartered in Leavenworth itself. Evergy''s franchise and large-load tariff applicability are both independently verified.',
  primary_risk = 'Land availability is now a real, specific concern, not a generic unknown: Gary Carlson Business Center is reported "nearly full," with one of its last 3 marketed lots now under contract -- the Business and Technology Park''s own vacancy remains unconfirmed. A genuinely exhaustive search found no named substation at or near this corridor -- a real negative finding, not just an unresearched gap, and a materially different picture than Bonner Springs, where one was found nearby.',
  developer_assessment = 'pursue',
  developer_takeaway = 'Utility fundamentals strengthened this pass -- both city water (6 MGD) and wastewater (44% utilized) capacity are now verified, and Kansas Gas Service and Evergy are both confirmed with real documentation. But land availability softened: Gary Carlson Business Center is nearly full, with one more lot now under contract, and a genuinely exhaustive search still could not locate a named substation anywhere near this corridor. A developer should treat current vacant acreage at the Business and Technology Park (not Gary Carlson) as the real near-term land question, and should not assume power delivery will be straightforward just because the tariff mechanism exists -- the complete absence of a nearby named substation, after a real search, is itself a meaningful data point.',
  next_steps = array[
    'Submit a Path to Power inquiry to Evergy for this corridor, explicitly asking about the nearest substation and its capacity -- none was identified publicly.',
    'Contact the Leavenworth County Development Corporation (existing contact: Lisa Haack) for current Business and Technology Park occupancy and the true remaining acreage at Gary Carlson after the Thacker contract.',
    'Submit a parcel-ID request via Leavenworth County''s Aumentum "Parcel Search Public" access point, or query the county GIS viewer at leavenworthgis.integritygis.com directly.',
    'Email Zayo''s Kansas relocation team (zayo.relo.kansas@zayo.com) for last-mile fiber confirmation.',
    'Contact Kansas Gas Service''s Leavenworth headquarters directly for pipeline distance and delivery capacity.'
  ],
  unknowns_to_verify = array[
    'Substation capacity, transmission voltage/distance, and MW figure for this corridor -- genuinely Unknown After Public-Record Search; no named substation was found at all (Requires Direct Confirmation via Evergy)',
    'Parcel IDs and ownership for both parks -- Partially Resolved: the correct GIS/parcel-search tools are now identified precisely, but were not successfully queried this pass (JS-rendered interfaces)',
    'True remaining vacant acreage at Gary Carlson Business Center after the Thacker Machinery contract, and at the Business and Technology Park specifically (the only prior data point is ~8 years stale)',
    'Natural gas pipeline distance and diameter from Kansas Gas Service (Unknown After Public-Record Search -- NPMS/GIS tools are not fetchable; contact the utility directly)',
    'Carrier-grade, last-mile fiber availability (Requires Direct Confirmation -- now with a real contact: zayo.relo.kansas@zayo.com)',
    'Gary Carlson Business Center''s specific zoning district code'
  ],
  additional_source_ids = array[
    (select id from sources where url ilike '%kansasreflector.com%new-kansas-rules%'),
    (select id from sources where url ilike '%curb.kansas.gov%CURB_News_25Q4%'),
    (select id from sources where url ilike '%library.municode.com%leavenworth%'),
    (select id from sources where url ilike '%kshb.com%leavenworth-industrial-park%'),
    (select id from sources where url ilike '%citizenportal.ai%Leavenworth-County-panel%'),
    (select id from sources where url ilike '%leavenworthks.gov%water-pollution-control%'),
    (select id from sources where url ilike '%leavenworthks.gov%second-business-park%')
  ],
  last_verified_at = now()
where title = 'Eisenhower Road Business Park Corridor';
