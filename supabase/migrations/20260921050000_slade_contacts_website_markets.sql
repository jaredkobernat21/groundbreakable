-- Network view needs a way to show what a contact does and where they
-- operate without inferring it from organization data (many contacts --
-- friends/network, individual brokers -- have no organization_id at all).
-- website mirrors the field already on slade_organizations; markets is a
-- free-text array (not a markets(id) FK array) because contacts are often
-- active in named geographies not yet modeled as a markets row, matching
-- the free-text precedent of slade_buy_boxes.target_markets.

alter table slade_contacts add column website text;
alter table slade_contacts add column markets text[] not null default '{}';
