CREATE OR REPLACE FUNCTION public.get_achievement_unlock_stats()
RETURNS TABLE (
  achievement_id uuid,
  slug text,
  unlocked_users bigint,
  total_users bigint,
  user_percentage numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH active_users AS (
    SELECT u.id
    FROM public.users u
    WHERE u.is_active = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = u.id
          AND ur.is_active = true
      )
  ),
  totals AS (
    SELECT COUNT(*)::bigint AS total_users
    FROM active_users
  )
  SELECT
    a.id AS achievement_id,
    a.slug,
    COUNT(DISTINCT ua.user_id)::bigint AS unlocked_users,
    totals.total_users,
    ROUND(
      COUNT(DISTINCT ua.user_id)::numeric * 100
      / NULLIF(totals.total_users, 0),
      2
    ) AS user_percentage
  FROM public.achievements a
  CROSS JOIN totals
  LEFT JOIN public.user_achievements ua
    ON ua.achievement_id = a.id
   AND ua.is_active = true
  LEFT JOIN active_users au
    ON au.id = ua.user_id
  WHERE a.is_active = true
    AND a.slug IS NOT NULL
    AND (ua.user_id IS NULL OR au.id IS NOT NULL)
  GROUP BY a.id, a.slug, totals.total_users;
$$;

GRANT EXECUTE ON FUNCTION public.get_achievement_unlock_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_achievement_unlock_stats() TO service_role;
