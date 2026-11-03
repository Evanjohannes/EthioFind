-- 1. Receipts: users can only upload into their own folder (<user id>/...)
drop policy if exists "payment_receipts_upload" on storage.objects;
create policy "payment_receipts_upload" on storage.objects for insert
with check (
  bucket_id = 'payment-receipts'
  and (storage.foldername(objects.name))[1] = auth.uid()::text
);

-- 2. File size and type limits
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'payment-receipts';

update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'business-photos';

-- 3. Internal trigger functions should not be callable from the app
alter function public.handle_new_user() set search_path = public;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.refresh_business_rating() from public, anon, authenticated;
revoke execute on function public.set_payment_amount() from public, anon, authenticated;