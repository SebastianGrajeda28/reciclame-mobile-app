create or replace function app_social.add_friend_by_code(p_code text)
returns jsonb
language plpgsql security definer
set search_path to 'public', 'auth'
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := nullif(btrim(p_code), '');
  v_friend_id uuid;
  v_friendship_id uuid;
  v_created boolean := false;
begin
  if v_uid is null then raise exception 'unauthenticated'; end if;
  if v_code is null then raise exception 'invalid friend code'; end if;

  select user_id into v_friend_id
  from public.friend_codes
  where code = v_code and is_active = true and (expires_at is null or expires_at > now())
  limit 1;

  if v_friend_id is null then raise exception 'friend code not found'; end if;
  if v_friend_id = v_uid then raise exception 'cannot add yourself'; end if;

  begin
    insert into public.friendships (requester_id, addressee_id, status, responded_at)
    values (v_uid, v_friend_id, 'accepted', now())
    returning id into v_friendship_id;
    v_created := true;
  exception when unique_violation then
    select id into v_friendship_id
    from public.friendships
    where user_low = least(v_uid, v_friend_id) and user_high = greatest(v_uid, v_friend_id)
    limit 1;
  end;

  return jsonb_build_object('friendship_id', v_friendship_id, 'friend_id', v_friend_id, 'created', v_created);
end;
$$;

create or replace function public.add_friend_by_code(p_code text)
returns jsonb
language sql security definer
set search_path to 'public', 'app_social'
as $$ select app_social.add_friend_by_code(p_code); $$;

revoke all on function app_social.add_friend_by_code(text) from public;
grant all on function app_social.add_friend_by_code(text) to service_role;
grant all on function public.add_friend_by_code(text) to authenticated;
grant all on function public.add_friend_by_code(text) to service_role;
