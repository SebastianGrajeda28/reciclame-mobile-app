-- Migration to add get_profile_summary functions and grants
create or replace function app_profile.get_profile_summary(p_user_id uuid)
returns table(
  total_weight_kg numeric,
  total_items bigint,
  member_since timestamp with time zone,
  achievements_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_weight numeric;
  v_items bigint;
  v_member_since timestamp with time zone;
  v_achievements bigint;
begin
  -- 1. Peso total en kg (la columna estimated_weight en recycling_records está en gramos)
  select coalesce(sum(estimated_weight), 0) / 1000.0
  into v_weight
  from public.recycling_records
  where user_id = p_user_id
    and status = 'confirmed'
    and is_active = true;

  -- 2. Cantidad de artículos reciclados
  select count(*)
  into v_items
  from public.recycling_records
  where user_id = p_user_id
    and status = 'confirmed'
    and is_active = true;

  -- 3. Fecha del primer login / registro
  select created_at
  into v_member_since
  from public.users
  where id = p_user_id;

  -- 4. Número de logros completados
  select count(*)
  into v_achievements
  from public.user_achievements
  where user_id = p_user_id
    and is_active = true;

  return query select v_weight, v_items, v_member_since, v_achievements;
end;
$$;

create or replace function public.get_profile_summary(p_user_id uuid)
returns table(
  total_weight_kg numeric,
  total_items bigint,
  member_since timestamp with time zone,
  achievements_count bigint
)
language sql
security definer
set search_path = public, app_profile
as $$
  select * from app_profile.get_profile_summary(p_user_id);
$$;

revoke all on function app_profile.get_profile_summary(uuid) from public;
grant all on function app_profile.get_profile_summary(uuid) to service_role;
grant all on function public.get_profile_summary(uuid) to anon;
grant all on function public.get_profile_summary(uuid) to authenticated;
grant all on function public.get_profile_summary(uuid) to service_role;
