create extension if not exists unaccent with schema extensions;

create or replace function search_businesses(
  search_text text default '',
  category_ids uuid[] default null,
  city_filter text default ''
)
returns setof businesses
language sql
stable
set search_path = public, extensions
as $$
  select b.*
  from businesses b
  left join categories c on c.id = b.category_id
  left join categories p on p.id = c.parent_category_id
  where b.status = 'active'
    and (category_ids is null or b.category_id = any(category_ids))
    and (
      coalesce(trim(city_filter), '') = ''
      or unaccent(coalesce(b.city, '')) ilike '%' || unaccent(trim(city_filter)) || '%'
    )
    and (
      coalesce(trim(search_text), '') = ''
      or (
        select bool_and(
          unaccent(concat_ws(' ', b.name, c.name, p.name, b.city, b.subcity))
            ilike '%' || unaccent(replace(replace(w, '%', ''), '_', '')) || '%'
        )
        from unnest(string_to_array(trim(search_text), ' ')) as w
        where w <> ''
      )
    );
$$;