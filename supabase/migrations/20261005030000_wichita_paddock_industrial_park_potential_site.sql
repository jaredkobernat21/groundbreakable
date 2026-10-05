-- Wichita, KS -- Potential Data Center Site discovery pass (Jared's 2026-10-05 "run a pass
-- across Kansas" directive, docs/POTENTIAL_DATA_CENTER_RESEARCH_SPEC.md methodology). ONE new
-- INSERT: Paddock Industrial Park, Wichita's first Kansas Certified Site -- a genuinely clean
-- candidate (single identified owner, real certified shovel-ready acreage, confirmed utility
-- presence, zero data-center-specific activity tied to this park by name/address). A second,
-- real, active pursuit was found and explicitly excluded from this pass: Monarch Energy's
-- approach to landowners near Colwich/Andale, unincorporated Sedgwick County, well northwest of
-- this park and unconnected to it -- that location belongs in Possible/Planned if logged at all,
-- never Potential.
--
-- developer_assessment lands on 'watch', not 'pursue', for a reason distinct from every KC-metro
-- site so far: this is not a power-qualification gap, it's an ACTIVE, IN-FORCE ENTITLEMENT
-- FREEZE. Both the City of Wichita (moratorium confirmed through Sept 10, 2026 -- whether
-- extended further is itself unconfirmed) and Sedgwick County (extended three times, now through
-- Dec 24, 2026, with a public hearing on permanent regulations Nov 12, 2026) currently block any
-- new data-center land-use application in this market, full stop, regardless of the site's own
-- fundamentals. development_gates.entitlement is RED for exactly this reason -- an active
-- moratorium is a material weakness per the master spec's own gate definitions, not merely
-- "promising but unresolved" (yellow).
--
-- Note for a future schema pass (not fixed here, scope discipline): location_access's
-- kc_metro_position field name is a KC-metro-era artifact and doesn't fit non-KC sites like this
-- one -- left null here rather than forced into a mismatched field name; worth generalizing the
-- field name once more non-KC-metro Potential sites exist.

insert into sources (agency, title, source_type, url, published_date) values
  ('Lange Real Estate', 'The Paddock -- Wichita, KS', 'other',
   'https://langere.com/the-paddock/', null),
  ('Lange Real Estate', 'Wichita''s First Kansas Certified Site -- The Paddock Industrial Park', 'press_release',
   'https://langere.com/2023/05/01/wichitas-first-kansas-certified-site-the-paddock-industrial-park/', '2023-05-01');

insert into catalysts (
  market_id, title, catalyst_type, description, address, latitude, longitude,
  influence_radius_meters, status, estimated_value, estimated_scale_note,
  confidence, signal_categories, signal_confidence, power_load_mw,
  catalyst_score, reason_for_catalyst_classification, why_it_matters,
  expected_timeline, related_context, source_id, additional_source_ids,
  potential_score, potential_score_components, opportunity_area,
  power_notes, fiber_notes, land_notes, incentives_notes,
  development_environment_notes, risk_notes, water_notes, natural_gas_notes,
  unknowns_to_verify, why_still_potential, potential_site_type,
  power_pillar_label, site_pillar_label, approval_pillar_label,
  entitlement_velocity, entitlement_velocity_notes,
  city_receptiveness, city_receptiveness_notes,
  community_friction, community_friction_notes,
  utility_timeline, utility_timeline_notes,
  why_this_site, serving_utility, available_capacity_status, total_acreage,
  contiguous_acreage, parcel_count, zoning_status, owners, ownership_coverage,
  primary_advantage, primary_risk, developer_assessment, developer_takeaway,
  next_steps, power_qualification, development_gates
) values (
  (select id from markets where slug = 'wichita-ks'),
  'Paddock Industrial Park',
  'prospective_data_center_site',
  'An 87-acre, 11-lot, Kansas-Certified shovel-ready industrial park in the CrossGate District of southwest Wichita (along MacArthur Rd between Meridian Ave and S West St), developed and owned by Lange Real Estate -- Wichita''s first industrial Kansas Certified Site. No data-center-specific activity found tied to this park by name or address. The City of Wichita and Sedgwick County both currently have active data-center moratoriums in effect, independent of this site''s own fundamentals.',
  '2499 W MacArthur Rd, Wichita, KS 67217',
  37.622330801803, -97.37057752834,
  1600, 'under_study', null, '87-acre, 11-lot certified shovel-ready industrial park',
  'reported', '{}', null, null,
  5, 'High-impact type (potential data center site) + real certified-site/ownership evidence, but no disclosed investment figure and an active area-wide entitlement freeze.',
  'The cleanest Potential candidate found in the Wichita market this pass -- a real, certified, single-owner shovel-ready park with zero known data-center interest, distinct from a real, active pursuit (Monarch Energy) found near Colwich/Andale, well outside this park and excluded from this record.',
  'No confirmed near-term timeline -- both the City of Wichita and Sedgwick County currently have active data-center moratoriums in effect; any application would need to wait for those to resolve (county public hearing on permanent regulations set for Nov 12, 2026)',
  array['Wichita''s first Kansas Certified Site -- 87 acres across 11 contiguous lots (1.15-27.7 ac each)', 'Single identified owner/developer (Lange Real Estate) with a public contact already on file', 'Active City of Wichita and Sedgwick County data-center moratoriums currently block any new application in this market'],
  (select id from sources where url = 'https://langere.com/the-paddock/'),
  array[(select id from sources where url ilike '%langere.com%kansas-certified-site%')],
  44,
  '[
    {"key":"power_grid","points":12,"evidence":["Evergy confirmed to have reviewed plat documentation for this park with no additional easements needed -- SUPPORTED utility presence"],"unknowns":["No substation name, voltage, or distance found despite a real search","Evergy large-load tariff applicability to this specific territory not independently confirmed this pass"],"status":"supported"},
    {"key":"land_expansion","points":13,"evidence":["87 acres across 11 contiguous lots (1.15-27.7 ac each) -- VERIFIED","Kansas Certified Site designation (Kansas Department of Commerce) -- Wichita''s first industrial Certified Site, meaning price/availability/development-cost/access/utility/environmental documentation has already been vetted -- VERIFIED"],"unknowns":[]},
    {"key":"fiber_connectivity","points":2,"evidence":[],"unknowns":["No fiber carrier or route information found for this park -- Unknown After Public-Record Search"]},
    {"key":"government_incentives","points":4,"evidence":["Kansas Certified Site program participation (general industrial-readiness certification, not data-center-specific)"],"unknowns":["No data-center-specific incentive program identified"]},
    {"key":"development_entitlement","points":3,"evidence":["LI (Limited Industrial) zoning already in place -- VERIFIED"],"unknowns":["ACTIVE, IN-FORCE moratoriums at both the City of Wichita (confirmed through Sept 10, 2026; further extension unconfirmed) and Sedgwick County (extended three times, now through Dec 24, 2026, public hearing on permanent regulations Nov 12, 2026) currently block any new data-center application in this market -- a material weakness, not merely an unresolved question, hence the low point allocation despite clean underlying zoning"]},
    {"key":"physical_environmental_risk","points":5,"evidence":[],"unknowns":["Floodplain status not confirmed this pass"]},
    {"key":"water_cooling","points":1,"evidence":[],"unknowns":["No water/sewer capacity figures found -- Unknown After Public-Record Search"]},
    {"key":"transportation_workforce","points":4,"evidence":["10-minute drive to downtown Wichita and to Eisenhower National Airport -- VERIFIED"],"unknowns":[]}
  ]'::jsonb,
  'Paddock Industrial Park, CrossGate District, southwest Wichita, KS -- 87 acres across 11 contiguous Kansas-Certified lots',
  'Evergy confirmed to have reviewed plat documentation for this park with no additional easements needed -- SUPPORTED utility presence. No substation name, voltage, distance, or large-load tariff applicability confirmed specific to this park.',
  null,
  '87 acres across 11 contiguous lots (1.15-27.7 ac each), Kansas Certified Site (Wichita''s first industrial Certified Site), LI (Limited Industrial) zoning already in place. Developed and owned by Lange Real Estate.',
  'Kansas Certified Site program participation; no data-center-specific incentive program identified.',
  'LI zoning already in place and the site is independently certified shovel-ready by the Kansas Department of Commerce -- a real, verified entitlement baseline. However, both the City of Wichita and Sedgwick County currently have active data-center moratoriums in effect, independent of this site''s own zoning status -- no new data-center application can advance in this market until those resolve.',
  'Floodplain status not confirmed this pass.',
  null,
  null,
  array[
    'Substation name, voltage, and distance',
    'Available MW / large-load capacity',
    'City of Wichita moratorium current status (confirmed only through Sept 10, 2026)',
    'Gas, fiber, and water/wastewater capacity',
    'Floodplain status'
  ],
  'No credible public evidence was identified indicating that a data center is currently proposed, planned, or being pursued at Paddock Industrial Park specifically. A separate, real pursuit (Monarch Energy) exists near Colwich/Andale in unincorporated Sedgwick County, well northwest of this park and not connected to it.',
  'site',
  'moderate', 'strong', 'difficult',
  'difficult', 'Both the City of Wichita and Sedgwick County currently have active data-center moratoriums in effect -- Sedgwick County''s has been extended three times (now through Dec 24, 2026, with a public hearing on permanent regulations Nov 12, 2026); the city''s is confirmed only through Sept 10, 2026, with further extension unconfirmed.',
  'low', 'An active, repeatedly-extended moratorium reflects a currently non-receptive posture toward new data-center applications market-wide -- not specific to this park, but a real constraint on it regardless.',
  'unknown', 'No opposition or controversy found specific to this park. A real, documented opposition event (100+ attendees) occurred near Colwich/Andale over a different, unrelated proposal (Monarch Energy) -- not evidence of friction at this site.',
  'unknown', null,
  'Wichita''s first Kansas Certified Site — a shovel-ready, single-owner industrial park with confirmed utility presence. Active city and county data-center moratoria are the principal item blocking any near-term pursuit.',
  'Evergy — Supported',
  'requires_verification',
  87,
  87,
  11,
  'Limited Industrial (LI)',
  '[
    {"name":"Lange Real Estate","public_contact":{"phone":"(316) 529-3100","email":"jeffl@langere.com","website":"https://langere.com/the-paddock/"},"last_verified":"2026-10-05","source":"https://langere.com/the-paddock/"}
  ]'::jsonb,
  'full',
  'Wichita''s first Kansas Certified Site — 87 shovel-ready acres across 11 contiguous lots, confirmed utility presence, and a single identified developer controlling the entire park.',
  'Active data-center moratoriums at both the City of Wichita and Sedgwick County levels currently block any new data-center land-use application in this market, regardless of site fundamentals.',
  'watch',
  'Paddock Industrial Park is Wichita''s first Kansas Certified Site — 87 shovel-ready acres across 11 contiguous lots, developed and controlled by a single owner (Lange Real Estate), with Evergy electric service confirmed via plat review. However, both the City of Wichita and Sedgwick County currently have active data-center moratoria in effect (the county''s extended through December 2026, with a public hearing on permanent regulations set for November 2026) — no new data-center application can advance in this market until that resolves. A developer should monitor the regulatory timeline closely before investing further diligence here.',
  array[
    'Track Sedgwick County''s data-center moratorium through its November 12, 2026 public hearing and expiration.',
    'Confirm whether the City of Wichita''s separate moratorium has been extended past September 10, 2026.',
    'Request a large-load capacity assessment from Evergy once the moratorium lifts.',
    'Contact Lange Real Estate (Jeff Lange, (316) 529-3100) regarding current lot availability and pricing.'
  ],
  'infrastructure_indicated',
  '{
    "power": "yellow",
    "land": "green",
    "site_control": "green",
    "entitlement": "red",
    "btm_gas": "gray",
    "fiber": "gray",
    "water": "gray",
    "environmental": "gray"
  }'::jsonb
);
