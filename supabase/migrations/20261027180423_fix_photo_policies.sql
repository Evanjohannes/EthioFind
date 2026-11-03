drop policy if exists "business_photos_owner_upload" on storage.objects;
drop policy if exists "business_photos_owner_delete" on storage.objects;

create policy "business_photos_owner_upload" on storage.objects for insert
with check (
  bucket_id = 'business-photos'
  and exists (
    select 1 from public.businesses b
    where b.id::text = (storage.foldername(objects.name))[1]
      and (b.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "business_photos_owner_delete" on storage.objects for delete
using (
  bucket_id = 'business-photos'
  and exists (
    select 1 from public.businesses b
    where b.id::text = (storage.foldername(objects.name))[1]
      and (b.owner_id = auth.uid() or public.is_admin())
  )
);