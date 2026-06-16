-- Ciclo de vida de racha (#175/#176/#177) — parte 1: frontera de día local + piso de nivel.
--
-- Cambios:
--  1. Helper public.app_today(): "hoy" en hora local (America/Lima). Antes se usaba
--     CURRENT_DATE (UTC), que rompe el día de racha a las 19:00 de Perú.
--  2. handle_post_segregation_progress(): usa app_today() y el nivel NUNCA baja
--     (GREATEST), requisito del reset "a cero, conserva nivel" (#177): si no, tras un
--     reset a 0 la siguiente segregación recalcularía el nivel a 1.

CREATE OR REPLACE FUNCTION public.app_today()
RETURNS date
LANGUAGE sql
STABLE
AS $$
  SELECT (now() AT TIME ZONE 'America/Lima')::date;
$$;

CREATE OR REPLACE FUNCTION public.handle_post_segregation_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  progress_record public.user_progress%ROWTYPE;
  is_first_action_today boolean := false;
  new_streak int;
  new_heat numeric;
  new_level int;
  heat_gain int;
  today date := public.app_today();
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

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;

      heat_gain := public.heat_gain_for_level(COALESCE(progress_record.level, 1));
      new_heat  := LEAST(100, COALESCE(progress_record.heat, 50) + heat_gain);

      -- El nivel nunca baja: queda el mayor entre el actual y el que toca por días.
      new_level := GREATEST(
        COALESCE(progress_record.level, 1),
        public.compute_streak_level(new_streak)
      );
    ELSE
      new_streak := COALESCE(progress_record.streak_days, 0);
      new_heat   := COALESCE(progress_record.heat, 50);
      new_level  := COALESCE(progress_record.level, 1);
    END IF;

    UPDATE public.user_progress
    SET
      streak_days         = new_streak,
      heat                = new_heat,
      level               = new_level,
      last_recycling_date = today,
      updated_at          = now()
    WHERE user_id = NEW.user_id;

  ELSE

    INSERT INTO public.user_progress (
      user_id, points, streak_days, heat, level, last_recycling_date
    ) VALUES (
      NEW.user_id, 0, 1, 51, 1, today
    );

  END IF;

  RETURN NEW;
END;
$$;
