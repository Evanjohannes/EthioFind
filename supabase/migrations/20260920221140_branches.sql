create table branches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  label text,
  city text,
  subcity text,
  address_text text,
  location geography(Point, 4326),
  phone text,
  created_at timestamptz default now()
);