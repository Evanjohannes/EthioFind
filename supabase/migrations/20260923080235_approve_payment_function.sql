create or replace function approve_or_reject_payment(
  payment_id uuid,
  new_status payment_status,
  notes text default null
)
returns payments
language plpgsql
security definer
as $$
declare
  updated_payment payments;
  target_business_id uuid;
begin
  -- Only admins can call this
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

  -- If approved, activate the linked business too
  if new_status = 'approved' then
    update businesses
    set status = 'active'
    where id = updated_payment.business_id;
  end if;

  return updated_payment;
end;
$$;