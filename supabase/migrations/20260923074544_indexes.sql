-- Speed up "nearby" searches (GIST index required for geography columns)
create index businesses_location_idx on businesses using gist (location);
create index branches_location_idx on branches using gist (location);

-- Speed up common filters
create index businesses_category_idx on businesses (category_id);
create index businesses_city_idx on businesses (city);
create index businesses_status_idx on businesses (status);
create index businesses_owner_idx on businesses (owner_id);

create index branches_business_idx on branches (business_id);
create index business_photos_business_idx on business_photos (business_id);
create index saved_businesses_user_idx on saved_businesses (user_id);
create index search_history_user_idx on search_history (user_id);
create index payments_business_idx on payments (business_id);
create index payments_status_idx on payments (status);