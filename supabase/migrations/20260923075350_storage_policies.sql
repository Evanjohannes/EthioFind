-- BUSINESS PHOTOS: anyone can view (public bucket), only the business owner can upload
create policy "business_photos_public_read"
on storage.objects for select
using (bucket_id = 'business-photos');

create policy "business_photos_owner_upload"
on storage.objects for insert
with check (
  bucket_id = 'business-photos'
  and auth.uid() is not null
);

-- PAYMENT RECEIPTS: only the uploader and admins can view; only authenticated users can upload
create policy "payment_receipts_owner_or_admin_read"
on storage.objects for select
using (
  bucket_id = 'payment-receipts'
  and (owner = auth.uid() or is_admin())
);

create policy "payment_receipts_upload"
on storage.objects for insert
with check (
  bucket_id = 'payment-receipts'
  and auth.uid() is not null
);