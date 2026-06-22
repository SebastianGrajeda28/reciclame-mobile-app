-- dev_seed_streak: simulate N consecutive recycling days for the calling user
-- by inserting real recycling_records spaced 1 day apart, letting the real
-- trigger (handle_post_segregation_progress) calculate streak/heat/level/achievements.
--
-- Steps:
--   1. Delete all existing recycling_records for auth.uid()
--   2. Reset user_progress to baseline
--   3. Insert p_days records with created_at = (today - p_days + i) for i in 1..p_days
--      so the last record lands on yesterday, leaving today free for the user.
--
-- The trigger fires on each INSERT, so the final state matches exactly what the
-- real user flow would produce after p_days consecutive recycling days.

CREATE OR REPLACE FUNCTION public.dev_seed_streak(p_days int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id        uuid := auth.uid();
  v_waste_type_id  uuid;
  v_bin_type_id    uuid;
  v_point_id       uuid;
  v_day            date;
  i                int;
BEGIN
  IF p_days < 0 OR p_days > 365 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'p_days must be between 0 and 365');
  END IF;

  -- Pick any active waste type, bin type, and recycling point
  SELECT id INTO v_waste_type_id FROM public.waste_types LIMIT 1;
  SELECT id INTO v_bin_type_id   FROM public.bin_types   LIMIT 1;
  SELECT id INTO v_point_id      FROM public.recycling_points WHERE is_active = true LIMIT 1;

  IF v_waste_type_id IS NULL OR v_bin_type_id IS NULL OR v_point_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'missing_reference_data');
  END IF;

  -- 1. Wipe existing records for this user
  DELETE FROM public.recycling_records WHERE user_id = v_user_id;

  -- 2. Reset progress so trigger starts from a clean slate
  UPDATE public.user_progress
     SET streak_days         = 0,
         heat                = 0,
         level               = 1,
         best_streak_days    = 0,
         last_recycling_date = NULL,
         updated_at          = now()
   WHERE user_id = v_user_id;

  -- If no progress row exists yet, create one
  INSERT INTO public.user_progress (user_id, points, streak_days, heat, level, best_streak_days)
  SELECT v_user_id, 0, 0, 0, 1, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.user_progress WHERE user_id = v_user_id);

  IF p_days = 0 THEN
    RETURN jsonb_build_object('ok', true, 'streak_days', 0, 'message', 'progress reset to zero');
  END IF;

  -- 3. Insert one record per day, oldest first so trigger accumulates correctly.
  --    Records land on (today - p_days) through (today - 1), leaving today free.
  FOR i IN 1..p_days LOOP
    v_day := public.app_today() - (p_days - i + 1);

    INSERT INTO public.recycling_records (
      user_id, waste_type_id, bin_type_id, recycling_point_id,
      detection_type, status, created_at
    ) VALUES (
      v_user_id, v_waste_type_id, v_bin_type_id, v_point_id,
      'manual', 'confirmed', v_day::timestamptz
    );
  END LOOP;

  -- Return the resulting progress
  RETURN (
    SELECT jsonb_build_object(
      'ok',          true,
      'streak_days', streak_days,
      'heat',        heat,
      'level',       level
    )
    FROM public.user_progress
    WHERE user_id = v_user_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.dev_seed_streak(int) TO authenticated;
