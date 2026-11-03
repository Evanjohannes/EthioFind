-- Safe to run even if these columns already exist
alter table businesses
  add column if not exists lat double precision generated always as (ST_Y(location::geometry)) stored,
  add column if not exists lng double precision generated always as (ST_X(location::geometry)) stored;

alter table branches
  add column if not exists lat double precision generated always as (ST_Y(location::geometry)) stored,
  add column if not exists lng double precision generated always as (ST_X(location::geometry)) stored;

-- Search that returns main businesses AND branches, each as its own result
create or replace function search_listings(
  search_text text default '',
  category_ids uuid[] default null,
  city_filter text default ''
)
returns table (
  listing_id uuid,
  business_id uuid,
  is_branch boolean,
  name text,
  branch_label text,
  category_id uuid,
  category_name text,
  city text,
  subcity text,
  address_text text,
  phone text,
  lat double precision,
  lng double precision,
  rating_avg numeric,
  rating_count integer,
  created_at timestamptz
)
language sql
stable
set search_path = public, extensions
as $$
  with listings as (
    select b.id as listing_id, b.id as business_id, false as is_branch, b.name,
           null::text as branch_label, b.category_id, b.city, b.subcity, b.address_text,
           b.phone, b.lat, b.lng, b.rating_avg::numeric as rating_avg, b.rating_count, b.created_at
    from businesses b
    where b.status = 'active'
    union all
    select br.id, b.id, true, b.name, br.label, b.category_id, br.city, br.subcity,
           br.address_text, br.phone, br.lat, br.lng, b.rating_avg::numeric, b.rating_count, br.created_at
    from branches br
    join businesses b on b.id = br.business_id
    where b.status = 'active'
  )
  select l.listing_id, l.business_id, l.is_branch, l.name, l.branch_label, l.category_id,
         c.name as category_name, l.city, l.subcity, l.address_text, l.phone,
         l.lat, l.lng, l.rating_avg, l.rating_count, l.created_at
  from listings l
  left join categories c on c.id = l.category_id
  left join categories p on p.id = c.parent_category_id
  where (category_ids is null or l.category_id = any(category_ids))
    and (
      coalesce(trim(city_filter), '') = ''
      or unaccent(coalesce(l.city, '')) ilike '%' || unaccent(trim(city_filter)) || '%'
    )
    and (
      coalesce(trim(search_text), '') = ''
      or (
        select bool_and(
          unaccent(concat_ws(' ', l.name, l.branch_label, c.name, p.name, l.city, l.subcity, l.address_text))
            ilike '%' || unaccent(replace(replace(w, '%', ''), '_', '')) || '%'
        )
        from unnest(string_to_array(trim(search_text), ' ')) as w
        where w <> ''
      )
    );
$$;