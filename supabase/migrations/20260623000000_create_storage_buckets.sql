-- Create storage buckets for instruction step images and bin type images.
-- Both buckets are public (read) so mobile clients can load images without auth.
-- Write access is restricted to authenticated admin users.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'instruction-step-images',
    'instruction-step-images',
    true,
    5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'bin-type-images',
    'bin-type-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do nothing;

-- Anyone can read (public bucket handles this, but explicit policy for clarity)
create policy "public read instruction-step-images"
  on storage.objects for select
  using (bucket_id = 'instruction-step-images');

create policy "public read bin-type-images"
  on storage.objects for select
  using (bucket_id = 'bin-type-images');

-- Only authenticated users with admin role can upload/update/delete
create policy "admin write instruction-step-images"
  on storage.objects for insert
  with check (
    bucket_id = 'instruction-step-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
        and upper(r.name) = 'ADMIN'
    )
  );

create policy "admin update instruction-step-images"
  on storage.objects for update
  using (
    bucket_id = 'instruction-step-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
        and upper(r.name) = 'ADMIN'
    )
  );

create policy "admin delete instruction-step-images"
  on storage.objects for delete
  using (
    bucket_id = 'instruction-step-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
        and upper(r.name) = 'ADMIN'
    )
  );

create policy "admin write bin-type-images"
  on storage.objects for insert
  with check (
    bucket_id = 'bin-type-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
        and upper(r.name) = 'ADMIN'
    )
  );

create policy "admin update bin-type-images"
  on storage.objects for update
  using (
    bucket_id = 'bin-type-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
        and upper(r.name) = 'ADMIN'
    )
  );

create policy "admin delete bin-type-images"
  on storage.objects for delete
  using (
    bucket_id = 'bin-type-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
        and upper(r.name) = 'ADMIN'
    )
  );
