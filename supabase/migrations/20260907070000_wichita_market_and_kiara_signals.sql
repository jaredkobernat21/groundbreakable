-- Adds Wichita, KS as a tracked market and seeds it with real
-- commercial-construction signals, built for Kiara Buggs (Valere
-- Solutions LLC) -- a post-construction/commercial cleaning company
-- (Jared, 2026-09-07). Wichita is south-central Kansas, unrelated to
-- the KC-metro/Topeka/Lawrence corridor every other tracked market
-- sits in -- Groundbreakable's first market outside that cluster.
--
-- A cleaning contractor's useful signal is completely different from
-- every persona built so far: not land value, not distress, but large
-- COMMERCIAL construction projects (office, retail, medical,
-- hospitality, fitness -- Valere Solutions' own stated served sectors)
-- approaching completion, when the post-construction cleaning contract
-- gets awarded. Every project below is real and sourced from Downtown
-- Wichita's own official development tracker and a Medical Society of
-- Sedgwick County article on Wichita's medical-building boom.

insert into markets (slug, name, state, center_lat, center_lng, default_zoom) values
  ('wichita-ks', 'Wichita', 'KS', 37.6857, -97.3326, 12);

-- --- sources ---

insert into sources (id, agency, title, source_type, url, published_date) values
  ('a5000000-0000-4000-8000-000000000001', 'Downtown Wichita', 'Under Construction — Development Projects', 'agency_document', 'https://downtownwichita.org/development/development-projects/under-construction', null),
  ('a5000000-0000-4000-8000-000000000002', 'Medical Society of Sedgwick County', 'Wichita seeing medical building boom', 'news', 'https://mssconline.com/2026/05/20/wichita-seeing-medical-building-boom/', '2026-05-20');

-- --- shifts ---

insert into shifts (market_id, category, shift_type, event, description, event_date, impact, audience, source_id, detected_at) values
  (
    (select id from markets where slug = 'wichita-ks'), 'building', 'major_commercial_construction',
    'Wichita Biomedical Campus ($302M, 350,000 sq ft) construction finishing December 2026',
    '8-story downtown research/medical-education hub -- joint project of Wichita State University, WSU Tech, and KU School of Medicine-Wichita, bringing 3,000 students and 200 faculty. Staff move-in spring 2027, classes begin summer 2027 -- a large, near-term post-construction cleaning scope with a firm timeline.',
    '2026-12-01', 'high', array['contractor']::shift_audience[],
    'a5000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'wichita-ks'), 'building', 'hospitality_construction',
    'Hotel Indigo ($40M, 119 rooms) under construction downtown',
    'Historic Petroleum & McClellan Hotel buildings at Broadway/William being converted into a 119-room hotel with a standalone restaurant/bar -- matches Valere Solutions'' stated hospitality service sector directly.',
    '2026-06-01', 'medium', array['contractor']::shift_audience[],
    'a5000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'wichita-ks'), 'building', 'hospitality_construction',
    'Wichita Tribute Marriott ($9.6M, 160 rooms) planned for Maple St & McLean Blvd',
    'Seven-story hotel with rooftop bar and restaurant. Longer-dated than the rest of this list -- construction through end of 2027, opening early 2028 -- but a real, confirmed hospitality project worth tracking early.',
    '2027-12-01', 'low', array['contractor']::shift_audience[],
    'a5000000-0000-4000-8000-000000000001', now()
  ),
  (
    (select id from markets where slug = 'wichita-ks'), 'building', 'medical_facility_construction',
    'Children''s Mercy Wichita clinic ($18.3M, 18,000 sq ft) opening summer 2026',
    '29th St N & Greenwich Rd -- stand-alone multispecialty clinic, 30 exam rooms plus lab and imaging facilities. One of several medical projects driving what the Medical Society of Sedgwick County calls a "medical building boom" in Wichita.',
    '2026-06-01', 'high', array['contractor']::shift_audience[],
    'a5000000-0000-4000-8000-000000000002', now()
  ),
  (
    (select id from markets where slug = 'wichita-ks'), 'building', 'medical_facility_construction',
    'Primary Care Associates clinic ($12.4M, 33,000 sq ft) planned at 21st St N & 127th St E',
    '48 exam rooms -- part of the same wave of medical-office construction as the Children''s Mercy clinic.',
    '2026-09-07', 'medium', array['contractor']::shift_audience[],
    'a5000000-0000-4000-8000-000000000002', now()
  ),
  (
    (select id from markets where slug = 'wichita-ks'), 'building', 'major_commercial_construction',
    'South Central Regional Mental Health Hospital ($111.5M, 104 beds) under construction since April 2025',
    'Sedgwick County / State of Kansas project. Estimated completion October 2026, opening early 2027 -- the largest single medical facility in this batch, and a public (not private) awarding entity.',
    '2026-10-01', 'high', array['contractor']::shift_audience[],
    'a5000000-0000-4000-8000-000000000002', now()
  );

-- --- development_opportunities ---
-- The two biggest, nearest-term commercial projects, seeded as
-- opportunity_group='contractor' -- same "no cleaning contractor
-- publicly identified" framing already used for Alexander Vaught's
-- New Berry at Piper opportunity.

insert into development_opportunities (market_id, address, latitude, longitude, opportunity_type, strength, category, opportunity_group, signals, reasons, source_ids, date_identified) values
  (
    (select id from markets where slug = 'wichita-ks'),
    'Wichita Biomedical Campus, downtown Wichita, KS',
    null, null,
    'Major Medical/Education Campus — Construction Finishing Dec 2026', 'high', 'early_project', 'contractor',
    array['major_commercial_construction','near_term_completion'],
    array[
      '$302M, 350,000 sq ft, 8-story downtown campus -- the largest single post-construction cleaning scope identified in Wichita',
      'Construction on track to finish December 2026, with staff move-in spring 2027 -- a firm, near-term timeline',
      'No post-construction or ongoing janitorial contractor publicly identified for the campus',
      'Joint WSU/WSU Tech/KU Med project -- a single successful pitch could lead to an ongoing facility-cleaning relationship, not just a one-time post-construction job'
    ],
    array['a5000000-0000-4000-8000-000000000001'::uuid],
    '2026-09-07'
  ),
  (
    (select id from markets where slug = 'wichita-ks'),
    'Children''s Mercy Wichita clinic, 29th St N & Greenwich Rd, Wichita, KS',
    null, null,
    'Medical Clinic — Opening Summer 2026', 'high', 'early_project', 'contractor',
    array['medical_facility','near_term_completion'],
    array[
      '$18.3M, 18,000 sq ft multispecialty clinic with 30 exam rooms plus lab and imaging -- directly matches Valere Solutions'' stated medical-facility specialty',
      'Slated to open summer 2026 -- an imminent, not speculative, completion window',
      'No post-construction cleaning contractor publicly identified',
      'Part of a broader wave of Wichita medical construction -- a strong first reference could open doors to the other clinics in the same boom'
    ],
    array['a5000000-0000-4000-8000-000000000002'::uuid],
    '2026-09-07'
  );
