-- Fix dev_set_streak: also update level using compute_streak_level so the
-- profile card reflects the correct level immediately after applying.

CREATE OR REPLACE FUNCTION public.dev_set_streak(p_streak_days int, p_heat int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_level int;
BEGIN
  v_new_level := public.compute_streak_level(GREATEST(0, p_streak_days));

  UPDATE public.user_progress
     SET streak_days      = GREATEST(0, p_streak_days),
         best_streak_days = GREATEST(best_streak_days, GREATEST(0, p_streak_days)),
         heat             = LEAST(100, GREATEST(0, p_heat)),
         level            = GREATEST(level, v_new_level)
   WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_progress_row');
  END IF;

  RETURN jsonb_build_object(
    'ok',          true,
    'streak_days', GREATEST(0, p_streak_days),
    'heat',        LEAST(100, GREATEST(0, p_heat)),
    'level',       v_new_level
  );
END;
$$;
