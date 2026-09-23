create type payment_status as enum ('pending', 'approved', 'rejected');

create table payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  payment_method_id uuid references payment_methods(id) on delete set null,
  amount numeric(10,2) not null,
  receipt_storage_path text,
  status payment_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);