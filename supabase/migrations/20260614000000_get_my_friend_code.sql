create or replace function app_social.get_my_friend_code()
returns text
language plpgsql security definer
set search_path to 'public', 'auth'
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_attempts int := 0;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  select code into v_code
  from public.friend_codes
  where user_id = v_uid
    and is_active = true
    and (expires_at is null or expires_at > now())
  limit 1;
  if v_code is not null then
    return v_code;
  end if;

  loop
    v_attempts := v_attempts + 1;
    v_code := lpad((floor(random() * 100000000))::bigint::text, 8, '0');
    begin
      insert into public.friend_codes (user_id, code)
      values (v_uid, v_code)
      on conflict (user_id) do nothing
      returning code into v_code;
      if v_code is not null then return v_code; end if;
      select code into v_code from public.friend_codes where user_id = v_uid limit 1;
      if v_code is not null then return v_code; end if;
    exception when unique_violation then
      if v_attempts >= 10 then raise exception 'could not generate unique friend code'; end if;
    end;
  end loop;
end;
$$;

create or replace function public.get_my_friend_code()
returns text
language sql security definer
set search_path to 'public', 'app_social'
as $$
  select app_social.get_my_friend_code();
$$;

revoke all on function app_social.get_my_friend_code() from public;
grant all on function app_social.get_my_friend_code() to service_role;
grant all on function public.get_my_friend_code() to authenticated;
grant all on function public.get_my_friend_code() to service_role;
