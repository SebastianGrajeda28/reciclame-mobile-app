-- Fix ambiguous column reference in check_and_unlock_achievements
-- The NOT IN subqueries had unqualified user_id which was ambiguous in context
DROP FUNCTION IF EXISTS "public"."check_and_unlock_achievements"("p_user_id" "uuid");
CREATE FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") RETURNS TABLE("achievement_id" "uuid", "achievement_name" "text", "achievement_slug" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  up              public.user_progress%ROWTYPE;
  recycling_count integer;
  unique_waste    integer;
  pilas_count     integer;
  raee_count      integer;
  vidrio_count    integer;
  paper_count     integer;
  plastico_count  integer;
  unique_bins     integer;
  bin_plastico    integer;
  bin_raee        integer;
  bin_pilas       integer;
  unique_points   integer;
  point_bib       integer;
  overridden_count integer;
  manual_count    integer;
  friend_count    integer;

  PILAS_BIN_ID        uuid := '33333333-3333-3333-3333-000000000005';
  RAEE_BIN_ID         uuid := '33333333-3333-3333-3333-000000000006';
  PLASTIC_BIN_ID      uuid := '33333333-3333-3333-3333-000000000001';
  BIBLIOTECA_POINT_ID uuid := '22222222-2222-2222-2222-000000000001';
  PILAS_WASTE_ID      uuid := '11111111-1111-1111-1111-000000000005';
  RAEE_WASTE_ID       uuid := '11111111-1111-1111-1111-000000000006';
  VIDRIO_WASTE_ID     uuid := '11111111-1111-1111-1111-000000000004';
  PAPEL_WASTE_ID      uuid := '11111111-1111-1111-1111-000000000009';
  CARTON_WASTE_ID     uuid := '11111111-1111-1111-1111-000000000001';
  PET_WASTE_ID        uuid := '11111111-1111-1111-1111-000000000002';
  OTROS_PLASTIC_ID    uuid := '11111111-1111-1111-1111-000000000007';
BEGIN
  SELECT * INTO up FROM public.user_progress WHERE user_id = p_user_id AND is_active = true;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COUNT(*) INTO recycling_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(DISTINCT waste_type_id) INTO unique_waste FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(*) INTO pilas_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id = PILAS_WASTE_ID;
  SELECT COUNT(*) INTO raee_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id = RAEE_WASTE_ID;
  SELECT COUNT(*) INTO vidrio_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id = VIDRIO_WASTE_ID;
  SELECT COUNT(*) INTO paper_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id IN (PAPEL_WASTE_ID, CARTON_WASTE_ID);
  SELECT COUNT(*) INTO plastico_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id IN (PET_WASTE_ID, OTROS_PLASTIC_ID);
  SELECT COUNT(DISTINCT bin_type_id) INTO unique_bins FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(*) INTO bin_plastico FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND bin_type_id = PLASTIC_BIN_ID;
  SELECT COUNT(*) INTO bin_raee FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND bin_type_id = RAEE_BIN_ID;
  SELECT COUNT(*) INTO bin_pilas FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND bin_type_id = PILAS_BIN_ID;
  SELECT COUNT(DISTINCT recycling_point_id) INTO unique_points FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(*) INTO point_bib FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND recycling_point_id = BIBLIOTECA_POINT_ID;
  SELECT COUNT(*) INTO overridden_count FROM public.recycling_sessions WHERE user_id = p_user_id AND waste_type_overridden = true AND outcome = 'confirmed';
  SELECT COUNT(*) INTO manual_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND detection_type = 'manual';
  SELECT COUNT(*) INTO friend_count FROM public.friendships WHERE (requester_id = p_user_id OR addressee_id = p_user_id) AND status = 'accepted' AND is_active = true;

  IF recycling_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'first_recycling' AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'first_recycling' AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.streak_days >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'streak_days' AND ach.condition_value = 7 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'streak_days' AND a.condition_value = 7 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.streak_days >= 30 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'streak_days' AND ach.condition_value = 30 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'streak_days' AND a.condition_value = 30 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.best_streak_days >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'best_streak_days' AND ach.condition_value = 7 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'best_streak_days' AND a.condition_value = 7 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.best_streak_days >= 30 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'best_streak_days' AND ach.condition_value = 30 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'best_streak_days' AND a.condition_value = 30 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'total_recycling_count' AND ach.condition_value = 10 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 100 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'total_recycling_count' AND ach.condition_value = 100 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 100 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 500 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'total_recycling_count' AND ach.condition_value = 500 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 500 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_waste >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'unique_waste_types' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_waste_types' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF pilas_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_pilas_count' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_pilas_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF raee_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_raee_count' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_raee_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF vidrio_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_vidrio_count' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_vidrio_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF paper_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_paper_count' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_paper_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF plastico_count >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_plastico_count' AND ach.condition_value = 10 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_plastico_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_bins >= 4 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'unique_bin_types' AND ach.condition_value = 4 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_bin_types' AND a.condition_value = 4 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_plastico >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'bin_type_plastico_count' AND ach.condition_value = 10 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_plastico_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_raee >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'bin_type_raee_count' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_raee_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_pilas >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'bin_type_pilas_count' AND ach.condition_value = 1 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_pilas_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_points >= 2 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'unique_recycling_points' AND ach.condition_value = 2 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_recycling_points' AND a.condition_value = 2 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_points >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'unique_recycling_points' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_recycling_points' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF point_bib >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'recycling_point_biblioteca_count' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'recycling_point_biblioteca_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF overridden_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_overridden_count' AND ach.condition_value = 1 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_overridden_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF manual_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'manual_detection_count' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'manual_detection_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF friend_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'friend_count' AND ach.condition_value = 1 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'friend_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF friend_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'friend_count' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'friend_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  RETURN;
END;
$$;
