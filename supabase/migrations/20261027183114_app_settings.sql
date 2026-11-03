create table app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into app_settings (key, value) values ('listing_fee', '500');

alter table app_settings enable row level security;

create policy "settings_select_all" on app_settings for select using (true);
create policy "settings_admin_write" on app_settings for all
  using (is_admin()) with check (is_admin());

-- The payment amount always comes from the current listing fee, never from the browser
create or replace function set_payment_amount()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fee numeric;
begin
  select value::numeric into fee from app_settings where key = 'listing_fee';
  if fee is null then
    raise exception 'Listing fee is not set';
  end if;
  new.amount := fee;
  return new;
end;
$$;

create trigger payments_set_amount
  before insert on payments
  for each row execute procedure set_payment_amount();