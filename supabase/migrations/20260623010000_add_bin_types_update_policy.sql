-- Allow admin users to update bin_types (needed to save imageUrl and depositInstruction).
-- Without this, RLS silently blocks the PATCH and image saves appear to succeed but don't persist.

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'bin_types' and policyname = 'bin_types_update_admin'
  ) then
    create policy "bin_types_update_admin"
      on public.bin_types for update
      using (
        auth.role() = 'authenticated'
        and exists (
          select 1 from public.user_roles ur
          join public.roles r on r.id = ur.role_id
          where ur.user_id = auth.uid()
            and upper(r.name) = 'ADMIN'
        )
      );
  end if;
end $$;
