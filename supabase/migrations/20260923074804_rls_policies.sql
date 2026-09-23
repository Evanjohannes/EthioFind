-- Turn on RLS for every table
alter table categories enable row level security;
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table branches enable row level security;
alter table business_photos enable row level security;
alter table saved_businesses enable row level security;
alter table search_history enable row level security;
alter table payment_methods enable row level security;
alter table payments enable row level security;

-- Helper function: check if the current user is an admin
create function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- CATEGORIES: everyone can read, only admins can write
create policy "categories_select_all" on categories for select using (true);
create policy "categories_admin_write" on categories for all using (is_admin());

-- PROFILES: users can see their own profile, admins can see all; users can update their own
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- BUSINESSES: public can see active ones; owners can see/edit their own; admins see/edit all
create policy "businesses_select_active" on businesses for select
  using (status = 'active' or owner_id = auth.uid() or is_admin());
create policy "businesses_insert_own" on businesses for insert
  with check (owner_id = auth.uid());
create policy "businesses_update_own_or_admin" on businesses for update
  using (owner_id = auth.uid() or is_admin());

-- BRANCHES: visible if parent business is visible; only owner/admin can write
create policy "branches_select" on branches for select
  using (
    exists (select 1 from businesses b where b.id = business_id
      and (b.status = 'active' or b.owner_id = auth.uid() or is_admin()))
  );
create policy "branches_write_owner_or_admin" on branches for all
  using (
    exists (select 1 from businesses b where b.id = business_id
      and (b.owner_id = auth.uid() or is_admin()))
  );

-- BUSINESS_PHOTOS: same pattern as branches
create policy "photos_select" on business_photos for select
  using (
    exists (select 1 from businesses b where b.id = business_id
      and (b.status = 'active' or b.owner_id = auth.uid() or is_admin()))
  );
create policy "photos_write_owner_or_admin" on business_photos for all
  using (
    exists (select 1 from businesses b where b.id = business_id
      and (b.owner_id = auth.uid() or is_admin()))
  );

-- SAVED_BUSINESSES: users only see/manage their own saved list
create policy "saved_own_only" on saved_businesses for all
  using (user_id = auth.uid());

-- SEARCH_HISTORY: users only see/manage their own history
create policy "search_history_own_only" on search_history for all
  using (user_id = auth.uid());

-- PAYMENT_METHODS: everyone can read active ones, only admins write
create policy "payment_methods_select_active" on payment_methods for select
  using (is_active = true or is_admin());
create policy "payment_methods_admin_write" on payment_methods for all
  using (is_admin());

-- PAYMENTS: owner sees their own business's payments, admin sees all; only admin updates status
create policy "payments_select_own_or_admin" on payments for select
  using (
    exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
    or is_admin()
  );
create policy "payments_insert_own" on payments for insert
  with check (
    exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
create policy "payments_update_admin_only" on payments for update
  using (is_admin());