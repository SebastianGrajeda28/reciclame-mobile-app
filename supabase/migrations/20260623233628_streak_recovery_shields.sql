-- Recuperación de racha (#256-259 / RF-051..054). Léxico: "recuperar" / "escudo".
-- Se aplica sobre develop: conserva sus fixes (#176/#177/#260: app_today, streak->0 al morir,
-- streak_expires_at/streak_just_expired) y añade columnas, sellado, ganancia de escudos y el RPC.

-- B1 — columnas (idempotente).
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS recoveries integer NOT NULL DEFAULT 0;
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS streak_expired_at timestamp with time zone;
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS streak_days_at_death integer;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_recoveries_check') THEN
    ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_recoveries_check CHECK (recoveries >= 0);
  END IF;
END
$$;

-- B5 (cron) — sella la muerte sobre la base de develop (streak_days -> 0, app_today()).
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
    -- Recuperación: al morir con escudo, sella la ventana de 48h + días reales (idempotente).
    streak_expired_at = CASE
                          WHEN heat - 30 <= 0 AND recoveries > 0 AND streak_expired_at IS NULL THEN now()
                          ELSE streak_expired_at
                        END,
    streak_days_at_death = CASE
                             WHEN heat - 30 <= 0 AND recoveries > 0 AND streak_expired_at IS NULL THEN streak_days
                             ELSE streak_days_at_death
                           END,
    updated_at  = now()
  WHERE
    is_active = true
    AND streak_days > 0
    AND (last_recycling_date IS NULL OR last_recycling_date < public.app_today());
END;
$$;

-- B2 — get_progress_with_decay: develop (expires/just_expired) + recuperación (recoveries/recoverable_until).
-- DROP previo: cambia el tipo de retorno (CREATE OR REPLACE no puede).
DROP FUNCTION IF EXISTS public.get_progress_with_decay(uuid);
CREATE OR REPLACE FUNCTION public.get_progress_with_decay(p_user_id uuid)
RETURNS TABLE (
  streak_days         int,
  heat                int,
  level               int,
  last_recycling_date date,
  streak_expires_at   timestamptz,
  streak_just_expired boolean,
  recoveries          int,
  recoverable_until   timestamptz,
  streak_days_lost    int
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
  out_expired_at        timestamptz;
  out_recoverable_until timestamptz;
  lost_days             int;
BEGIN
  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 1, NULL::date, NULL::timestamptz, false, 0, NULL::timestamptz, NULL::int;
    RETURN;
  END IF;

  out_expired_at := rec.streak_expired_at;

  IF rec.last_recycling_date IS NOT NULL THEN
    days_missed := GREATEST(0, (today - rec.last_recycling_date) - 1);
  END IF;

  effective_heat   := COALESCE(rec.heat, 50)::int;
  effective_streak := COALESCE(rec.streak_days, 0);

  IF effective_streak > 0 AND days_missed > 0
     AND (rec.updated_at AT TIME ZONE 'America/Lima')::date < today THEN
    effective_heat := effective_heat - (30 * days_missed);

    IF effective_heat <= 0 THEN
      effective_heat   := 50;
      effective_streak := 0;
      just_expired     := true;
      -- Recuperación: al morir con escudo, abre la ventana de 48h (idempotente).
      IF COALESCE(rec.recoveries, 0) > 0 AND rec.streak_expired_at IS NULL THEN
        out_expired_at := now();
      END IF;
    END IF;

    UPDATE public.user_progress
    SET
      heat        = effective_heat,
      streak_days = effective_streak,
      -- Recuperación: sella días reales pre-muerte + marca temporal (idempotente).
      streak_days_at_death = CASE
                               WHEN just_expired AND COALESCE(rec.recoveries, 0) > 0 AND rec.streak_expired_at IS NULL
                                 THEN COALESCE(rec.streak_days, 0)
                               ELSE streak_days_at_death
                             END,
      streak_expired_at    = out_expired_at,
      updated_at  = now()
    WHERE user_id = p_user_id;
  END IF;

  IF effective_streak > 0 THEN
    expires := ((today + CEIL(effective_heat / 30.0)::int)::timestamp)
                 AT TIME ZONE 'America/Lima';
  ELSE
    expires := NULL;
  END IF;

  -- Recuperación: oferta abierta solo con escudo y dentro de la ventana de 48h.
  IF out_expired_at IS NOT NULL
     AND COALESCE(rec.recoveries, 0) > 0
     AND now() < out_expired_at + interval '48 hours' THEN
    out_recoverable_until := out_expired_at + interval '48 hours';
  ELSE
    out_recoverable_until := NULL;
  END IF;

  -- Días reales perdidos (para que la oferta muestre los días correctos, no 0): si murió en esta
  -- lectura, los pre-muerte; si ya estaba sellada, los guardados en streak_days_at_death.
  lost_days := COALESCE(rec.streak_days_at_death,
                        CASE WHEN just_expired THEN COALESCE(rec.streak_days, 0) ELSE NULL END);

  RETURN QUERY SELECT
    effective_streak,
    effective_heat,
    COALESCE(rec.level, 1),
    rec.last_recycling_date,
    expires,
    just_expired,
    COALESCE(rec.recoveries, 0),
    out_recoverable_until,
    lost_days;
END;
$$;

-- B3 — handle_post_segregation_progress: develop + ganancia de escudo (cap nivel-1, silencioso).
CREATE OR REPLACE FUNCTION public.handle_post_segregation_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  progress_record public.user_progress%ROWTYPE;
  is_first_action_today boolean := false;
  new_streak int;
  new_heat   numeric;
  new_level  int;
  heat_gain  int;
  raw_heat   numeric;
  new_recoveries int;
  today      date := public.app_today();
BEGIN
  SELECT * INTO progress_record
  FROM public.user_progress
  WHERE user_id = NEW.user_id
  FOR UPDATE;

  IF FOUND THEN
    IF progress_record.last_recycling_date IS NULL
       OR progress_record.last_recycling_date < today THEN
      is_first_action_today := true;
    END IF;

    new_recoveries := COALESCE(progress_record.recoveries, 0);

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;
      heat_gain  := public.heat_gain_for_level(COALESCE(progress_record.level, 1));
      raw_heat   := COALESCE(progress_record.heat, 50) + heat_gain;
      new_heat   := LEAST(100, raw_heat);
      new_level  := GREATEST(
        COALESCE(progress_record.level, 1),
        public.compute_streak_level(new_streak)
      );
      -- Recuperación: si el calor del día excede el tope, +1 escudo (cap nivel-1).
      IF raw_heat > 100 THEN
        new_recoveries := LEAST(GREATEST(0, new_level - 1), new_recoveries + 1);
      END IF;
    ELSE
      new_streak := COALESCE(progress_record.streak_days, 0);
      new_heat   := COALESCE(progress_record.heat, 50);
      new_level  := COALESCE(progress_record.level, 1);
    END IF;

    UPDATE public.user_progress
    SET
      streak_days      = new_streak,
      heat             = new_heat,
      level            = new_level,
      recoveries       = new_recoveries,
      best_streak_days = GREATEST(COALESCE(best_streak_days, 0), new_streak),
      last_recycling_date = today,
      updated_at       = now()
    WHERE user_id = NEW.user_id;
  ELSE
    INSERT INTO public.user_progress (
      user_id, points, streak_days, heat, level, best_streak_days, last_recycling_date
    ) VALUES (
      NEW.user_id, 0, 1, 51, 1, 1, today
    );
  END IF;

  PERFORM public.check_and_unlock_achievements(NEW.user_id);

  RETURN NEW;
END;
$$;

-- B4 — RPC recover_streak: anti-IDOR (check explícito auth.uid()) + restauración honesta.
CREATE OR REPLACE FUNCTION public.recover_streak(p_user_id uuid)
RETURNS TABLE (success boolean, streak_days int, heat int, level int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  rec             public.user_progress%ROWTYPE;
  restored_streak int;
BEGIN
  -- P0 anti-IDOR: SECURITY DEFINER bypasa RLS; la autorización la da este check, no RLS (cf. #174).
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true
  FOR UPDATE;

  -- Validación server-side: escudo, racha muerta sellada y dentro de la ventana 48h. Si no, success=false.
  IF NOT FOUND
     OR COALESCE(rec.recoveries, 0) <= 0
     OR rec.streak_expired_at IS NULL
     OR now() >= rec.streak_expired_at + interval '48 hours' THEN
    RETURN QUERY SELECT false, COALESCE(rec.streak_days, 0), COALESCE(rec.heat, 0)::int, COALESCE(rec.level, 1);
    RETURN;
  END IF;

  -- Restaura los días reales sellados al morir (no el piso del nivel), conserva el nivel.
  restored_streak := COALESCE(rec.streak_days_at_death, public.streak_level_checkpoint(COALESCE(rec.level, 1)));

  UPDATE public.user_progress
  SET
    recoveries           = recoveries - 1,
    heat                 = 50,
    streak_days          = restored_streak,
    streak_expired_at    = NULL,
    streak_days_at_death = NULL,
    -- Arranca "fresca hoy": sin esto, get_progress volvería a matar la racha mañana por el hueco viejo.
    last_recycling_date  = public.app_today(),
    updated_at           = now()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, restored_streak, 50, COALESCE(rec.level, 1);
END;
$$;

REVOKE ALL ON FUNCTION public.recover_streak(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recover_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recover_streak(uuid) TO service_role;
