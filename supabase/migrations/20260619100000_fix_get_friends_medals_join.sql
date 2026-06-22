-- Fixes get_friends_with_profile: medals subquery referenced achievements.reward_id
-- and rewards.asset_url, both removed by 20260618130000_simplify_cosmetic_model.
-- Rewards are now cosmetic items (item_key/item_type), not image URLs.
-- image_url is set to null; the app falls back to the award icon for all medals.

DROP FUNCTION IF EXISTS "app_social"."get_friends_with_profile"("p_user_id" "uuid");
DROP FUNCTION IF EXISTS "public"."get_friends_with_profile"("p_user_id" "uuid");

CREATE FUNCTION "app_social"."get_friends_with_profile"("p_user_id" "uuid")
RETURNS TABLE(
  "friend_id"          "uuid",
  "name"               "text",
  "current_streak"     integer,
  "avatar_base_style"  "text",
  "last_activity_at"   timestamp with time zone,
  "featured_medals"    "jsonb",
  "avatar_config"      "jsonb"
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
        'name', a.name,
        'description', a.description,
        'image_url', null::text
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

CREATE FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid")
RETURNS TABLE(
  "friend_id"          "uuid",
  "name"               "text",
  "current_streak"     integer,
  "avatar_base_style"  "text",
  "last_activity_at"   timestamp with time zone,
  "featured_medals"    "jsonb",
  "avatar_config"      "jsonb"
)
LANGUAGE "sql" SECURITY DEFINER
SET "search_path" TO 'public', 'app_social'
AS $$
  select * from app_social.get_friends_with_profile(p_user_id);
$$;

REVOKE ALL ON FUNCTION "app_social"."get_friends_with_profile"("p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "app_social"."get_friends_with_profile"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "service_role";
