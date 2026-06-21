-- Implements the full friend request flow:
-- 1. add_friend_by_code now creates a pending request instead of an immediate friendship.
-- 2. get_pending_friend_requests returns incoming pending requests for the authenticated user.
-- 3. respond_to_friend_request accepts or declines a pending request.

-- ── 1. Modify add_friend_by_code ──────────────────────────────────────────────

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
    select id into v_friendship_id
    from public.friendships
    where user_low = least(v_uid, v_friend_id) and user_high = greatest(v_uid, v_friend_id)
    limit 1;
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

-- ── 2. get_pending_friend_requests ───────────────────────────────────────────

CREATE FUNCTION "app_social"."get_pending_friend_requests"()
RETURNS TABLE(
  "friendship_id"  "uuid",
  "requester_id"   "uuid",
  "name"           "text",
  "avatar_config"  "jsonb",
  "featured_medals" "jsonb",
  "created_at"     timestamp with time zone
)
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'auth'
AS $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'unauthenticated'; end if;

  return query
  select
    f.id as friendship_id,
    f.requester_id,
    coalesce(up.alias, split_part(u.email, '@', 1)) as name,
    av.avatar_config,
    coalesce(med.featured_medals, '[]'::jsonb) as featured_medals,
    f.created_at
  from public.friendships f
  join public.users u on u.id = f.requester_id
  left join public.user_profiles up on up.user_id = f.requester_id
  left join public.avatars av on av.user_id = f.requester_id
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'name', a.name,
        'description', a.description,
        'image_url', null::text
      ) order by a.name
    ) as featured_medals
    from public.user_featured_medals ufm
    cross join lateral unnest(ufm.achievement_ids) as t(achievement_id)
    join public.achievements a on a.id = t.achievement_id
    where ufm.user_id = f.requester_id
  ) med on true
  where f.addressee_id = v_uid
    and f.status = 'pending'
    and f.is_active = true
  order by f.created_at desc;
end;
$$;

CREATE FUNCTION "public"."get_pending_friend_requests"()
RETURNS TABLE(
  "friendship_id"  "uuid",
  "requester_id"   "uuid",
  "name"           "text",
  "avatar_config"  "jsonb",
  "featured_medals" "jsonb",
  "created_at"     timestamp with time zone
)
LANGUAGE "sql" SECURITY DEFINER
SET "search_path" TO 'public', 'app_social'
AS $$
  select * from app_social.get_pending_friend_requests();
$$;

REVOKE ALL ON FUNCTION "app_social"."get_pending_friend_requests"() FROM PUBLIC;
GRANT ALL ON FUNCTION "app_social"."get_pending_friend_requests"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_pending_friend_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pending_friend_requests"() TO "service_role";

-- ── 3. respond_to_friend_request ─────────────────────────────────────────────

CREATE FUNCTION "app_social"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_new_status text;
begin
  if v_uid is null then raise exception 'unauthenticated'; end if;
  if p_action not in ('accept', 'decline') then raise exception 'invalid action'; end if;

  v_new_status := case when p_action = 'accept' then 'accepted' else 'declined' end;

  update public.friendships
  set status = v_new_status,
      responded_at = now(),
      updated_at = now()
  where id = p_friendship_id
    and addressee_id = v_uid
    and status = 'pending'
    and is_active = true;

  if not found then
    raise exception 'request not found or already responded';
  end if;

  return jsonb_build_object('friendship_id', p_friendship_id, 'action', p_action);
end;
$$;

CREATE FUNCTION "public"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_social'
    AS $$ select app_social.respond_to_friend_request(p_friendship_id, p_action); $$;

REVOKE ALL ON FUNCTION "app_social"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "app_social"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") TO "service_role";
