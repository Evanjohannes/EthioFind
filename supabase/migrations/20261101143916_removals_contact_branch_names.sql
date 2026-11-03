-- 1. Automatic branch names: "<Business> Branch 2", "Branch 3", ...
alter table branches add column if not exists branch_number integer;

update branches b
set branch_number = n.rn + 1
from (
  select id, row_number() over (partition by business_id order by created_at, id) as rn
  from branches
) n
where b.id = n.id and b.branch_number is null;

alter table branches alter column branch_number set not null;

create or replace function set_branch_number()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    select coalesce(max(branch_number), 1) + 1 into new.branch_number
    from branches where business_id = new.business_id;
  else
    new.branch_number := old.branch_number;
  end if;
  return new;
end;
$$;

create trigger branches_set_number
  before insert or update on branches
  for each row execute procedure set_branch_number();

create unique index if not exists branches_business_number_idx on branches (business_id, branch_number);

-- search results now name a branch "<Business> Branch N"
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
    select br.id, b.id, true, b.name || ' Branch ' || br.branch_number::text,
           br.label, b.category_id, br.city, br.subcity,
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

-- 2. Notices that owners see when an admin removes something
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  business_name text,
  branch_label text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index notifications_user_idx on notifications (user_id, created_at desc);

alter table notifications enable row level security;

create policy "notifications_select_own" on notifications for select
  using (user_id = auth.uid());
create policy "notifications_update_own" on notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- owners can only mark a notice as read, nothing else; only the admin functions below create notices
revoke update on notifications from anon, authenticated;
grant update (read_at) on notifications to authenticated;

-- 3. Admin deletes: a written reason is required, the owner is notified, and the file paths come back so the app can clean up storage
create or replace function admin_delete_business(p_business_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  biz businesses;
  photo_paths text[];
  receipt_paths text[];
  video_paths text[];
begin
  if not is_admin() then
    raise exception 'Only admins can delete businesses';
  end if;
  if p_reason is null or length(trim(p_reason)) < 5 then
    raise exception 'Please write a reason (at least 5 characters)';
  end if;

  select * into biz from businesses where id = p_business_id;
  if biz.id is null then
    raise exception 'Business not found';
  end if;

  select coalesce(array_agg(storage_path), '{}') into photo_paths
    from business_photos where business_id = p_business_id;

  select coalesce(array_agg(receipt_storage_path), '{}') into receipt_paths
    from payments where business_id = p_business_id and receipt_storage_path is not null;

  select coalesce(array_agg(video_path), '{}') into video_paths
    from (
      select video_path from businesses where id = p_business_id and video_path is not null
      union all
      select video_path from branches where business_id = p_business_id and video_path is not null
    ) v;

  insert into notifications (user_id, kind, title, body, business_name)
  values (biz.owner_id, 'business_deleted', 'Your business was removed', trim(p_reason), biz.name);

  delete from businesses where id = p_business_id;

  return jsonb_build_object(
    'photos', to_jsonb(photo_paths),
    'receipts', to_jsonb(receipt_paths),
    'videos', to_jsonb(video_paths)
  );
end;
$$;

create or replace function admin_delete_branch(p_branch_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  br branches;
  biz businesses;
  photo_paths text[];
begin
  if not is_admin() then
    raise exception 'Only admins can delete branches';
  end if;
  if p_reason is null or length(trim(p_reason)) < 5 then
    raise exception 'Please write a reason (at least 5 characters)';
  end if;

  select * into br from branches where id = p_branch_id;
  if br.id is null then
    raise exception 'Branch not found';
  end if;

  select * into biz from businesses where id = br.business_id;

  select coalesce(array_agg(storage_path), '{}') into photo_paths
    from business_photos where branch_id = p_branch_id;

  insert into notifications (user_id, kind, title, body, business_name, branch_label)
  values (
    biz.owner_id, 'branch_deleted', 'A branch of your business was removed',
    trim(p_reason), biz.name, biz.name || ' Branch ' || br.branch_number::text
  );

  delete from branches where id = p_branch_id;

  return jsonb_build_object(
    'photos', to_jsonb(photo_paths),
    'videos', case when br.video_path is null then '[]'::jsonb else jsonb_build_array(br.video_path) end
  );
end;
$$;

revoke execute on function admin_delete_business(uuid, text) from public, anon;
revoke execute on function admin_delete_branch(uuid, text) from public, anon;

-- the old direct delete is replaced by the function above (which requires a reason)
drop policy if exists "businesses_admin_delete" on businesses;

-- admins can delete photo and video files even after the business row is gone (fixes the leftover-files bug)
create policy "business_photos_admin_delete" on storage.objects for delete
  using (bucket_id = 'business-photos' and public.is_admin());
create policy "business_videos_admin_delete" on storage.objects for delete
  using (bucket_id = 'business-videos' and public.is_admin());

-- 4. Your contact details (you fill them in from Admin → Settings)
insert into app_settings (key, value) values
  ('contact_phone', ''), ('contact_email', ''), ('contact_telegram', '')
on conflict (key) do nothing;