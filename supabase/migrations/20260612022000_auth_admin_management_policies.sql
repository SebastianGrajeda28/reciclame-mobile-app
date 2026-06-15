alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "roles_select_active_authenticated" on public.roles;
create policy "roles_select_active_authenticated"
on public.roles
for select
to authenticated
using (is_active = true);

drop policy if exists "roles_admin_all" on public.roles;
create policy "roles_admin_all"
on public.roles
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

drop policy if exists "users_admin_all" on public.users;
create policy "users_admin_all"
on public.users
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

drop policy if exists "user_roles_admin_all" on public.user_roles;
create policy "user_roles_admin_all"
on public.user_roles
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());
