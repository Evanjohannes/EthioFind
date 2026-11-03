-- each branch gets its own details and video
alter table branches
  add column if not exists description text,
  add column if not exists email text,
  add column if not exists website text,
  add column if not exists telegram text,
  add column if not exists tiktok text,
  add column if not exists video_path text;

-- photos belong either to the main business (branch_id is empty) or to one branch
alter table business_photos
  add column if not exists branch_id uuid references branches(id) on delete cascade;

create index if not exists business_photos_branch_idx on business_photos (branch_id);

-- the 10 photo limit now applies to the main business and to each branch separately
create or replace function limit_business_photos()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from business_photos
      where business_id = new.business_id
        and branch_id is not distinct from new.branch_id) >= 10 then
    raise exception 'You can add at most 10 photos here';
  end if;
  return new;
end;
$$;

-- a photo can only point to a branch of the same business
create or replace function check_photo_branch()
returns trigger
language plpgsql
as $$
begin
  if new.branch_id is not null
     and not exists (
       select 1 from branches where id = new.branch_id and business_id = new.business_id
     ) then
    raise exception 'That branch does not belong to this business';
  end if;
  return new;
end;
$$;

create trigger business_photos_check_branch
  before insert or update on business_photos
  for each row execute procedure check_photo_branch();