-- Fix _dev_assert_role to require ADMIN instead of the non-existent DEV role.

create or replace function public._dev_assert_role()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and upper(r.name) = 'ADMIN'
      and ur.is_active = true
  ) then
    raise exception 'admin role required';
  end if;
end;
$$;
