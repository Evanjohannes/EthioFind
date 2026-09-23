create table business_photos (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  storage_path text not null,
  sort_order integer default 0,
  is_cover boolean default false,
  created_at timestamptz default now()
);