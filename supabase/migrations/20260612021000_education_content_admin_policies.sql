create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and r.is_active = true
      and r.name = 'ADMIN'
  );
$$;

grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.is_current_user_admin() to service_role;

alter table public.fun_facts enable row level security;
alter table public.instructions enable row level security;
alter table public.instruction_steps enable row level security;
alter table public.waste_types enable row level security;

drop policy if exists "fun_facts_select_active_authenticated" on public.fun_facts;
create policy "fun_facts_select_active_authenticated"
on public.fun_facts
for select
to authenticated
using (is_active = true);

drop policy if exists "fun_facts_admin_all" on public.fun_facts;
create policy "fun_facts_admin_all"
on public.fun_facts
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

drop policy if exists "instructions_select_active_authenticated" on public.instructions;
create policy "instructions_select_active_authenticated"
on public.instructions
for select
to authenticated
using (is_active = true);

drop policy if exists "instructions_admin_all" on public.instructions;
create policy "instructions_admin_all"
on public.instructions
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

drop policy if exists "instruction_steps_select_active_authenticated" on public.instruction_steps;
create policy "instruction_steps_select_active_authenticated"
on public.instruction_steps
for select
to authenticated
using (is_active = true);

drop policy if exists "instruction_steps_admin_all" on public.instruction_steps;
create policy "instruction_steps_admin_all"
on public.instruction_steps
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

drop policy if exists "waste_types_select_active_authenticated" on public.waste_types;
create policy "waste_types_select_active_authenticated"
on public.waste_types
for select
to authenticated
using (is_active = true);

drop policy if exists "waste_types_admin_all" on public.waste_types;
create policy "waste_types_admin_all"
on public.waste_types
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());
