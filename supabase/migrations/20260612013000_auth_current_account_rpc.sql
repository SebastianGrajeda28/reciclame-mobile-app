create or replace function public.get_current_account()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_name text;
  v_role text;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  select u.email
  into v_email
  from public.users u
  where u.id = v_uid;

  select coalesce(au.raw_user_meta_data ->> 'full_name', au.email), au.email
  into v_name, v_email
  from auth.users au
  where au.id = v_uid;

  select r.name
  into v_role
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = v_uid
    and ur.is_active = true
    and r.is_active = true
  order by ur.assigned_at desc nulls last, ur.created_at desc nulls last
  limit 1;

  return jsonb_build_object(
    'id', v_uid,
    'email', coalesce(v_email, ''),
    'name', coalesce(v_name, v_email, ''),
    'role', v_role
  );
end;
$$;

grant execute on function public.get_current_account() to authenticated;
grant execute on function public.get_current_account() to service_role;
