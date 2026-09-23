create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  method_type text not null,
  account_name text not null,
  account_number text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);