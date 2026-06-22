-- Fixes add_friend_by_code to allow re-sending a friend request after it was declined.
-- Previous behavior: unique_violation always returned the existing row silently.
-- New behavior:
--   declined  → update row back to pending (either side can re-send)
--   pending   → raise 'friend request already pending'
--   accepted  → raise 'already friends'
--   blocked   → raise 'user blocked'

DROP FUNCTION IF EXISTS "app_social"."add_friend_by_code"("p_code" "text");
DROP FUNCTION IF EXISTS "public"."add_friend_by_code"("p_code" "text");

CREATE FUNCTION "app_social"."add_friend_by_code"("p_code" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_code text := nullif(btrim(p_code), '');
  v_friend_id uuid;
  v_friendship_id uuid;
  v_existing_status text;
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
    insert into public.friendships (requester_id, addressee_id, status)
    values (v_uid, v_friend_id, 'pending')
    returning id into v_friendship_id;
    v_created := true;
  exception when unique_violation then
    select id, status into v_friendship_id, v_existing_status
    from public.friendships
    where user_low = least(v_uid, v_friend_id) and user_high = greatest(v_uid, v_friend_id)
    limit 1;

    if v_existing_status = 'declined' then
      update public.friendships
      set status = 'pending',
          requester_id = v_uid,
          addressee_id = v_friend_id,
          responded_at = null,
          updated_at = now()
      where id = v_friendship_id;
      v_created := true;
    elsif v_existing_status = 'pending' then
      raise exception 'friend request already pending';
    elsif v_existing_status = 'accepted' then
      raise exception 'already friends';
    elsif v_existing_status = 'blocked' then
      raise exception 'user blocked';
    end if;
  end;

  return jsonb_build_object('friendship_id', v_friendship_id, 'friend_id', v_friend_id, 'created', v_created);
end;
$$;

CREATE FUNCTION "public"."add_friend_by_code"("p_code" "text") RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_social'
    AS $$ select app_social.add_friend_by_code(p_code); $$;

REVOKE ALL ON FUNCTION "app_social"."add_friend_by_code"("p_code" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "app_social"."add_friend_by_code"("p_code" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."add_friend_by_code"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_friend_by_code"("p_code" "text") TO "service_role";
