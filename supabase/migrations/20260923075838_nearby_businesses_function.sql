create or replace function nearby_businesses(
  lat double precision,
  lng double precision,
  radius_meters integer default 5000,
  category_filter uuid default null
)
returns setof businesses
language sql
stable
as $$
  select *
  from businesses
  where status = 'active'
    and (category_filter is null or category_id = category_filter)
    and ST_DWithin(location, ST_MakePoint(lng, lat)::geography, radius_meters)
  order by ST_Distance(location, ST_MakePoint(lng, lat)::geography);
$$;