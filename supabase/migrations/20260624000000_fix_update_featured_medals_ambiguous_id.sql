-- Fix: column name ambiguity in update_featured_medals
-- The alias "id" from unnest() conflicted with user_achievements.id (PK),
-- causing PostgreSQL to compare the PK against itself instead of the unnested UUID.
-- All submitted IDs were flagged as invalid → user_featured_medals always empty.

CREATE OR REPLACE FUNCTION "app_gamification"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  invalid_ids uuid[];
begin
  if array_length(p_achievement_ids, 1) > 5 then
    return query select false, 'max_featured_medals_exceeded';
    return;
  end if;

  select array_agg(t.aid)
  into invalid_ids
  from unnest(p_achievement_ids) as t(aid)
  where not exists (
    select 1 from public.user_achievements ua
    where ua.user_id = p_user_id and ua.achievement_id = t.aid
  );

  if invalid_ids is not null then
    return query select false, 'invalid_or_unlocked_achievements';
    return;
  end if;

  insert into public.user_featured_medals (user_id, achievement_ids, updated_at)
  values (p_user_id, p_achievement_ids, now())
  on conflict (user_id) do update set
    achievement_ids = excluded.achievement_ids,
    updated_at = now();

  return query select true, 'featured_medals_updated';
end;
$$;

GRANT EXECUTE ON FUNCTION "app_gamification"."update_featured_medals"("uuid", "uuid"[]) TO "authenticated";
