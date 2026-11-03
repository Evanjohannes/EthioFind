alter table businesses add column if not exists video_path text;

-- bucket for the cover videos (max 15 MB each, mp4 / webm / mov only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-videos', 'business-videos', true, 15728640,
        array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "business_videos_public_read" on storage.objects for select
using (bucket_id = 'business-videos');

create policy "business_videos_owner_upload" on storage.objects for insert
with check (
  bucket_id = 'business-videos'
  and exists (
    select 1 from public.businesses b
    where b.id::text = (storage.foldername(objects.name))[1]
      and (b.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "business_videos_owner_delete" on storage.objects for delete
using (
  bucket_id = 'business-videos'
  and exists (
    select 1 from public.businesses b
    where b.id::text = (storage.foldername(objects.name))[1]
      and (b.owner_id = auth.uid() or public.is_admin())
  )
);