-- Process map (spec section 1) for Lawrence, researched 2026-09-16 against
-- the City of Lawrence's own Planning & Development Services pages, the
-- Land Development Code (Title 20) and its 2025 User Guide, and Kansas
-- annexation/zoning statute. Every row cites the specific document it
-- came from. Two rows (comprehensive_plan_amendment,
-- appeal_of_administrative_decision) are marked 'reported' rather than
-- 'verified' and say exactly what still needs confirming -- per the
-- product principle of never presenting an inference as fact, an
-- unconfirmed procedural detail is better left flagged than guessed.
-- `published_timeline_days` is left null everywhere: no official source
-- publishes a guaranteed elapsed-time figure, and inventing one here
-- would preempt exactly what Entitlement Delay Intelligence (spec
-- section 6) is supposed to calculate empirically once entitlement_cases
-- has real timeline data.

insert into sources (id, agency, title, source_type, url, published_date) values
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c40', 'City of Lawrence Planning & Development Services', 'Planning Division', 'agency_document', 'https://lawrenceks.gov/pds/planning/', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c41', 'The Lawrence Times', 'Planning commission approves rezoning request for affordable housing development in west Lawrence', 'news', 'https://lawrencekstimes.com/2024/04/22/planning-comm-approves-ldcha-rezoning-req/', '2024-04-22'),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c42', 'City of Lawrence Planning & Development Services', 'Special Use Permit Application', 'agency_document', 'https://assets.lawrenceks.org/pds/planning/applications/SUP.pdf', '2024-01-01'),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c43', 'City of Lawrence Planning & Development Services', 'Frequently Asked Questions', 'agency_document', 'https://www.lawrenceks.org/pds/faq/', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c44', 'City of Lawrence Planning & Development Services', 'Subdivision Regulations, LDC Section 20-809 (Major Subdivision -- Preliminary/Final Plat)', 'agency_document', 'https://assets.lawrenceks.org/pds/planning/documents/DevCode.pdf', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c45', 'City of Lawrence Planning & Development Services', 'Minor Subdivision (Lot Split, Replat, Lot Line Adjustment) application guidance', 'agency_document', 'https://lawrenceks.gov/pds/forms/', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c46', 'Lawrence Journal-World', 'City Commission approves annexation request for nearly 300 acres west of the South Lawrence Trafficway', 'news', 'https://www2.ljworld.com/news/city-government/2026/aug/18/city-commission-approves-annexation-request-for-nearly-300-acres-west-of-the-south-lawrence-trafficway/', '2026-08-18'),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c47', 'City of Lawrence Planning & Development Services', 'Request for Annexation (application form)', 'agency_document', 'https://assets.lawrenceks.gov/pds/planning/documents/form-annexrequest.pdf', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c48', 'Kansas State Legislature', 'K.S.A. 12-520 -- Annexation of land by cities', 'other', 'https://www.kslegislature.gov/li_2022/b2021_22/statute/012_000_0000_chapter/012_005_0000_article/012_005_0020_section/012_005_0020_k/', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c49', 'City of Lawrence Planning & Development Services', 'Comprehensive Plan (Horizon 2020/2050 update process)', 'agency_document', 'https://lawrenceks.gov/pds/comp-plan/', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4a', 'City of Lawrence Planning & Development Services', 'Land Development Code User Guide', 'agency_document', 'https://lawrenceks.gov/wp-content/uploads/2025/05/ldc-user-guide-final-050125.pdf', '2025-05-01'),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4b', 'The Lawrence Times', 'Lawrence City Commission approves land development code update, despite public outcry', 'news', 'https://lawrencekstimes.com/2024/11/12/lawrencecitycomm-land-dev-code-update/', '2024-11-12'),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4c', 'City of Lawrence Planning & Development Services', 'Board of Zoning Appeals / Sign Code Board of Appeals meeting information', 'agency_document', 'https://www.lawrenceks.gov/Events/Board-of-Zoning-Appeals', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4d', 'Kansas State Legislature', 'K.S.A. 12-759 -- Board of zoning appeals; powers, appeals from administrative decisions', 'other', 'https://www.kslegislature.gov/li/b2023_24/statute/012_000_0000_chapter/012_007_0000_article/012_007_0059_section/012_007_0059_k/', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4e', 'City of Lawrence Planning & Development Services', 'Floodplain Development Permits', 'agency_document', 'https://www.lawrenceks.gov/City/PDS/Floodplain/Development-Permits', null),
  ('e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4f', 'Douglas County, Kansas', 'County Code Chapter 12, Article 12 -- Floodplain Management Regulations (12-312, floodplain administrator)', 'agency_document', 'https://www.dgcoks.gov/sites/default/files/media/depts/administration/pdf/county-code-chapter-12-article-12-floodplain-regulations.pdf', null)
on conflict (id) do nothing;

insert into entitlement_approval_types (
  market_id, key, label, approval_path, approving_authority, recommending_authority,
  requires_public_hearing, requires_neighborhood_meeting, notice_requirements, required_documents,
  typical_sequence, appeal_path, description, source_id, confidence, last_verified_at
)
select m.id, v.key, v.label, v.approval_path::entitlement_approval_path, v.approving_authority::entitlement_decision_body,
  v.recommending_authority::entitlement_decision_body, v.requires_public_hearing, v.requires_neighborhood_meeting,
  v.notice_requirements, v.required_documents, v.typical_sequence, v.appeal_path, v.description,
  v.source_id::uuid, v.confidence, now()
from markets m
cross join (values
  (
    'rezoning', 'Rezoning', 'rezoning', 'city_commission', 'planning_commission',
    true, false, null::text,
    array[]::text[],
    'Application to Planning & Development Services -> staff review -> public hearing and recommendation by the Lawrence-Douglas County Planning Commission -> first and second reading of the rezoning ordinance before the Lawrence City Commission, which holds final approval authority.',
    'City Commission decision is the final legislative act; no further administrative appeal within the city process.',
    'Standard map-amendment rezoning under LDC Title 20.',
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c40', 'reported'
  ),
  (
    'special_use_permit', 'Special Use Permit', 'discretionary', 'city_commission', 'planning_commission',
    true, false,
    'Applicant must meet with Planning Staff at least 7 working days before submittal. Staff determines completeness within 5 working days of submission; incomplete applications are returned.',
    array['Complete application form', 'Review fee ($500) + $50 legal ad fee + $175 ordinance publication fee', 'Owner authorization form (if applicant is not the legal owner)', 'Legal description of the property (print and electronic)', 'Ownership List Certification form', 'Site plan (print and electronic, TIF preferred)'],
    'Pre-application meeting with staff -> application + fees submitted -> staff completeness review -> public hearing before the Planning Commission -> approval by the City Commission (or County Commission for county-jurisdiction sites) required before a building permit is issued or the use begins.',
    null,
    'City/County Commission is the approving authority depending on jurisdiction; this row reflects the City of Lawrence path.',
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c42', 'verified'
  ),
  (
    'preliminary_plat', 'Preliminary Plat (Major Subdivision, step 1)', 'discretionary', 'planning_commission', null,
    true, false, null,
    array[]::text[],
    'First step of the Major Subdivision process. Requires Planning Commission action/approval; sets the layout the subsequent final plat must be consistent with.',
    null,
    'Applies to major subdivisions; minor subdivisions (lot split/replat/lot line adjustment) follow the administrative minor_subdivision path instead.',
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c44', 'reported'
  ),
  (
    'final_plat', 'Final Plat (Major Subdivision, step 2)', 'administrative', 'staff', null,
    false, false, null,
    array[]::text[],
    'Second step of the Major Subdivision process. Processed administratively by staff when in substantial compliance with the approved preliminary plat and Subdivision Regulations Section 20-809. A guarantee of improvements (or their completion) is required before the plat can be recorded at the Register of Deeds.',
    null,
    null,
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c44', 'reported'
  ),
  (
    'minor_subdivision', 'Minor Subdivision (Lot Split / Replat / Lot Line Adjustment)', 'administrative', 'staff', null,
    false, false, null,
    array[]::text[],
    'Processed administratively by Planning & Development Services staff. Planning Commission approval is required only if the request seeks a variance from the Subdivision Design Standards.',
    null,
    null,
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c45', 'reported'
  ),
  (
    'annexation', 'Annexation', 'discretionary', 'city_commission', 'planning_commission',
    true, false, null,
    array['Petition/Request for Annexation form', 'Legal description of the land'],
    'Property owner petitions the City Commission to annex -> City Commission votes to accept the request, sending it to the Lawrence-Douglas County Planning Commission -> Planning Commission reviews (including any associated rezoning) and makes a recommendation -> request returns to the City Commission for final approval or denial. Under Kansas statute the City Commission may only approve or deny the annexation request, or send an associated rezoning back to the Planning Commission -- it cannot itself modify a rezoning. Land must be adjacent to city right-of-way touching the city boundary and within 1000 feet of municipal water utility (per the Annexation Request form).',
    null,
    'Governed by K.S.A. 12-520 et seq. -- e.g. 12-520(a)(7) allows annexation of adjoining land where the owner of record consents in writing; other subsections cover annexation without consent under additional conditions not itemized here.',
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c46', 'reported'
  ),
  (
    'comprehensive_plan_amendment', 'Comprehensive Plan Amendment', 'discretionary', 'city_commission', 'planning_commission',
    true, false, null,
    array[]::text[],
    'Historically (Horizon 2020 update): issues identified/prioritized, reviewed by the Lawrence-Douglas County Metropolitan Planning Commission, then the draft/final plan or amendment goes to the City and County Commissions -- the plan''s joint governing bodies -- for adoption.',
    null,
    'This describes the periodic full-plan update process. A standalone, site-specific comprehensive-plan-map amendment likely follows a shorter version of the same Planning-Commission-recommends / Commission-adopts sequence, but that specific procedure has not yet been confirmed against a current LDC citation -- treat as reported pending verification.',
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c49', 'reported'
  ),
  (
    'administrative_site_plan', 'Administrative Site Plan Review', 'administrative', 'staff', null,
    false, false, null,
    array[]::text[],
    'Site plans meeting the Land Development Code''s administrative-review thresholds are approved by Planning & Development Services staff without a Planning Commission hearing.',
    null,
    'The 2024 LDC update (adopted November 2024) expanded which project types qualify for administrative review, explicitly intended to make approvals faster and less costly. Exact thresholds per use/district are documented in the LDC itself and have not been itemized here.',
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4b', 'reported'
  ),
  (
    'variance', 'Variance', 'discretionary', 'board_of_zoning_appeals', null,
    true, false,
    'Written public comment must be received by the Planning & Development Services Office by 10:00 a.m. on the day of the Board of Zoning Appeals meeting, submitted electronically to planning@lawrenceks.org.',
    array[]::text[],
    'Application to Planning & Development Services -> public hearing before the Board of Zoning Appeals (also the Sign Code Board of Appeals) -> Board decision.',
    null,
    null,
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4c', 'verified'
  ),
  (
    'administrative_adjustment', 'Administrative Adjustment', 'administrative', 'staff', null,
    false, false, null,
    array[]::text[],
    'Decided administratively by Planning & Development Services staff, not the Board of Zoning Appeals.',
    null,
    'Per LDC Section 20-1605(b): allows minor modifications or deviations from the LDC''s dimensional/numeric standards where required by an unusual site condition or an LDC-compliance problem that becomes apparent after development approval.',
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4a', 'reported'
  ),
  (
    'appeal_of_administrative_decision', 'Appeal of Administrative Decision', 'discretionary', 'board_of_zoning_appeals', null,
    true, false, null,
    array[]::text[],
    'Filed appeal of a staff/administrative interpretation or decision under the Land Development Code -> heard by the Board of Zoning Appeals.',
    null,
    'Kansas zoning statute (K.S.A. 12-759) assigns this appellate function to a city''s board of zoning appeals generally; Lawrence''s specific appeal filing deadline and procedure have not yet been confirmed against the BZA bylaws document (assets.lawrenceks.org/pds/planning/documents/bzabylaws.pdf) -- treat as reported, not verified, until checked.',
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4d', 'reported'
  ),
  (
    'floodplain_development_permit', 'Floodplain Development Permit', 'administrative', 'staff', null,
    false, false, null,
    array[]::text[],
    'Required for construction or development, including placement of manufactured homes, within the Floodplain Overlay District. Reviewed and issued administratively by the Floodplain Administrator (the Director of Zoning and Codes, per Douglas County floodplain regulations covering the city''s urban growth area) -- no Planning Commission or Commission hearing.',
    null,
    null,
    'e2a1c4d0-1b3e-4f6a-9c8d-7e5f2a1b3c4e', 'reported'
  )
) as v(
  key, label, approval_path, approving_authority, recommending_authority,
  requires_public_hearing, requires_neighborhood_meeting, notice_requirements, required_documents,
  typical_sequence, appeal_path, description, source_id, confidence
)
where m.name = 'Lawrence' and m.state = 'KS'
on conflict (market_id, key) do nothing;
