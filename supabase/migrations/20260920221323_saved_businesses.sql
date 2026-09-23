create table saved_businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, business_id)
);