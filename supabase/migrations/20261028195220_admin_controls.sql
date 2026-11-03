-- admins can permanently delete a business (its branches, photos, ratings and payments go with it)
create policy "businesses_admin_delete" on businesses for delete
  using (is_admin());

-- admins can delete payment receipt files when a business is deleted
create policy "payment_receipts_admin_delete" on storage.objects for delete
  using (bucket_id = 'payment-receipts' and public.is_admin());