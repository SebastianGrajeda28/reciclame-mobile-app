\set ON_ERROR_STOP on

begin;

do $$
begin
  if not exists (select 1 from pg_namespace where nspname = 'app_auth') then raise exception 'missing schema app_auth'; end if;
  if not exists (select 1 from pg_namespace where nspname = 'app_analytics') then raise exception 'missing schema app_analytics'; end if;
  if not exists (select 1 from pg_namespace where nspname = 'app_education') then raise exception 'missing schema app_education'; end if;
  if not exists (select 1 from pg_namespace where nspname = 'app_social') then raise exception 'missing schema app_social'; end if;
  if not exists (select 1 from pg_namespace where nspname = 'app_admin') then raise exception 'missing schema app_admin'; end if;
  if not exists (select 1 from pg_namespace where nspname = 'app_profile') then raise exception 'missing schema app_profile'; end if;
  if not exists (select 1 from pg_namespace where nspname = 'app_gamification') then raise exception 'missing schema app_gamification'; end if;
end
$$;

do $$
begin
  if to_regprocedure('public.get_current_account()') is null then raise exception 'missing wrapper public.get_current_account()'; end if;
  if to_regprocedure('app_auth.get_current_account()') is null then raise exception 'missing implementation app_auth.get_current_account()'; end if;
  if to_regprocedure('public.get_admin_dashboard(timestamp with time zone,timestamp with time zone)') is null then raise exception 'missing wrapper public.get_admin_dashboard'; end if;
  if to_regprocedure('app_analytics.get_admin_dashboard(timestamp with time zone,timestamp with time zone)') is null then raise exception 'missing implementation app_analytics.get_admin_dashboard'; end if;
  if to_regprocedure('public.is_current_user_admin()') is null then raise exception 'missing wrapper public.is_current_user_admin()'; end if;
  if to_regprocedure('app_admin.is_current_user_admin()') is null then raise exception 'missing implementation app_admin.is_current_user_admin()'; end if;
  if to_regprocedure('public.update_user_avatar(uuid,uuid)') is null then raise exception 'missing wrapper public.update_user_avatar'; end if;
  if to_regprocedure('app_profile.update_user_avatar(uuid,uuid)') is null then raise exception 'missing implementation app_profile.update_user_avatar'; end if;
  if to_regprocedure('public.update_featured_medals(uuid,uuid[])') is null then raise exception 'missing wrapper public.update_featured_medals'; end if;
  if to_regprocedure('app_gamification.update_featured_medals(uuid,uuid[])') is null then raise exception 'missing implementation app_gamification.update_featured_medals'; end if;
end
$$;

do $$
begin
  if not has_function_privilege('authenticated', 'public.get_current_account()', 'EXECUTE') then
    raise exception 'authenticated missing execute on public.get_current_account()';
  end if;
  if has_function_privilege('authenticated', 'app_auth.get_current_account()', 'EXECUTE') then
    raise exception 'authenticated should not execute app_auth.get_current_account() directly';
  end if;
  if not has_function_privilege('authenticated', 'public.is_current_user_admin()', 'EXECUTE') then
    raise exception 'authenticated missing execute on public.is_current_user_admin()';
  end if;
  if has_function_privilege('authenticated', 'app_admin.is_current_user_admin()', 'EXECUTE') then
    raise exception 'authenticated should not execute app_admin.is_current_user_admin() directly';
  end if;
end
$$;

do $$
declare
  v_missing text[];
begin
  select array_agg(tablename)
  into v_missing
  from pg_tables t
  join pg_class c on c.relname = t.tablename
  join pg_namespace n on n.oid = c.relnamespace and n.nspname = t.schemaname
  where t.schemaname = 'public'
    and t.tablename in ('fun_facts', 'instructions', 'instruction_steps', 'waste_types', 'users', 'user_roles', 'roles')
    and not c.relrowsecurity;

  if v_missing is not null then
    raise exception 'tables without RLS: %', array_to_string(v_missing, ', ');
  end if;
end
$$;

do $$
declare
  v_proc text;
begin
  select n.nspname || '.' || p.proname
  into v_proc
  from pg_trigger t
  join pg_proc p on p.oid = t.tgfoid
  join pg_namespace n on n.oid = p.pronamespace
  where t.tgname = 'on_auth_user_created'
    and t.tgrelid = 'auth.users'::regclass;

  if v_proc is distinct from 'app_auth.handle_new_user' then
    raise exception 'unexpected trigger function: %', v_proc;
  end if;
end
$$;

rollback;