-- dev_streak_advance insertaba con detection_type = 'manual', lo que activaba
-- el logro "corrector" (corregiste la clasificación de la IA) incorrectamente.
-- Los registros sintéticos de dev deben usar 'auto' sin confidence_score.

CREATE OR REPLACE FUNCTION public.dev_streak_advance()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id       uuid := auth.uid();
  v_waste_type_id uuid;
  v_bin_type_id   uuid;
  v_point_id      uuid;
  v_last_date     date;
  v_insert_date   date;
  v_record_id     uuid;
BEGIN
  SELECT MAX(created_at::date) INTO v_last_date FROM public.recycling_records WHERE user_id = v_user_id AND status = 'confirmed';
  v_insert_date := LEAST(COALESCE(v_last_date + 1, public.app_today() - 1), public.app_today() - 1);

  SELECT id INTO v_waste_type_id FROM public.waste_types ORDER BY random() LIMIT 1;
  SELECT id INTO v_bin_type_id   FROM public.bin_types   ORDER BY random() LIMIT 1;
  SELECT id INTO v_point_id      FROM public.recycling_points WHERE is_active = true ORDER BY random() LIMIT 1;

  IF v_waste_type_id IS NULL OR v_bin_type_id IS NULL OR v_point_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'missing_reference_data');
  END IF;

  INSERT INTO public.recycling_records (user_id, waste_type_id, bin_type_id, recycling_point_id, detection_type, status, created_at)
  VALUES (v_user_id, v_waste_type_id, v_bin_type_id, v_point_id, 'auto', 'confirmed', v_insert_date::timestamptz)
  RETURNING id INTO v_record_id;

  RETURN (SELECT jsonb_build_object('ok', true, 'record_id', v_record_id, 'record_date', v_insert_date, 'streak_days', streak_days, 'heat', heat, 'level', level) FROM public.user_progress WHERE user_id = v_user_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.dev_streak_advance() TO authenticated;
