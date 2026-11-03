-- Allow the status guard to be bypassed only inside the resubmit function
create or replace function prevent_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status
     and auth.uid() is not null
     and not is_admin()
     and coalesce(current_setting('app.allow_status_change', true), '') <> 'on' then
    raise exception 'Only admins can change business status';
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function resubmit_business(
  p_business_id uuid,
  p_payment_method_id uuid,
  p_receipt_path text
)
returns payments
language plpgsql
security definer
set search_path = public
as $$
declare
  biz businesses;
  new_payment payments;
begin
  if auth.uid() is null then
    raise exception 'Not logged in';
  end if;

  select * into biz from businesses where id = p_business_id;
  if biz.id is null or biz.owner_id <> auth.uid() then
    raise exception 'Business not found';
  end if;

  if biz.status <> 'rejected' then
    raise exception 'Only rejected businesses can be resubmitted';
  end if;

  if p_receipt_path is null or p_receipt_path not like (auth.uid()::text || '/%') then
    raise exception 'Invalid receipt';
  end if;

  if not exists (select 1 from payment_methods where id = p_payment_method_id and is_active) then
    raise exception 'Invalid payment method';
  end if;

  -- amount is replaced by the current listing fee by the payments trigger
  insert into payments (business_id, payment_method_id, amount, receipt_storage_path, status)
  values (p_business_id, p_payment_method_id, 0, p_receipt_path, 'pending')
  returning * into new_payment;

  perform set_config('app.allow_status_change', 'on', true);
  update businesses set status = 'pending' where id = p_business_id;
  perform set_config('app.allow_status_change', 'off', true);

  return new_payment;
end;
$$;