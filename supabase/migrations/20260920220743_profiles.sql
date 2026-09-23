-- Role enum: what kind of user this is
create type user_role as enum ('customer', 'owner', 'admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  role user_role not null default 'customer',
  phone text,
  created_at timestamptz default now()
);

-- Automatically create a profile row whenever someone signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();