create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_category_id uuid references categories(id) on delete set null,
  icon text,
  sort_order integer default 0,
  created_at timestamptz default now()
);