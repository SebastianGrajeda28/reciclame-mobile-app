-- Dev panel helpers: rollback and delete last recycling record for the calling user.
-- Both are SECURITY DEFINER so they bypass RLS, but they are strictly scoped to
-- auth.uid() — a user can only touch their own records.

CREATE OR REPLACE FUNCTION public.dev_rollback_last_record()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id uuid;
  v_old_date  timestamptz;
  v_new_date  timestamptz;
BEGIN
  SELECT id, created_at
    INTO v_record_id, v_old_date
    FROM public.recycling_records
   WHERE user_id = auth.uid()
   ORDER BY created_at DESC
   LIMIT 1;

  IF v_record_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_records');
  END IF;

  v_new_date := v_old_date - interval '1 day';

  UPDATE public.recycling_records
     SET created_at = v_new_date
   WHERE id = v_record_id;

  RETURN jsonb_build_object(
    'ok',       true,
    'id',       v_record_id,
    'old_date', v_old_date,
    'new_date', v_new_date
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.dev_delete_last_record()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id uuid;
  v_created_at timestamptz;
BEGIN
  SELECT id, created_at
    INTO v_record_id, v_created_at
    FROM public.recycling_records
   WHERE user_id = auth.uid()
   ORDER BY created_at DESC
   LIMIT 1;

  IF v_record_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_records');
  END IF;

  DELETE FROM public.recycling_records WHERE id = v_record_id;

  RETURN jsonb_build_object(
    'ok',        true,
    'id',        v_record_id,
    'created_at', v_created_at
  );
END;
$$;
