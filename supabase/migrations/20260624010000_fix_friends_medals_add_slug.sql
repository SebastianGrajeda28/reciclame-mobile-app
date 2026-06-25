-- Fix: add achievement slug to featured_medals JSON in friend profile functions.
-- Previously image_url was hardcoded null; client now resolves local asset images by slug.

CREATE OR REPLACE FUNCTION "app_social"."get_friends_with_profile"("p_user_id" "uuid")
RETURNS TABLE(
  "friend_id"      "uuid",
  "name"           "text",
  "current_streak" integer,
  "avatar_base_style" "text",
  "last_activity_at" timestamp with time zone,
  "featured_medals" "jsonb",
  "avatar_config"  "jsonb"
)
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
begin
  return query
  with my_friends as (
    select
      case when f.requester_id = p_user_id
           then f.addressee_id
           else f.requester_id
      end as friend_id
    from public.friendships f
    where (f.requester_id = p_user_id or f.addressee_id = p_user_id)
      and f.status = 'accepted'
      and f.is_active = true
  )
  select
    mf.friend_id,
    coalesce(up.alias, split_part(u.email, '@', 1)) as name,
    coalesce(prog.streak_days, 0) as current_streak,
    av.base_style as avatar_base_style,
    la.last_activity_at,
    coalesce(med.featured_medals, '[]'::jsonb) as featured_medals,
    av.avatar_config
  from my_friends mf
  join public.users u on u.id = mf.friend_id
  left join public.user_profiles up on up.user_id = mf.friend_id
  left join public.user_progress prog on prog.user_id = mf.friend_id
  left join public.avatars av on av.user_id = mf.friend_id
  left join lateral (
    select max(rr.created_at) as last_activity_at
    from public.recycling_records rr
    where rr.user_id = mf.friend_id
      and rr.is_active = true
  ) la on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'slug', a.slug,
        'name', a.name,
        'description', a.description
      ) order by a.name
    ) as featured_medals
    from public.user_featured_medals ufm
    cross join lateral unnest(ufm.achievement_ids) as t(achievement_id)
    join public.achievements a on a.id = t.achievement_id
    where ufm.user_id = mf.friend_id
  ) med on true
  order by lower(coalesce(up.alias, split_part(u.email, '@', 1)));
end;
$$;

CREATE OR REPLACE FUNCTION "app_social"."get_pending_friend_requests"()
RETURNS TABLE(
  "friendship_id"   "uuid",
  "requester_id"    "uuid",
  "name"            "text",
  "avatar_config"   "jsonb",
  "featured_medals" "jsonb",
  "created_at"      timestamp with time zone
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
        'slug', a.slug,
        'name', a.name,
        'description', a.description
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

GRANT EXECUTE ON FUNCTION "app_social"."get_friends_with_profile"("uuid") TO "service_role";
GRANT EXECUTE ON FUNCTION "app_social"."get_pending_friend_requests"() TO "service_role";
