-- Función auxiliar: calcula el nivel de racha basado en streak_days.
-- Progresión exponencial: 3, 6, 12, 24, 48, 96 días por nivel.
-- El nivel nunca baja — solo se actualiza si es mayor al actual.
CREATE OR REPLACE FUNCTION public.compute_streak_level(p_streak_days int)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_streak_days >= 189 THEN RETURN 7;
  ELSIF p_streak_days >= 93  THEN RETURN 6;
  ELSIF p_streak_days >= 45  THEN RETURN 5;
  ELSIF p_streak_days >= 21  THEN RETURN 4;
  ELSIF p_streak_days >= 9   THEN RETURN 3;
  ELSIF p_streak_days >= 3   THEN RETURN 2;
  ELSE RETURN 1;
  END IF;
END;
$$;

-- Función auxiliar: retorna el checkpoint de streak_days para un nivel dado.
-- Al morir la racha, streak_days se resetea al inicio del nivel actual.
-- El nivel nunca baja — solo streak_days vuelve al umbral de entrada del nivel.
CREATE OR REPLACE FUNCTION public.streak_level_checkpoint(p_level int)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE p_level
    WHEN 7 THEN RETURN 189;
    WHEN 6 THEN RETURN 93;
    WHEN 5 THEN RETURN 45;
    WHEN 4 THEN RETURN 21;
    WHEN 3 THEN RETURN 9;
    WHEN 2 THEN RETURN 3;
    ELSE        RETURN 0;
  END CASE;
END;
$$;

-- Función auxiliar: calcula el gain de calor basado en el nivel.
-- Gain = cumsum(nivel) = nivel*(nivel+1)/2
CREATE OR REPLACE FUNCTION public.heat_gain_for_level(p_level int)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN (p_level * (p_level + 1)) / 2;
END;
$$;

-- Actualiza el trigger de post-segregación con la nueva lógica de heat y nivel.
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
BEGIN

  SELECT * INTO progress_record
  FROM public.user_progress
  WHERE user_id = NEW.user_id
  FOR UPDATE;

  IF FOUND THEN

    IF progress_record.last_recycling_date IS NULL
       OR progress_record.last_recycling_date < CURRENT_DATE THEN
      is_first_action_today := true;
    END IF;

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;

      heat_gain := public.heat_gain_for_level(COALESCE(progress_record.level, 1));
      new_heat  := LEAST(100, COALESCE(progress_record.heat, 50) + heat_gain);

      new_level := public.compute_streak_level(new_streak);
    ELSE
      new_streak := COALESCE(progress_record.streak_days, 0);
      new_heat   := COALESCE(progress_record.heat, 50);
      new_level  := COALESCE(progress_record.level, 1);
    END IF;

    UPDATE public.user_progress
    SET
      streak_days        = new_streak,
      heat               = new_heat,
      level              = new_level,
      last_recycling_date = CURRENT_DATE,
      updated_at         = now()
    WHERE user_id = NEW.user_id;

  ELSE

    INSERT INTO public.user_progress (
      user_id, points, streak_days, heat, level, last_recycling_date
    ) VALUES (
      NEW.user_id, 0, 1, 51, 1, CURRENT_DATE
    );

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_recycling_record_created ON public.recycling_records;

CREATE TRIGGER on_recycling_record_created
AFTER INSERT ON public.recycling_records
FOR EACH ROW
EXECUTE FUNCTION public.handle_post_segregation_progress();
