-- Ciclo de vida de racha (#176/#177) — parte 3: reset "a cero, conserva nivel" + expiración.
--
-- Decisiones:
--  - Al morir la racha (heat <= 0): streak_days = 0, level se MANTIENE, heat = 50.
--    (Antes volvía al checkpoint del nivel; streak_level_checkpoint queda en desuso.)
--  - get_progress_with_decay ahora también devuelve:
--      * streak_expires_at: instante (local Lima) en que la racha morirá si no se recicla.
--      * streak_just_expired: true si ESTA llamada detectó la muerte (alimenta el aviso #177
--        y el evento de expiración #176).
--  - Todo en hora local (America/Lima) vía public.app_today().
--
-- Modelo del deadline: con decay de 30/día, partiendo de la fecha de hoy local y el calor
-- efectivo, la racha sobrevive ceil(heat/30) días más. La fórmula es estable día a día
-- (al avanzar el día, el calor baja 30 y el deadline no se mueve hasta que se recicla).

-- ── Decay diario (pg_cron): reset a cero, conserva nivel ────────────────────────────────
CREATE OR REPLACE FUNCTION public.apply_daily_heat_decay()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_progress
  SET
    heat        = CASE WHEN heat - 30 <= 0 THEN 50 ELSE heat - 30 END,
    streak_days = CASE WHEN heat - 30 <= 0 THEN 0  ELSE streak_days END,
    updated_at  = now()
  WHERE
    is_active = true
    AND streak_days > 0
    AND (last_recycling_date IS NULL OR last_recycling_date < public.app_today());
END;
$$;

-- ── RPC al abrir la app: aplica decay acumulado + expira + devuelve deadline ─────────────
DROP FUNCTION IF EXISTS public.get_progress_with_decay(uuid);

CREATE FUNCTION public.get_progress_with_decay(p_user_id uuid)
RETURNS TABLE (
  streak_days         int,
  heat                int,
  level               int,
  last_recycling_date date,
  streak_expires_at   timestamptz,
  streak_just_expired boolean
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
  just_expired     boolean := false;
  today            date := public.app_today();
  expires          timestamptz;
BEGIN
  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 1, NULL::date, NULL::timestamptz, false;
    RETURN;
  END IF;

  -- Días completos sin reciclar (excluye el día de reciclaje).
  IF rec.last_recycling_date IS NOT NULL THEN
    days_missed := GREATEST(0, (today - rec.last_recycling_date) - 1);
  END IF;

  effective_heat   := COALESCE(rec.heat, 50)::int;
  effective_streak := COALESCE(rec.streak_days, 0);

  -- Aplicar decay solo si hay racha activa y no se aplicó ya hoy.
  -- updated_at se compara en hora local (Lima), igual que 'today', para no descuadrar
  -- en la franja entre medianoche de Lima y de UTC.
  IF effective_streak > 0 AND days_missed > 0
     AND (rec.updated_at AT TIME ZONE 'America/Lima')::date < today THEN
    effective_heat := effective_heat - (30 * days_missed);

    IF effective_heat <= 0 THEN
      -- Racha muerta: a cero, conserva nivel, calor reset.
      effective_heat   := 50;
      effective_streak := 0;
      just_expired     := true;
    END IF;

    UPDATE public.user_progress
    SET
      heat        = effective_heat,
      streak_days = effective_streak,
      updated_at  = now()
    WHERE user_id = p_user_id;
  END IF;

  -- Deadline: local-midnight(today + ceil(heat/30)) mientras la racha siga viva.
  IF effective_streak > 0 THEN
    expires := ((today + CEIL(effective_heat / 30.0)::int)::timestamp)
                 AT TIME ZONE 'America/Lima';
  ELSE
    expires := NULL;
  END IF;

  RETURN QUERY SELECT
    effective_streak,
    effective_heat,
    COALESCE(rec.level, 1),
    rec.last_recycling_date,
    expires,
    just_expired;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_progress_with_decay(uuid) TO authenticated;
