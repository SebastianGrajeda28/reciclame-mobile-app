-- dev_reset_progress: full wipe of user_progress and user_achievements for auth.uid().
-- Use from dev panel to return to a clean slate as if the user just registered.
CREATE OR REPLACE FUNCTION public.dev_reset_progress()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  DELETE FROM public.recycling_records WHERE user_id = v_user_id;
  DELETE FROM public.user_achievements  WHERE user_id = v_user_id;

  UPDATE public.user_progress
     SET streak_days         = 0,
         best_streak_days    = 0,
         heat                = 0,
         level               = 1,
         points              = 0,
         last_recycling_date = NULL,
         updated_at          = now()
   WHERE user_id = v_user_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.dev_reset_progress() TO authenticated;
