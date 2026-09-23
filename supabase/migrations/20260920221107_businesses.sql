create type business_status as enum ('pending', 'active', 'rejected');

create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  city text,
  subcity text,
  address_text text,
  location geography(Point, 4326),
  phone text,
  email text,
  website text,
  telegram text,
  tiktok text,
  status business_status not null default 'pending',
  rating_avg numeric(2,1) default 0,
  rating_count integer default 0,
  created_at timestamptz default now()
);