CREATE OR REPLACE FUNCTION public.handle_post_segregation_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  progress_record public.user_progress%ROWTYPE;
  is_first_action_today boolean := false;
  new_streak int := 1;
  new_heat numeric := 1;
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
      new_heat := COALESCE(progress_record.heat, 0) + 1;
    ELSE
      new_heat := COALESCE(progress_record.heat, 0);
    END IF;

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;
    ELSE
      new_streak := progress_record.streak_days;
    END IF;

    UPDATE public.user_progress
    SET
      streak_days = new_streak,
      heat = new_heat,
      last_recycling_date = CURRENT_DATE,
      updated_at = now()
    WHERE user_id = NEW.user_id;

  ELSE

    INSERT INTO public.user_progress (
      user_id,
      points,
      streak_days,
      heat,
      level,
      last_recycling_date
    )
    VALUES (
      NEW.user_id,
      0,
      1,
      1,
      1,
      CURRENT_DATE
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