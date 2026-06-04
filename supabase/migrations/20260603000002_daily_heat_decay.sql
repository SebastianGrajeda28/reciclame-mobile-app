-- Función de decay diario de calor.
-- Se ejecuta una vez por día vía pg_cron o Supabase Edge Function scheduler.
-- Decay fijo: -30 por día sin reciclar.
-- Si heat llega a 0: streak_days = 0, heat = 50, level se mantiene.
CREATE OR REPLACE FUNCTION public.apply_daily_heat_decay()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Aplica decay solo a usuarios que no reciclaron hoy
  UPDATE public.user_progress
  SET
    heat        = CASE
                    WHEN heat - 30 <= 0 THEN 50
                    ELSE heat - 30
                  END,
    streak_days = CASE
                    WHEN heat - 30 <= 0 THEN 0
                    ELSE streak_days
                  END,
    updated_at  = now()
  WHERE
    is_active = true
    AND streak_days > 0
    AND (last_recycling_date IS NULL OR last_recycling_date < CURRENT_DATE);
END;
$$;

-- Para activar el decay diario automático, ejecutar en Supabase Dashboard → SQL Editor:
--
--   SELECT cron.schedule(
--     'daily-heat-decay',
--     '0 3 * * *',
--     $$SELECT public.apply_daily_heat_decay()$$
--   );
--
-- Requiere extensión pg_cron habilitada en el proyecto de Supabase.
