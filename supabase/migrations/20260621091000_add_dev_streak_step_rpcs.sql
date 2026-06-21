-- Dev-only RPCs for stepping through streak states one day at a time.
-- All SECURITY DEFINER, scoped to auth.uid().

-- dev_streak_advance: Simulate one more day of recycling for the calling user.
-- Inserts a recycling_record dated yesterday (or the day after the last record,
-- whichever is earlier) so the trigger recalculates streak/heat/level naturally.
-- Returns the resulting progress row.
CREATE OR REPLACE FUNCTION public.dev_streak_advance()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       uuid := auth.uid();
  v_waste_type_id uuid;
  v_bin_type_id   uuid;
  v_point_id      uuid;
  v_last_date     date;
  v_insert_date   date;
  v_record_id     uuid;
BEGIN
  SELECT MAX(created_at::date) INTO v_last_date
  FROM public.recycling_records
  WHERE user_id = v_user_id AND status = 'confirmed';

  -- Place the new record on the day after the last one, but never in the future.
  -- If no records exist, use yesterday so today is still free for a real recycle.
  v_insert_date := LEAST(
    COALESCE(v_last_date + 1, public.app_today() - 1),
    public.app_today() - 1
  );

  SELECT id INTO v_waste_type_id FROM public.waste_types ORDER BY random() LIMIT 1;
  SELECT id INTO v_bin_type_id   FROM public.bin_types   ORDER BY random() LIMIT 1;
  SELECT id INTO v_point_id      FROM public.recycling_points WHERE is_active = true ORDER BY random() LIMIT 1;

  IF v_waste_type_id IS NULL OR v_bin_type_id IS NULL OR v_point_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'missing_reference_data');
  END IF;

  INSERT INTO public.recycling_records (
    user_id, waste_type_id, bin_type_id, recycling_point_id,
    detection_type, status, created_at
  ) VALUES (
    v_user_id, v_waste_type_id, v_bin_type_id, v_point_id,
    'manual', 'confirmed', v_insert_date::timestamptz
  )
  RETURNING id INTO v_record_id;

  RETURN (
    SELECT jsonb_build_object(
      'ok',          true,
      'record_id',   v_record_id,
      'record_date', v_insert_date,
      'streak_days', streak_days,
      'heat',        heat,
      'level',       level
    )
    FROM public.user_progress
    WHERE user_id = v_user_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.dev_streak_advance() TO authenticated;

-- dev_streak_miss: Simulate one missed day by applying a single heat decay tick
-- for the calling user — the same logic apply_daily_heat_decay() uses globally.
-- If heat - 30 <= 0 the streak dies (streak_days = 0, heat reset to 50).
-- Returns the resulting progress values.
CREATE OR REPLACE FUNCTION public.dev_streak_miss()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    uuid := auth.uid();
  v_new_heat   int;
  v_new_streak int;
  v_new_level  int := 1;
  v_died       boolean := false;
BEGIN
  SELECT
    CASE WHEN heat - 30 <= 0 THEN 50   ELSE heat - 30      END,
    CASE WHEN heat - 30 <= 0 THEN 0    ELSE streak_days     END,
    CASE WHEN heat - 30 <= 0 THEN true ELSE false            END
  INTO v_new_heat, v_new_streak, v_died
  FROM public.user_progress
  WHERE user_id = v_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_progress_row');
  END IF;

  UPDATE public.user_progress
     SET heat        = v_new_heat,
         streak_days = v_new_streak,
         updated_at  = now()
   WHERE user_id = v_user_id;

  SELECT level INTO v_new_level FROM public.user_progress WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'ok',          true,
    'streak_died', v_died,
    'streak_days', v_new_streak,
    'heat',        v_new_heat,
    'level',       v_new_level
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.dev_streak_miss() TO authenticated;
