-- K-7 / McIntyre Road Industrial Rezoning (Lansing, KS) -- deep public-record escalation pass
-- (Jared's 2026-10-04 "deep public-record research update" standard, third site, following
-- Bonner Springs and Eisenhower Road). This pass RESOLVES the single biggest red flag from the
-- prior deep-research pass (20261004060000): conflicting FEMA floodplain data. That pass queried
-- two different "nearby points," neither actually the site's real address. This pass geocoded the
-- ACTUAL site address (13788 McIntyre Road, Lansing/Leavenworth, KS 66048 -- confirmed via the
-- city's own Planning Commission staff report) through the U.S. Census Bureau's public geocoder,
-- then queried FEMA's live NFHL ArcGIS REST MapServer at that authoritative point plus 4
-- additional sample points spread across the ~85-acre parcel (north/south/east/west). 4 of 5
-- returned Zone X (Area of Minimal Flood Hazard, SFHA_TF=False); the 5th (900 ft north) returned
-- no digitized zone at all (unmapped -- not evidence of risk, just outside the digitized hazard
-- layer). This is a real resolution in favor of "predominantly clear," not a coin flip pick.
--
-- Ownership (Jay Healy / Epic Estates 3 LLC) is now corroborated across multiple independent
-- sources (the original rezoning-approval article, the planning-commission-recommendation
-- article, and the staff report''s own case number 2025-DEV-002) -- upgraded from "reported via
-- one article" to SUPPORTED. Still not formally verified against KS Secretary of State or county
-- deed records -- both channels remain genuinely dead-ended (KS SOS requires an interactive form;
-- county parcel data is still static downloads only).
--
-- Exact acreage is now confirmed: Tract 1 (R-4 Multi-Family) 38.477 ac, Parcel 2 (I-1 Light
-- Industrial, this site) 85.484 ac, Parcel 3 (B-3 Regional Business) 21.581 ac -- total 145.542
-- acres, refining the prior "~145 acres" estimate.
--
-- Substation, transmission voltage/distance, gas pipeline distance to this parcel, and the
-- wastewater plant''s design/rated capacity (vs. current flow) remain genuinely unresolved after a
-- real search this pass -- the SAME character of unknowns already accepted as "Requires Direct
-- Confirmation" at both Bonner Springs and Eisenhower Road, not a reason to withhold Pursue on
-- its own. A speculative claim from an earlier internal search synthesis (that Lansing''s city
-- attorney had already ruled a local moratorium petition out of order) could NOT be
-- independently re-verified against a direct source this pass and is explicitly DISCARDED here
-- rather than carried into the record -- the county''s own (since-expired) moratorium remains
-- confirmed real, but its applicability to this already-rezoned, incorporated city parcel is
-- simply unconfirmed either way, not resolved negatively.
--
-- Given the floodplain resolution, developer_assessment moves WATCH -> PURSUE, and
-- approval_pillar_label moves moderate -> favorable (the two findings that drove the downgrade
-- are resolved or discarded, not replaced with new negative evidence). site_pillar_label moves
-- moderate -> strong, matching the other two sites now that land/floodplain fundamentals are
-- similarly well-supported. potential_score moves 58 -> 65.

insert into sources (agency, title, source_type, url, published_date) values
  ('City of Lansing, KS', 'Planning Commission Staff Report, Case 2025-DEV-002 (March 19, 2025)', 'agency_document',
   'https://mccmeetingspublic.blob.core.usgovcloudapi.net/lansingks-meet-a4923fc4b9fb4f58a6c3b14259dc979d/ITEM-Attachment-001-9f626cf51e2a4de794cbe7cb538a3c54.pdf', '2025-03-19'),
  ('City of Lansing, KS', 'Wastewater Department', 'agency_document',
   'https://www.lansingks.org/1210/Wastewater-Department', null);

update catalysts set
  potential_score = 65,
  potential_score_components = '[
    {"key":"power_grid","points":17,"evidence":["Evergy''s KCC-approved Large Load Power Service (LLPS) tariff and \"Path to Power\" active-queue process confirmed to apply territory-wide across Leavenworth County -- VERIFIED (unchanged)"],"unknowns":["A real search this pass (ordinances, SUP cases, Evergy transmission/capital-project pages) found NO named substation near Lansing or the K-7 corridor -- Unknown After Public-Record Search, the same genuine-dead-end pattern found at Eisenhower Road","No transmission line voltage, substation capacity, or MW figure found for this parcel"],"status":"supported"},
    {"key":"land_expansion","points":14,"evidence":["RESOLVED this pass: exact acreage breakdown confirmed via the City of Lansing''s own Planning Commission staff report (Case 2025-DEV-002) -- Tract 1 (R-4 Multi-Family) 38.477 ac, Parcel 2 (I-1 Light Industrial, this site) 85.484 ac, Parcel 3 (B-3 Regional Business) 21.581 ac, totaling 145.542 acres -- VERIFIED, refining the prior \"~145 acres\" estimate","Site address confirmed as 13788 McIntyre Road, Lansing/Leavenworth, KS 66048 -- VERIFIED via the staff report and an independent address geocode match"],"unknowns":["Current ownership/availability status of the 85.484-acre I-1 parcel specifically (see owners)"]},
    {"key":"fiber_connectivity","points":6,"evidence":["AT&T Fiber and Spectrum confirmed serving the broader Leavenworth area generally -- SUPPORTED at a regional level (unchanged)"],"unknowns":["Nothing Lansing- or K-7/McIntyre-corridor-specific found; last-mile availability REQUIRES DIRECT CONFIRMATION"],"status":"supported"},
    {"key":"government_incentives","points":5,"evidence":[],"unknowns":["No specific incentive program identified beyond the rezoning itself (unchanged)"]},
    {"key":"development_entitlement","points":7,"evidence":["Unanimous 8-0 Lansing City Council vote (Ordinance 11-30) completed a real agricultural-to-industrial rezoning, handily exceeding the 6-member supermajority a valid protest petition required (unchanged, VERIFIED)"],"unknowns":["A specific internal-search claim that Lansing''s city attorney had already ruled a local moratorium petition out of order could NOT be independently re-verified this pass and is explicitly discarded, not relied upon, either for or against this parcel"]},
    {"key":"physical_environmental_risk","points":9,"evidence":["RESOLVED this pass: the prior pass''s conflicting Zone X/Zone AE floodplain finding is settled. The site''s actual address (13788 McIntyre Road) was geocoded via the U.S. Census Bureau''s public geocoder, then queried directly against FEMA''s live NFHL ArcGIS REST MapServer at that point plus 4 additional sample points spread across the ~85-acre parcel. 4 of 5 points returned Zone X (Area of Minimal Flood Hazard, SFHA_TF=False) -- VERIFIED via direct authoritative source query, a real resolution, not a coin-flip pick between the two prior conflicting findings"],"unknowns":["The 5th sample point (900 ft north) returned no digitized FEMA zone at all -- unmapped, not evidence of risk, but a reminder this is 5 sample points, not an exhaustive full-parcel-boundary query"],"status":"verified"},
    {"key":"water_cooling","points":3,"evidence":["Lansing''s wastewater plant treats approximately 850,000 GPD of city flow plus approximately 450,000 GPD from the Lansing Correctional Facility (~1.3 MGD combined current flow) -- VERIFIED current flow (unchanged)"],"unknowns":["The plant''s design/rated capacity was not found this pass despite checking the city''s own Wastewater Department page -- a real, specific contact is now identified: the Wastewater Utility Director, 913-727-2206"]},
    {"key":"transportation_workforce","points":4,"evidence":["Direct K-7 Highway and US-73 corridor access (unchanged)"],"unknowns":[]}
  ]'::jsonb,
  floodplain_status = 'RESOLVED this pass: the site''s actual address (13788 McIntyre Road) was geocoded via the U.S. Census Bureau''s public geocoder (39.2161, -94.8976), then queried directly against FEMA''s live NFHL ArcGIS REST MapServer at that point plus 4 additional sample points spread across the ~85-acre parcel (roughly 900-1,150 ft north/south/east/west). 4 of 5 points returned Zone X (Area of Minimal Flood Hazard, SFHA_TF=False); the 5th (900 ft north) returned no digitized FEMA zone at all (unmapped, not evidence of risk). This resolves the prior pass''s conflicting Zone X/Zone AE finding in favor of predominantly minimal flood hazard -- VERIFIED via direct, repeatable source query, not a representative-point guess.',
  floodplain_constrained = false,
  total_acreage = 145.542,
  available_acreage_status = 'RESOLVED this pass: exact acreage breakdown confirmed via the City of Lansing''s own Planning Commission staff report (Case 2025-DEV-002) -- Tract 1 (R-4 Multi-Family) 38.477 ac, Parcel 2 (I-1 Light Industrial, this site) 85.484 ac, Parcel 3 (B-3 Regional Business) 21.581 ac, totaling 145.542 acres. No specific development plan was before the council -- the rezoning itself was framed purely as a marketability-improving entitlement. Current ownership/availability status of the 85.484-acre I-1 parcel specifically remains unresolved -- see owners.',
  owners = '[
    {"name":"Jay Healy","entity":"Epic Estates 3 LLC","mailing_address":"13788 McIntyre Road, Lansing, KS 66048","ownership_complexity":"Low (single applicant, now corroborated across multiple sources)","last_verified":"2026-10-04","source":"https://citizenportal.ai/articles/6096985/kansas/leavenworth-county/lansing-city/planning-commission-recommends-approval-for-epic-estates-rezoning-amid-community-concerns-over-traffic-notice-and-consistency-with-the-comprehensive-plan","notes":"SUPPORTED -- Jay Healy (applicant) / Epic Estates 3 LLC (owner) now corroborated across multiple independent sources (the rezoning-approval article, the planning-commission-recommendation article, and the staff report''s own Case 2025-DEV-002 reference), upgraded from a single-article \"reported\" finding. Still NOT independently verified against Kansas Secretary of State or county deed records -- both channels remain genuinely dead-ended (KS SOS requires an interactive form submission; Leavenworth County parcel data is static downloads only, no queryable endpoint found)."}
  ]'::jsonb,
  approval_pillar_label = 'favorable',
  site_pillar_label = 'strong',
  community_friction_notes = 'City council''s own vote record describes the rezoning as passing "over resident objections." A valid protest petition was filed, requiring a 6-member supermajority to pass -- the council nonetheless passed it 8-0, handily exceeding that threshold (unchanged). Leavenworth County (not Lansing city) passed a since-expired 90-day data-center-application moratorium in May 2026 tied specifically to the unincorporated-county Project Bluestem proposal near Tonganoxie. A specific claim synthesized during the prior pass -- that Lansing''s own city attorney had already ruled a local moratorium petition out of order -- could NOT be independently re-verified against a direct source this pass and is explicitly discarded rather than relied upon. Net: no confirmed evidence either way that the county moratorium activity has any bearing on this already-rezoned, incorporated Lansing parcel.',
  primary_advantage = 'The floodplain conflict that drove the prior "Watch" rating is now resolved: a direct, repeatable FEMA query against the site''s actual geocoded address confirms predominantly Zone X (minimal flood hazard) across 4 of 5 sampled points. Exact acreage (145.542 total, 85.484 I-1) is confirmed via the city''s own staff report, and ownership (Jay Healy / Epic Estates 3 LLC) is now corroborated across multiple independent sources.',
  primary_risk = 'Substation, transmission voltage/distance, and MW figure remain unconfirmed after a real search -- no named substation was found anywhere near Lansing or the K-7 corridor, the same genuine gap found at Eisenhower Road. Gas pipeline distance to this specific parcel and the wastewater plant''s design capacity (vs. current flow only) are also unresolved. Ownership remains corroborated-but-not-formally-verified -- Kansas Secretary of State and county deed records are both still inaccessible through public self-service tools.',
  developer_assessment = 'pursue',
  developer_takeaway = 'The floodplain conflict that justified a cautious "Watch" rating in the prior pass is resolved: a direct FEMA query against the site''s real geocoded address confirms predominantly minimal flood hazard across the parcel. Exact acreage and the rezoning history are both well-documented, and ownership (Jay Healy / Epic Estates 3 LLC) is now corroborated across multiple sources, though not yet formally verified against state or county records. The remaining open questions -- substation/transmission capacity, gas pipeline distance, and wastewater design capacity -- are the same character of genuinely public-record-exhausted unknowns already accepted at Bonner Springs and Eisenhower Road, not a reason to hold this site back on its own. A developer should request a Path to Power assessment from Evergy and directly contact Lansing''s Wastewater Utility Director (913-727-2206) and Southern Star Central Gas Pipeline for the two remaining infrastructure unknowns.',
  next_steps = array[
    'Submit a Path to Power inquiry to Evergy for this parcel -- no substation was identified publicly anywhere near this corridor.',
    'Contact Lansing''s Wastewater Utility Director (913-727-2206) directly for the plant''s design/rated capacity, not just current flow.',
    'Contact Southern Star Central Gas Pipeline / Kansas Gas Service for distance and delivery capacity to this specific parcel.',
    'Independently verify Jay Healy / Epic Estates 3 LLC via Kansas Secretary of State''s Business Entity Search (in person or by phone, since the online form is not scriptable) and Leavenworth County deed records.',
    'Contact Jay Healy / Epic Estates 3 LLC directly (via the recorded site address, 13788 McIntyre Road) regarding current sale/option willingness.'
  ],
  unknowns_to_verify = array[
    'Substation capacity, transmission voltage/distance, and MW figure specific to this parcel -- Unknown After Public-Record Search; no named substation found at all (Requires Direct Confirmation via Evergy)',
    'Natural gas pipeline distance to this specific parcel -- Southern Star''s presence is confirmed countywide, not pinned to this site (Requires Direct Confirmation -- operator)',
    'Wastewater plant design/rated capacity for Lansing, as opposed to current flow only (Requires Direct Confirmation -- Lansing Wastewater Utility Director, 913-727-2206)',
    'Independent verification of current ownership beyond multiple-source corroboration (Jay Healy / Epic Estates 3 LLC) against Kansas Secretary of State or county deed records',
    'Whether Leavenworth County''s expired data-center moratorium activity has any bearing on this incorporated, already-rezoned Lansing parcel -- genuinely unconfirmed either way, not resolved negatively'
  ],
  additional_source_ids = array[
    (select id from sources where url ilike '%kansasreflector.com%new-kansas-rules%'),
    (select id from sources where url ilike '%curb.kansas.gov%CURB_News_25Q4%'),
    (select id from sources where url ilike '%wikipedia.org%Southern_Star_Central_Gas_Pipeline%'),
    (select id from sources where url ilike '%citizenportal.ai%Centennial-Bridge-pipeline-relocation%'),
    (select id from sources where url ilike '%hazards.fema.gov%NFHL%'),
    (select id from sources where url ilike '%mccmeetingspublic.blob.core.usgovcloudapi.net%9f626cf51e2a4de794cbe7cb538a3c54%'),
    (select id from sources where url ilike '%lansingks.org%Wastewater-Department%')
  ],
  last_verified_at = now()
where title = 'K-7 / McIntyre Road Industrial Rezoning';
