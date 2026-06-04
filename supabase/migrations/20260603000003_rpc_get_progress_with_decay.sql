-- RPC que aplica el decay acumulado de días perdidos y retorna el progreso actualizado.
-- Se llama desde el cliente al abrir la app — no requiere pg_cron.
CREATE OR REPLACE FUNCTION public.get_progress_with_decay(p_user_id uuid)
RETURNS TABLE (
  streak_days int,
  heat        int,
  level       int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec              public.user_progress%ROWTYPE;
  days_missed      int := 0;
  effective_heat   int;
  effective_streak int;
BEGIN
  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 50, 1;
    RETURN;
  END IF;

  -- Cuántos días completos sin reciclar (excluye hoy)
  IF rec.last_recycling_date IS NOT NULL THEN
    days_missed := GREATEST(0, (CURRENT_DATE - rec.last_recycling_date) - 1);
  END IF;

  effective_heat   := COALESCE(rec.heat, 50)::int;
  effective_streak := COALESCE(rec.streak_days, 0);

  -- Solo aplicar decay si hay racha activa Y no se aplicó ya hoy
  IF effective_streak > 0 AND days_missed > 0 AND rec.updated_at::date < CURRENT_DATE THEN
    effective_heat := effective_heat - (30 * days_missed);

    IF effective_heat <= 0 THEN
      -- Racha muerta: streak reset, heat reset, level queda
      effective_heat   := 50;
      effective_streak := 0;
    END IF;

    UPDATE public.user_progress
    SET
      heat        = effective_heat,
      streak_days = effective_streak,
      updated_at  = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN QUERY SELECT effective_streak, effective_heat, COALESCE(rec.level, 1);
END;
$$;
