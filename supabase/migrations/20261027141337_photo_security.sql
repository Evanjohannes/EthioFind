-- Only the business owner (or an admin) can upload or delete photos in that business's folder
drop policy "business_photos_owner_upload" on storage.objects;

create policy "business_photos_owner_upload" on storage.objects for insert
with check (
  bucket_id = 'business-photos'
  and exists (
    select 1 from public.businesses b
    where b.id::text = (storage.foldername(name))[1]
      and (b.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "business_photos_owner_delete" on storage.objects for delete
using (
  bucket_id = 'business-photos'
  and exists (
    select 1 from public.businesses b
    where b.id::text = (storage.foldername(name))[1]
      and (b.owner_id = auth.uid() or public.is_admin())
  )
);

-- Max 10 photos per business
create or replace function limit_business_photos()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from business_photos where business_id = new.business_id) >= 10 then
    raise exception 'A business can have at most 10 photos';
  end if;
  return new;
end;
$$;

create trigger business_photos_limit
  before insert on business_photos
  for each row execute procedure limit_business_photos();