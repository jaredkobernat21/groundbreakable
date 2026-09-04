-- Adds Lawrence, KS as the third ROQ Shift market. Center point is
-- downtown Lawrence (E 6th St & Massachusetts St), same convention as
-- Topeka/Davenport's center_lat/lng (a real downtown intersection, not
-- a geographic centroid).

insert into markets (slug, name, state, center_lat, center_lng, default_zoom)
values ('lawrence-ks', 'Lawrence', 'KS', 38.973116, -95.236035, 12);
