-- Test 1: Simula creación de usuario (INSERT en auth.users)
CREATE OR REPLACE FUNCTION test_handle_new_user_on_insert()
RETURNS TABLE(user_exists boolean, profile_exists boolean, last_login_filled boolean) AS $$
DECLARE
  test_id uuid;
  test_email text;
BEGIN
  -- Genera un UUID que no exista en auth.users
  LOOP
    test_id := gen_random_uuid();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_id);
  END LOOP;

  test_email := 'test_' || test_id || '@test.com';

  -- Dispara el trigger (INSERT)
  INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  VALUES (test_id, test_email, '{"full_name": "Test User"}'::jsonb, now(), now());

  RETURN QUERY
  SELECT
    EXISTS(SELECT 1 FROM public.users WHERE id = test_id),
    EXISTS(SELECT 1 FROM public.user_profiles WHERE user_id = test_id AND alias = 'Test User'),
    (SELECT last_login_at IS NOT NULL FROM public.users WHERE id = test_id);

  -- Limpieza
  DELETE FROM auth.users WHERE id = test_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Test 2: Simula login de usuario (UPDATE last_sign_in_at en auth.users)
CREATE OR REPLACE FUNCTION test_handle_new_user_on_login()
RETURNS TABLE(last_login_updated boolean) AS $$
DECLARE
  test_id uuid;
  test_email text;
  login_before timestamptz;
  login_after timestamptz;
BEGIN
  -- Genera un UUID que no exista en auth.users
  LOOP
    test_id := gen_random_uuid();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_id);
  END LOOP;

  test_email := 'test_' || test_id || '@test.com';

  -- Crear primero (INSERT dispara trigger)
  INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  VALUES (test_id, test_email, '{"full_name": "Test User"}'::jsonb, now(), now());

  SELECT last_login_at INTO login_before FROM public.users WHERE id = test_id;

  -- Simula login real (UPDATE last_sign_in_at dispara trigger)
  UPDATE auth.users SET last_sign_in_at = now() + interval '1 second' WHERE id = test_id;

  SELECT last_login_at INTO login_after FROM public.users WHERE id = test_id;

  RETURN QUERY
  SELECT login_after > login_before;

  -- Limpieza
  DELETE FROM auth.users WHERE id = test_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Test 3: Verifica que last_login_at NO cambia al editar otro campo (email)
CREATE OR REPLACE FUNCTION test_handle_new_user_on_non_login_update()
RETURNS TABLE(last_login_unchanged boolean) AS $$
DECLARE
  test_id uuid;
  test_email text;
  login_before timestamptz;
  login_after timestamptz;
BEGIN
  -- Genera un UUID que no exista en auth.users
  LOOP
    test_id := gen_random_uuid();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_id);
  END LOOP;

  test_email := 'test_' || test_id || '@test.com';

  -- Crear primero (INSERT dispara trigger)
  INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  VALUES (test_id, test_email, '{"full_name": "Test User"}'::jsonb, now(), now());

  SELECT last_login_at INTO login_before FROM public.users WHERE id = test_id;

  -- Simula edición de email (NO debe actualizar last_login_at)
  UPDATE auth.users SET email = 'updated_' || test_email WHERE id = test_id;

  SELECT last_login_at INTO login_after FROM public.users WHERE id = test_id;

  RETURN QUERY
  SELECT login_after IS NOT DISTINCT FROM login_before;

  -- Limpieza
  DELETE FROM auth.users WHERE id = test_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Test 4: Verifica que NO se duplican datos en users o user_profiles en logins subsecuentes
CREATE OR REPLACE FUNCTION test_no_duplicate_on_subsequent_login()
RETURNS TABLE(
  first_login_created_user boolean,
  first_login_created_profile boolean,
  second_login_users_count integer,
  second_login_profiles_count integer,
  no_duplication boolean
) AS $$
DECLARE
  test_id uuid;
  test_email text;
  users_before integer;
  users_after integer;
  profiles_before integer;
  profiles_after integer;
BEGIN
  -- Genera un UUID que no exista
  LOOP
    test_id := gen_random_uuid();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_id);
  END LOOP;

  test_email := 'test_' || test_id || '@test.com';

  -- Primer login (INSERT dispara trigger)
  INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  VALUES (test_id, test_email, '{"full_name": "Test User Duplicate"}'::jsonb, now(), now());

  -- Contar registros después del primer login
  SELECT COUNT(*) INTO users_before FROM public.users WHERE id = test_id;
  SELECT COUNT(*) INTO profiles_before FROM public.user_profiles WHERE user_id = test_id;

  -- Segundo login (UPDATE dispara trigger nuevamente)
  UPDATE auth.users SET last_sign_in_at = now() WHERE id = test_id;

  -- Contar registros después del segundo login
  SELECT COUNT(*) INTO users_after FROM public.users WHERE id = test_id;
  SELECT COUNT(*) INTO profiles_after FROM public.user_profiles WHERE user_id = test_id;

  RETURN QUERY
  SELECT
    users_before > 0,
    profiles_before > 0,
    users_after,
    profiles_after,
    (users_before = users_after AND profiles_before = profiles_after);

  -- Limpieza
  DELETE FROM auth.users WHERE id = test_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;