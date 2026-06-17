-- RF-039: calor obtenido por registro. Guarda en cada recycling_record cuánto calor dio esa
-- segregación, para mostrarlo en el historial.

ALTER TABLE public.recycling_records
  ADD COLUMN IF NOT EXISTS heat_gained int;

-- confirm_segregation: igual que antes + guarda heat_gained (delta de calor de este registro).
-- El UPDATE no re-dispara el trigger de progreso porque es AFTER INSERT (no UPDATE).
CREATE OR REPLACE FUNCTION public.confirm_segregation(
  p_user_id uuid,
  p_waste_type_id uuid,
  p_bin_type_id uuid,
  p_recycling_point_id uuid,
  p_detection_type text DEFAULT NULL,
  p_confidence_score numeric DEFAULT NULL
)
RETURNS TABLE (
  record_id uuid,
  streak_days int,
  heat int,
  level int,
  previous_level int,
  leveled_up boolean,
  streak_extended_today boolean,
  already_recycled_today boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  before_rec      public.user_progress%ROWTYPE;
  after_rec       public.user_progress%ROWTYPE;
  v_had_progress  boolean := false;
  v_already_today boolean := false;
  v_prev_level    int;
  v_weight        numeric;
  v_record_id     uuid;
  today           date := public.app_today();
BEGIN
  SELECT * INTO before_rec FROM public.user_progress WHERE user_id = p_user_id;
  v_had_progress := FOUND;
  v_already_today := v_had_progress
    AND before_rec.last_recycling_date IS NOT NULL
    AND before_rec.last_recycling_date >= today;
  v_prev_level := CASE WHEN v_had_progress THEN COALESCE(before_rec.level, 1) ELSE 1 END;

  SELECT estimated_weight_g INTO v_weight
  FROM public.waste_types WHERE id = p_waste_type_id;

  INSERT INTO public.recycling_records (
    user_id, waste_type_id, bin_type_id, recycling_point_id,
    detection_type, confidence_score, estimated_weight, status
  ) VALUES (
    p_user_id, p_waste_type_id, p_bin_type_id, p_recycling_point_id,
    p_detection_type, p_confidence_score, v_weight, 'confirmed'
  )
  RETURNING id INTO v_record_id;

  SELECT * INTO after_rec FROM public.user_progress WHERE user_id = p_user_id;

  -- RF-039: calor obtenido = cuánto subió el calor con esta segregación.
  UPDATE public.recycling_records
  SET heat_gained = GREATEST(0, COALESCE(after_rec.heat, 51) - COALESCE(before_rec.heat, 0))
  WHERE id = v_record_id;

  record_id              := v_record_id;
  streak_days            := COALESCE(after_rec.streak_days, 1);
  heat                   := COALESCE(after_rec.heat, 51)::int;
  level                  := COALESCE(after_rec.level, 1);
  previous_level         := v_prev_level;
  already_recycled_today := v_already_today;
  streak_extended_today  := NOT v_already_today;
  leveled_up             := COALESCE(after_rec.level, 1) > v_prev_level;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_segregation(uuid, uuid, uuid, uuid, text, numeric)
  TO authenticated;
