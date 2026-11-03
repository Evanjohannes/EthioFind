-- 1. Only admins can change a user's role
create or replace function prevent_role_change()
returns trigger as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger profiles_protect_role
  before update on profiles
  for each row execute procedure prevent_role_change();

-- 2. Only admins can change a business's status
create or replace function prevent_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status
     and auth.uid() is not null
     and not is_admin() then
    raise exception 'Only admins can change business status';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger businesses_protect_status
  before update on businesses
  for each row execute procedure prevent_status_change();

-- 3. New businesses and payments must start as pending
drop policy "businesses_insert_own" on businesses;
create policy "businesses_insert_own" on businesses for insert
  with check (owner_id = auth.uid() and status = 'pending');

drop policy "payments_insert_own" on payments;
create policy "payments_insert_own" on payments for insert
  with check (
    status = 'pending'
    and exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

-- 4. Rejecting a payment now marks the business as rejected too
create or replace function approve_or_reject_payment(
  payment_id uuid,
  new_status payment_status,
  notes text default null
)
returns payments
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_payment payments;
begin
  if not is_admin() then
    raise exception 'Only admins can approve or reject payments';
  end if;

  update payments
  set status = new_status,
      admin_notes = notes,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = payment_id
  returning * into updated_payment;

  if updated_payment is null then
    raise exception 'Payment not found';
  end if;

  if new_status = 'approved' then
    update businesses set status = 'active' where id = updated_payment.business_id;
  elsif new_status = 'rejected' then
    update businesses set status = 'rejected' where id = updated_payment.business_id;
  end if;

  return updated_payment;
end;
$$;