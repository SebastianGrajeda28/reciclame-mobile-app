-- Dev helper: remove a specific achievement from the calling user.
-- Scoped strictly to auth.uid() — a user can only revoke their own achievements.

CREATE OR REPLACE FUNCTION public.dev_revoke_achievement(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_achievement_id uuid;
  v_deleted        int;
BEGIN
  SELECT id INTO v_achievement_id
    FROM public.achievements
   WHERE slug = p_slug
   LIMIT 1;

  IF v_achievement_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'achievement_not_found');
  END IF;

  DELETE FROM public.user_achievements
   WHERE user_id = auth.uid()
     AND achievement_id = v_achievement_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_owned');
  END IF;

  RETURN jsonb_build_object('ok', true, 'slug', p_slug);
END;
$$;
