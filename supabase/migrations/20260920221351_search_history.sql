create table search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  query_text text,
  filters_json jsonb,
  created_at timestamptz default now()
);