create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (business_id, user_id)
);

create index reviews_business_idx on reviews (business_id);

-- Recalculate the business average whenever a review is added, changed or removed
create or replace function refresh_business_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.business_id, old.business_id);
begin
  update businesses
  set rating_avg = coalesce((select round(avg(rating)::numeric, 1) from reviews where business_id = target), 0),
      rating_count = (select count(*) from reviews where business_id = target)
  where id = target;
  return null;
end;
$$;

create trigger reviews_refresh_rating
  after insert or update or delete on reviews
  for each row execute procedure refresh_business_rating();

-- Nobody can edit rating_avg / rating_count by hand (only the trigger above can)
create or replace function protect_rating_columns()
returns trigger
language plpgsql
as $$
begin
  if (new.rating_avg is distinct from old.rating_avg
      or new.rating_count is distinct from old.rating_count)
     and pg_trigger_depth() = 1
     and auth.uid() is not null then
    raise exception 'Ratings are calculated automatically';
  end if;
  return new;
end;
$$;

create trigger businesses_protect_rating
  before update on businesses
  for each row execute procedure protect_rating_columns();

-- Row Level Security
alter table reviews enable row level security;

create policy "reviews_select_visible" on reviews for select
  using (
    exists (select 1 from businesses b where b.id = business_id
      and (b.status = 'active' or b.owner_id = auth.uid() or is_admin()))
  );

create policy "reviews_insert_own" on reviews for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from businesses b where b.id = business_id
      and b.status = 'active' and b.owner_id <> auth.uid())
  );

create policy "reviews_update_own" on reviews for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reviews_delete_own_or_admin" on reviews for delete
  using (user_id = auth.uid() or is_admin());

-- Lets the app show reviewer usernames without exposing the rest of profiles
create view public_profiles as select id, username from profiles;
grant select on public_profiles to anon, authenticated;