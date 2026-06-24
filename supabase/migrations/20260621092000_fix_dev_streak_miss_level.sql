-- Fix dev_streak_miss: do not reset level when streak dies.
-- Level is a permanent achievement — apply_daily_heat_decay never touches it.

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
    CASE WHEN heat - 30 <= 0 THEN 50  ELSE heat - 30   END,
    CASE WHEN heat - 30 <= 0 THEN 0   ELSE streak_days  END,
    CASE WHEN heat - 30 <= 0 THEN true ELSE false        END
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
