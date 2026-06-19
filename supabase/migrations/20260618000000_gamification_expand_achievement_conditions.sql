-- Expand check_and_unlock_achievements with 16 new condition types:
--   bin type, waste type, location diversity, social, and behavioral conditions.
-- Also seeds 25 achievements and restores the PERFORM call in the progress trigger.

CREATE OR REPLACE FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") RETURNS TABLE("achievement_id" "uuid", "achievement_name" "text", "reward_id" "uuid")
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
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'first_recycling' AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'first_recycling' AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.streak_days >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'streak_days' AND condition_value = 7 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'streak_days' AND a.condition_value = 7 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.streak_days >= 30 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'streak_days' AND condition_value = 30 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'streak_days' AND a.condition_value = 30 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.best_streak_days >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'best_streak_days' AND condition_value = 7 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'best_streak_days' AND a.condition_value = 7 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.best_streak_days >= 30 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'best_streak_days' AND condition_value = 30 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'best_streak_days' AND a.condition_value = 30 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'total_recycling_count' AND condition_value = 10 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 100 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'total_recycling_count' AND condition_value = 100 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 100 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 500 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'total_recycling_count' AND condition_value = 500 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 500 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_waste >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'unique_waste_types' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_waste_types' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF pilas_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_pilas_count' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_pilas_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF raee_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_raee_count' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_raee_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF vidrio_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_vidrio_count' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_vidrio_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF paper_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_paper_count' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_paper_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF plastico_count >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_plastico_count' AND condition_value = 10 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_plastico_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_bins >= 4 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'unique_bin_types' AND condition_value = 4 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_bin_types' AND a.condition_value = 4 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_plastico >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'bin_type_plastico_count' AND condition_value = 10 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_plastico_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_raee >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'bin_type_raee_count' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_raee_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_pilas >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'bin_type_pilas_count' AND condition_value = 1 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_pilas_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_points >= 2 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'unique_recycling_points' AND condition_value = 2 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_recycling_points' AND a.condition_value = 2 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_points >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'unique_recycling_points' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_recycling_points' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF point_bib >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'recycling_point_biblioteca_count' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'recycling_point_biblioteca_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF overridden_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_overridden_count' AND condition_value = 1 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_overridden_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF manual_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'manual_detection_count' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'manual_detection_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF friend_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'friend_count' AND condition_value = 1 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'friend_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF friend_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'friend_count' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'friend_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  RETURN;
END;
$$;

-- Restore PERFORM call dropped in 20260616231435
CREATE OR REPLACE FUNCTION "public"."handle_post_segregation_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  progress_record public.user_progress%ROWTYPE;
  is_first_action_today boolean := false;
  new_streak int;
  new_heat   numeric;
  new_level  int;
  heat_gain  int;
  today      date := public.app_today();
BEGIN
  SELECT * INTO progress_record
  FROM public.user_progress
  WHERE user_id = NEW.user_id
  FOR UPDATE;

  IF FOUND THEN
    IF progress_record.last_recycling_date IS NULL
       OR progress_record.last_recycling_date < today THEN
      is_first_action_today := true;
    END IF;

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;
      heat_gain  := public.heat_gain_for_level(COALESCE(progress_record.level, 1));
      new_heat   := LEAST(100, COALESCE(progress_record.heat, 50) + heat_gain);
      new_level  := GREATEST(
        COALESCE(progress_record.level, 1),
        public.compute_streak_level(new_streak)
      );
    ELSE
      new_streak := COALESCE(progress_record.streak_days, 0);
      new_heat   := COALESCE(progress_record.heat, 50);
      new_level  := COALESCE(progress_record.level, 1);
    END IF;

    UPDATE public.user_progress
    SET
      streak_days      = new_streak,
      heat             = new_heat,
      level            = new_level,
      best_streak_days = GREATEST(COALESCE(best_streak_days, 0), new_streak),
      last_recycling_date = today,
      updated_at       = now()
    WHERE user_id = NEW.user_id;

  ELSE

    INSERT INTO public.user_progress (
      user_id, points, streak_days, heat, level, best_streak_days, last_recycling_date
    ) VALUES (
      NEW.user_id, 0, 1, 51, 1, 1, today
    );

  END IF;

  PERFORM public.check_and_unlock_achievements(NEW.user_id);

  RETURN NEW;
END;
$$;

GRANT ALL ON FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") TO "service_role";

-- Seed 25 achievements
INSERT INTO public.achievements (name, description, condition_type, condition_value, is_active)
VALUES
  ('Primer paso',          'Completaste tu primer reciclaje exitoso.',                           'first_recycling',                    0,   true),
  ('Semana verde',         'Reciclaste durante 7 días consecutivos.',                            'streak_days',                        7,   true),
  ('Mes eco',              'Reciclaste durante 30 días consecutivos.',                           'streak_days',                        30,  true),
  ('Decena',               'Reciclaste 10 artículos en total.',                                  'total_recycling_count',              10,  true),
  ('Centurión',            'Reciclaste 100 artículos en total.',                                 'total_recycling_count',              100, true),
  ('Leyenda',              'Reciclaste 500 artículos en total.',                                 'total_recycling_count',              500, true),
  ('Cazador de pilas',     'Depositaste pilas en el contenedor correcto 3 veces.',               'waste_type_pilas_count',             3,   true),
  ('Especialista RAEE',    'Depositaste residuos electrónicos (RAEE) 3 veces.',                  'waste_type_raee_count',              3,   true),
  ('Vidriero',             'Reciclaste vidrio 5 veces.',                                         'waste_type_vidrio_count',            5,   true),
  ('Papelero',             'Reciclaste papel o cartón 5 veces.',                                 'waste_type_paper_count',             5,   true),
  ('Plástico cero',        'Reciclaste plásticos 10 veces.',                                     'waste_type_plastico_count',          10,  true),
  ('Todo el espectro',     'Reciclaste al menos 5 tipos diferentes de residuos.',                'unique_waste_types',                 5,   true),
  ('Polímero pro',         'Usaste el contenedor de plásticos 10 veces.',                        'bin_type_plastico_count',            10,  true),
  ('El separador',         'Usaste al menos 4 tipos distintos de contenedores.',                 'unique_bin_types',                   4,   true),
  ('Responsable',          'Depositaste correctamente un residuo peligroso.',                    'bin_type_pilas_count',               1,   true),
  ('Ingeniero electrónico','Depositaste residuos en el contenedor RAEE 3 veces.',                'bin_type_raee_count',                3,   true),
  ('Explorador',           'Reciclaste en al menos 2 puntos del campus.',                        'unique_recycling_points',            2,   true),
  ('Nómade verde',         'Reciclaste en todos los puntos de reciclaje del campus.',            'unique_recycling_points',            3,   true),
  ('Bibliófilo',           'Reciclaste 5 veces en la Biblioteca Central.',                       'recycling_point_biblioteca_count',   5,   true),
  ('Racha perfecta',       'Alcanzaste una racha de 7 días en algún momento.',                   'best_streak_days',                   7,   true),
  ('Constancia de hierro', 'Alcanzaste una racha de 30 días en algún momento.',                  'best_streak_days',                   30,  true),
  ('Corrector',            'Corregiste la clasificación automática al menos una vez.',           'waste_type_overridden_count',        1,   true),
  ('Meticuloso',           'Registraste 5 reciclajes en modo manual.',                           'manual_detection_count',             5,   true),
  ('Amigo reciclador',     'Agregaste a tu primer amigo en la app.',                             'friend_count',                       1,   true),
  ('Red verde',            'Tienes al menos 3 amigos en la app.',                                'friend_count',                       3,   true)
ON CONFLICT DO NOTHING;
