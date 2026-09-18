-- Groundbreakable Leads: expand market coverage beyond the original
-- Spring Hill / Gardner / Olathe scope into the broader KC-Kansas-side
-- suburbs (Leavenworth County and additional Johnson County cities).

alter table gbl_properties drop constraint gbl_properties_city_check;

alter table gbl_properties add constraint gbl_properties_city_check
  check (city = any (array[
    'Spring Hill', 'Gardner', 'Olathe', 'Unincorporated Johnson County',
    'Leavenworth', 'Lenexa', 'Lansing', 'Tonganoxie', 'Leawood', 'Basehor', 'Bonner Springs',
    'Other'
  ]));
