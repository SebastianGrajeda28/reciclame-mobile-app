-- Dev helper: directly set streak_days and heat for the calling user.
-- Scoped strictly to auth.uid().

CREATE OR REPLACE FUNCTION public.dev_set_streak(p_streak_days int, p_heat int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_progress
     SET streak_days      = GREATEST(0, p_streak_days),
         best_streak_days = GREATEST(best_streak_days, GREATEST(0, p_streak_days)),
         heat             = LEAST(100, GREATEST(0, p_heat))
   WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_progress_row');
  END IF;

  RETURN jsonb_build_object('ok', true, 'streak_days', GREATEST(0, p_streak_days), 'heat', LEAST(100, GREATEST(0, p_heat)));
END;
$$;
