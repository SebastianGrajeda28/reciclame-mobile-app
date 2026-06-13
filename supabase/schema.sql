


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."apply_daily_heat_decay"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Aplica decay solo a usuarios que no reciclaron hoy
  UPDATE public.user_progress
  SET
    heat        = CASE
                    WHEN heat - 30 <= 0 THEN 50
                    ELSE heat - 30
                  END,
    streak_days = CASE
                    WHEN heat - 30 <= 0 THEN public.streak_level_checkpoint(level)
                    ELSE streak_days
                  END,
    updated_at  = now()
  WHERE
    is_active = true
    AND streak_days > 0
    AND (last_recycling_date IS NULL OR last_recycling_date < CURRENT_DATE);
END;
$$;


ALTER FUNCTION "public"."apply_daily_heat_decay"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."compute_streak_level"("p_streak_days" integer) RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
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


ALTER FUNCTION "public"."compute_streak_level"("p_streak_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_public_tables"() RETURNS TABLE("table_name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
$$;


ALTER FUNCTION "public"."count_public_tables"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_educational_categories"() RETURNS TABLE("category" "text", "content_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select 
    ec.category,
    count(*)::int as content_count
  from public.educational_content ec
  where ec.is_active = true
  group by ec.category
  order by ec.category;
end;
$$;


ALTER FUNCTION "public"."get_educational_categories"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_educational_content_by_category"("p_category" "text") RETURNS TABLE("id" "uuid", "category" "text", "title" "text", "description" "text", "content_type" "text", "body" "text", "image_url" "text", "waste_type_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true 
    and ec.category = p_category
  order by ec.display_order, ec.created_at;
end;
$$;


ALTER FUNCTION "public"."get_educational_content_by_category"("p_category" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_educational_content_for_sync"() RETURNS TABLE("id" "uuid", "category" "text", "title" "text", "description" "text", "content_type" "text", "body" "text", "image_url" "text", "waste_type_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true
  order by ec.category, ec.display_order, ec.created_at;
end;
$$;


ALTER FUNCTION "public"."get_educational_content_for_sync"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") RETURNS TABLE("friend_id" "uuid", "name" "text", "current_streak" integer, "avatar_base_style" "text", "last_activity_at" timestamp with time zone, "featured_medals" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  -- Paso 1: resolver los IDs de amigos aceptados del usuario dado.
  with my_friends as (
    select
      case when f.requester_id = p_user_id
           then f.addressee_id
           else f.requester_id
      end as friend_id
    from public.friendships f
    where (f.requester_id = p_user_id or f.addressee_id = p_user_id)
      and f.status    = 'accepted'
      and f.is_active = true
  )
  select
    mf.friend_id,
    coalesce(up.alias, split_part(u.email, '@', 1))      as name,
    coalesce(prog.streak_days, 0)                         as current_streak,
    av.base_style                                         as avatar_base_style,
    la.last_activity_at,
    coalesce(med.featured_medals, '[]'::jsonb)            as featured_medals
  from my_friends mf
  -- Usuario base (siempre existe gracias a FK en friendships)
  join public.users u on u.id = mf.friend_id
  -- Perfil (alias / nombre visible)
  left join public.user_profiles up on up.user_id = mf.friend_id
  -- Progreso (racha actual)
  left join public.user_progress prog on prog.user_id = mf.friend_id
  -- Avatar activo (URL del asset base)
  left join public.avatars av on av.user_id = mf.friend_id
  -- Última actividad: max timestamp de registros de reciclaje
  left join lateral (
    select max(rr.created_at) as last_activity_at
    from public.recycling_records rr
    where rr.user_id   = mf.friend_id
      and rr.is_active = true
  ) la on true
  -- Medallas destacadas: array jsonb [{id, name, description, image_url}]
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id',          a.id,
        'name',        a.name,
        'description', a.description,
        'image_url',   r.asset_url
      ) order by a.name
    ) as featured_medals
    from public.user_featured_medals ufm
    cross join lateral unnest(ufm.achievement_ids) as t(achievement_id)
    join  public.achievements a on a.id = t.achievement_id
    left join public.rewards  r on r.id = a.reward_id
    where ufm.user_id = mf.friend_id
  ) med on true
  order by lower(coalesce(up.alias, split_part(u.email, '@', 1)));
end;
$$;


ALTER FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") RETURNS TABLE("streak_days" integer, "heat" integer, "level" integer, "last_recycling_date" "date")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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
    RETURN QUERY SELECT 0, 0, 1, NULL::date;
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
      -- Racha muerta: streak vuelve al checkpoint del nivel, heat reset, level queda
      effective_heat   := 50;
      effective_streak := public.streak_level_checkpoint(COALESCE(rec.level, 1));
    END IF;

    UPDATE public.user_progress
    SET
      heat        = effective_heat,
      streak_days = effective_streak,
      updated_at  = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN QUERY SELECT effective_streak, effective_heat, COALESCE(rec.level, 1), rec.last_recycling_date;
END;
$$;


ALTER FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_name text;
begin
  -- 1. Insert user into public.users table
  insert into public.users (id, email, last_login_at)
  values (new.id, new.email, now())
  on conflict (id) do update set
    last_login_at = case 
      when new.last_sign_in_at is distinct from old.last_sign_in_at then clock_timestamp()
      else public.users.last_login_at
    end;
  
  -- 2. Extract display name from Google OAuth metadata
  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  -- 3. Insert user profile into public.user_profiles table
  insert into public.user_profiles (user_id, alias)
  values (new.id, user_name)
  on conflict (user_id) do nothing;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_post_segregation_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."handle_post_segregation_progress"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."heat_gain_for_level"("p_level" integer) RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  RETURN (p_level * (p_level + 1)) / 2;
END;
$$;


ALTER FUNCTION "public"."heat_gain_for_level"("p_level" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."streak_level_checkpoint"("p_level" integer) RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
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


ALTER FUNCTION "public"."streak_level_checkpoint"("p_level" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_educational_content_fetch"() RETURNS TABLE("content_fetched" boolean, "categories_found" integer, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  content_count int := 0;
  category_count int := 0;
  test_category text := 'test_recycling';
begin
  -- Insert test content
  insert into public.educational_content (category, title, content_type, body, is_active)
  values 
    (test_category, 'Test Fact 1', 'fact', 'Test body 1', true),
    (test_category, 'Test Fact 2', 'fact', 'Test body 2', true);

  -- Fetch all content
  select count(*)::int into content_count from public.get_educational_content_for_sync();

  -- Count categories
  select count(*)::int into category_count from public.get_educational_categories();

  -- Cleanup
  delete from public.educational_content where category = test_category;

  return query select 
    content_count > 0 as content_fetched,
    category_count,
    'test_completed';
end;
$$;


ALTER FUNCTION "public"."test_educational_content_fetch"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_get_friends_with_profile_flow"() RETURNS TABLE("friend_found" boolean, "has_name" boolean, "has_streak" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  user_a_id  uuid;
  user_b_id  uuid;
  email_a    text;
  email_b    text;
  result_row record;
  row_count  int := 0;
begin
  -- Generar IDs únicos que no existan en auth.users
  loop
    user_a_id := gen_random_uuid();
    exit when not exists (select 1 from auth.users where id = user_a_id);
  end loop;
  loop
    user_b_id := gen_random_uuid();
    exit when not exists (select 1 from auth.users where id = user_b_id);
  end loop;

  email_a := 'test_friends_a_' || user_a_id || '@test.com';
  email_b := 'test_friends_b_' || user_b_id || '@test.com';

  -- Crear usuarios en auth + trigger crea filas en public.users / user_profiles
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  values
    (user_a_id, email_a, jsonb_build_object('full_name', 'Usuario A Test'), now(), now()),
    (user_b_id, email_b, jsonb_build_object('full_name', 'Usuario B Test'), now(), now());

  -- Crear alias visible para B
  insert into public.user_profiles (user_id, alias)
  values (user_b_id, 'Amigo Test')
  on conflict (user_id) do update set alias = 'Amigo Test';

  -- Crear progreso con racha para B
  insert into public.user_progress (user_id, streak_days)
  values (user_b_id, 7)
  on conflict (user_id) do update set streak_days = 7;

  -- Crear amistad aceptada entre A y B
  insert into public.friendships (requester_id, addressee_id, status)
  values (user_a_id, user_b_id, 'accepted');

  -- Llamar a la RPC y verificar resultados
  for result_row in
    select * from public.get_friends_with_profile(user_a_id)
  loop
    row_count := row_count + 1;
  end loop;

  -- Limpiar datos de prueba
  delete from public.friendships
    where (requester_id = user_a_id or addressee_id = user_a_id)
       or (requester_id = user_b_id or addressee_id = user_b_id);
  delete from public.user_progress where user_id in (user_a_id, user_b_id);
  delete from auth.users where id in (user_a_id, user_b_id);

  return query select
    (row_count = 1)                as friend_found,
    (result_row.name is not null)  as has_name,
    (result_row.current_streak = 7) as has_streak,
    'test_completed'               as message;
end;
$$;


ALTER FUNCTION "public"."test_get_friends_with_profile_flow"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_handle_new_user_on_insert"() RETURNS TABLE("user_exists" boolean, "profile_exists" boolean, "last_login_filled" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."test_handle_new_user_on_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_handle_new_user_on_login"() RETURNS TABLE("last_login_updated" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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

  -- el trigger setea en now(), pero es el mismo now() de esta transacción, por ello
  -- , al menos en local, este test falla. Por ello se pone una fecha antigua
  UPDATE public.users
  SET last_login_at = '2000-01-01 00:00:00+00'::timestamptz
  WHERE id = test_id;

  SELECT last_login_at INTO login_before FROM public.users WHERE id = test_id;

  -- Simula login real (UPDATE last_sign_in_at dispara trigger)
  UPDATE auth.users SET last_sign_in_at = now() + interval '1 second' WHERE id = test_id;

  SELECT last_login_at INTO login_after FROM public.users WHERE id = test_id;

  RETURN QUERY
  SELECT login_after > login_before;

  -- Limpieza
  DELETE FROM auth.users WHERE id = test_id;
END;
$$;


ALTER FUNCTION "public"."test_handle_new_user_on_login"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_handle_new_user_on_non_login_update"() RETURNS TABLE("last_login_unchanged" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."test_handle_new_user_on_non_login_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_no_duplicate_on_subsequent_login"() RETURNS TABLE("first_login_created_user" boolean, "first_login_created_profile" boolean, "second_login_users_count" integer, "second_login_profiles_count" integer, "no_duplication" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."test_no_duplicate_on_subsequent_login"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_update_featured_medals_flow"() RETURNS TABLE("created" boolean, "medals_updated" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  test_id uuid;
  test_email text;
  achievement_id_1 uuid;
  achievement_id_2 uuid;
  achievement_id_3 uuid;
  user_exists boolean := false;
  medals_exist boolean := false;
begin
  -- Generate unique ids
  loop
    test_id := gen_random_uuid();
    exit when not exists (select 1 from auth.users where id = test_id);
  end loop;
  test_email := 'test_medals_' || test_id || '@test.com';
  achievement_id_1 := gen_random_uuid();
  achievement_id_2 := gen_random_uuid();
  achievement_id_3 := gen_random_uuid();

  -- Create achievements
  insert into public.achievements (id, name, reward_type, is_active)
  values 
    (achievement_id_1, 'Test Achievement 1', 'ACHIEVEMENT', true),
    (achievement_id_2, 'Test Achievement 2', 'ACHIEVEMENT', true),
    (achievement_id_3, 'Test Achievement 3', 'ACHIEVEMENT', true)
  on conflict (id) do nothing;

  -- Insert into auth.users
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  values (test_id, test_email, jsonb_build_object('full_name','Test Medals User'), now(), now());

  -- Unlock achievements for user
  insert into public.user_achievements (id, user_id, achievement_id, unlocked_at)
  values 
    (gen_random_uuid(), test_id, achievement_id_1, now()),
    (gen_random_uuid(), test_id, achievement_id_2, now()),
    (gen_random_uuid(), test_id, achievement_id_3, now())
  on conflict (user_id, achievement_id) do nothing;

  -- Call the RPC to update featured medals
  PERFORM * FROM public.update_featured_medals(test_id, ARRAY[achievement_id_1, achievement_id_2]);

  -- Validate the featured medals record was created/updated
  select exists(select 1 from public.users where id = test_id) into user_exists;
  select exists(select 1 from public.user_featured_medals where user_id = test_id and array_length(achievement_ids, 1) = 2) into medals_exist;

  -- Cleanup
  delete from public.user_featured_medals where user_id = test_id;
  delete from public.user_achievements where user_id = test_id;
  delete from auth.users where id = test_id;
  delete from public.achievements where id in (achievement_id_1, achievement_id_2, achievement_id_3);

  return query select user_exists, medals_exist, 'test_completed';
end;
$$;


ALTER FUNCTION "public"."test_update_featured_medals_flow"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_update_user_avatar_flow"() RETURNS TABLE("created" boolean, "avatar_set" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  test_id uuid;
  test_email text;
  reward_id uuid;
  asset text := 'http://example.com/test-avatar.png';
  avatar_exists boolean := false;
  user_exists boolean := false;
begin
  -- Generate unique ids
  loop
    test_id := gen_random_uuid();
    exit when not exists (select 1 from auth.users where id = test_id);
  end loop;
  test_email := 'test_' || test_id || '@test.com';
  reward_id := gen_random_uuid();

  -- Create a reward representing an avatar
  insert into public.rewards (id, name, reward_type, asset_url)
  values (reward_id, 'Test Avatar Reward', 'AVATAR', asset)
  on conflict (id) do nothing;

  -- Insert into auth.users to simulate signup
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  values (test_id, test_email, jsonb_build_object('full_name','Test Avatar User'), now(), now());

  -- Link reward to user (unlock inventory)
  insert into public.user_rewards (id, user_id, reward_id, unlocked_at)
  values (gen_random_uuid(), test_id, reward_id, now())
  on conflict (user_id, reward_id) do nothing;

  -- Call the RPC that updates avatar
  PERFORM * FROM public.update_user_avatar(test_id, reward_id);

  -- Validate the avatar record was created/updated
  select exists(select 1 from public.users where id = test_id) into user_exists;
  select exists(select 1 from public.avatars where user_id = test_id and base_style = asset) into avatar_exists;

  -- Cleanup
  delete from public.avatars where user_id = test_id;
  delete from public.user_rewards where user_id = test_id;
  delete from auth.users where id = test_id;
  delete from public.rewards where id = reward_id;

  return query select user_exists, avatar_exists, 'test_completed';
end;
$$;


ALTER FUNCTION "public"."test_update_user_avatar_flow"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  invalid_ids uuid[];
begin
  -- Validate array size (max 5 medals)
  if array_length(p_achievement_ids, 1) > 5 then
    return query select false, 'max_featured_medals_exceeded';
    return;
  end if;

  -- Validate all achievement IDs exist and user has unlocked them
  select array_agg(id)
  into invalid_ids
  from unnest(p_achievement_ids) as id
  where not exists (
    select 1 from public.user_achievements
    where user_id = p_user_id and achievement_id = id
  );

  if invalid_ids is not null then
    return query select false, 'invalid_or_unlocked_achievements';
    return;
  end if;

  -- Upsert featured medals record
  insert into public.user_featured_medals (user_id, achievement_ids, updated_at)
  values (p_user_id, p_achievement_ids, now())
  on conflict (user_id) do update set
    achievement_ids = excluded.achievement_ids,
    updated_at = now();

  return query select true, 'featured_medals_updated';
end;
$$;


ALTER FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  asset text;
begin
  -- Validate reward exists
  if not exists (select 1 from public.rewards where id = p_reward_id) then
    return query select false, 'reward_not_found';
    return;
  end if;

  -- Validate user has unlocked the reward
  if not exists (select 1 from public.user_rewards where user_id = p_user_id and reward_id = p_reward_id) then
    return query select false, 'reward_not_unlocked';
    return;
  end if;

  select asset_url into asset from public.rewards where id = p_reward_id;

  -- Upsert avatar record for the user using the reward asset
  insert into public.avatars (user_id, base_style, updated_at)
  values (p_user_id, asset, now())
  on conflict (user_id) do update set
    base_style = excluded.base_style,
    updated_at = now();

  return query select true, 'avatar_updated';
end;
$$;


ALTER FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "condition_type" "text",
    "condition_value" integer,
    "reward_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."avatars" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "base_style" "text",
    "frame_reward_id" "uuid",
    "accessory_reward_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "avatar_config" "jsonb"
);


ALTER TABLE "public"."avatars" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bin_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" "uuid",
    "name" "text" NOT NULL,
    "color" "text",
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."bin_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cached_resources" (
    "resource_name" "text" NOT NULL,
    "last_synced_at" timestamp with time zone,
    "version" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."cached_resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campuses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."campuses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."educational_content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "content_type" "text" NOT NULL,
    "body" "text" NOT NULL,
    "image_url" "text",
    "waste_type_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."educational_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."friend_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."friend_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "addressee_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "user_low" "uuid" GENERATED ALWAYS AS (LEAST("requester_id", "addressee_id")) STORED,
    "user_high" "uuid" GENERATED ALWAYS AS (GREATEST("requester_id", "addressee_id")) STORED,
    "responded_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "friendships_check" CHECK (("requester_id" <> "addressee_id")),
    CONSTRAINT "friendships_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'blocked'::"text"])))
);


ALTER TABLE "public"."friendships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fun_facts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "text" "text" NOT NULL,
    "waste_type_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."fun_facts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_check" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."health_check" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instruction_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "instruction_id" "uuid" NOT NULL,
    "text" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."instruction_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instructions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "image_url" "text",
    "waste_type_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."instructions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."map_waste_type_bin_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" "uuid" NOT NULL,
    "waste_type_id" "uuid" NOT NULL,
    "bin_type_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."map_waste_type_bin_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."metric_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_name" "text" NOT NULL,
    "metric_value" numeric NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."metric_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pending_operations" (
    "local_id" "text" NOT NULL,
    "user_id" "uuid",
    "operation_type" "text" NOT NULL,
    "payload_json" "text",
    "status" "text" NOT NULL,
    "retry_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "last_error" "text",
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."pending_operations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recycling_point_bins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recycling_point_id" "uuid" NOT NULL,
    "bin_type_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."recycling_point_bins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recycling_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campus_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "latitude" numeric(9,6) NOT NULL,
    "longitude" numeric(9,6) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."recycling_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recycling_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "recycling_point_id" "uuid",
    "bin_type_id" "uuid",
    "waste_type_id" "uuid",
    "detection_type" "text",
    "confidence_score" numeric,
    "estimated_weight" numeric,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."recycling_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recycling_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "outcome" "text" NOT NULL,
    "furthest_step" "text" NOT NULL,
    "detection_type" "text",
    "predicted_waste_type_id" "uuid",
    "final_waste_type_id" "uuid",
    "confidence_score" numeric,
    "low_confidence" boolean GENERATED ALWAYS AS (("confidence_score" < 0.8)) STORED,
    "waste_type_overridden" boolean,
    "recycling_point_id" "uuid",
    "recycling_record_id" "uuid",
    "started_at" timestamp with time zone NOT NULL,
    "ended_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "recycling_sessions_detection_type_check" CHECK (("detection_type" = ANY (ARRAY['auto'::"text", 'manual'::"text"]))),
    CONSTRAINT "recycling_sessions_furthest_step_check" CHECK (("furthest_step" = ANY (ARRAY['camera'::"text", 'processing'::"text", 'manual'::"text", 'map'::"text", 'instructions'::"text", 'success'::"text"]))),
    CONSTRAINT "recycling_sessions_outcome_check" CHECK (("outcome" = ANY (ARRAY['confirmed'::"text", 'abandoned'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."recycling_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "reward_type" "text",
    "asset_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."rewards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."system_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."universities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."universities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."user_achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_featured_medals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "max_featured_medals" CHECK (("array_length"("achievement_ids", 1) <= 5))
);


ALTER TABLE "public"."user_featured_medals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "alias" "text",
    "avatar_id" "uuid",
    "university_id" "uuid",
    "campus_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "points" integer DEFAULT 0 NOT NULL,
    "streak_days" integer DEFAULT 0 NOT NULL,
    "heat" numeric,
    "level" integer DEFAULT 1 NOT NULL,
    "last_recycling_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."user_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_equipped" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."user_rewards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notifications_enabled" boolean DEFAULT true NOT NULL,
    "skip_recycling_instructions" boolean DEFAULT false NOT NULL,
    "profile_visibility" "text",
    "language" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "last_login_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waste_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "estimated_weight_g" numeric DEFAULT 50 NOT NULL
);


ALTER TABLE "public"."waste_types" OWNER TO "postgres";


ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."bin_types"
    ADD CONSTRAINT "bin_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cached_resources"
    ADD CONSTRAINT "cached_resources_pkey" PRIMARY KEY ("resource_name");



ALTER TABLE ONLY "public"."campuses"
    ADD CONSTRAINT "campuses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."educational_content"
    ADD CONSTRAINT "educational_content_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fun_facts"
    ADD CONSTRAINT "fun_facts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_check"
    ADD CONSTRAINT "health_check_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instruction_steps"
    ADD CONSTRAINT "instruction_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instructions"
    ADD CONSTRAINT "instructions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_university_id_waste_type_id_bin_ty_key" UNIQUE ("university_id", "waste_type_id", "bin_type_id");



ALTER TABLE ONLY "public"."metric_snapshots"
    ADD CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_operations"
    ADD CONSTRAINT "pending_operations_pkey" PRIMARY KEY ("local_id");



ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_recycling_point_id_bin_type_id_key" UNIQUE ("recycling_point_id", "bin_type_id");



ALTER TABLE ONLY "public"."recycling_points"
    ADD CONSTRAINT "recycling_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."universities"
    ADD CONSTRAINT "universities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_achievement_id_key" UNIQUE ("user_id", "achievement_id");



ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_user_id_reward_id_key" UNIQUE ("user_id", "reward_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_id_key" UNIQUE ("user_id", "role_id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waste_types"
    ADD CONSTRAINT "waste_types_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_educational_content_category_active" ON "public"."educational_content" USING "btree" ("category", "is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_friend_codes_code" ON "public"."friend_codes" USING "btree" ("code");



CREATE INDEX "idx_friendships_addressee" ON "public"."friendships" USING "btree" ("addressee_id");



CREATE INDEX "idx_friendships_requester" ON "public"."friendships" USING "btree" ("requester_id");



CREATE INDEX "idx_friendships_status" ON "public"."friendships" USING "btree" ("status");



CREATE INDEX "idx_map_waste_bin_bin_type" ON "public"."map_waste_type_bin_types" USING "btree" ("bin_type_id");



CREATE INDEX "idx_map_waste_bin_university" ON "public"."map_waste_type_bin_types" USING "btree" ("university_id");



CREATE INDEX "idx_map_waste_bin_waste_type" ON "public"."map_waste_type_bin_types" USING "btree" ("waste_type_id");



CREATE INDEX "idx_recycling_sessions_outcome" ON "public"."recycling_sessions" USING "btree" ("outcome");



CREATE INDEX "idx_recycling_sessions_started_at" ON "public"."recycling_sessions" USING "btree" ("started_at");



CREATE INDEX "idx_recycling_sessions_user_id" ON "public"."recycling_sessions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "uq_friendships_pair" ON "public"."friendships" USING "btree" ("user_low", "user_high");



CREATE OR REPLACE TRIGGER "on_recycling_record_created" AFTER INSERT ON "public"."recycling_records" FOR EACH ROW EXECUTE FUNCTION "public"."handle_post_segregation_progress"();



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_accessory_reward_id_fkey" FOREIGN KEY ("accessory_reward_id") REFERENCES "public"."rewards"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_frame_reward_id_fkey" FOREIGN KEY ("frame_reward_id") REFERENCES "public"."rewards"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bin_types"
    ADD CONSTRAINT "bin_types_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."campuses"
    ADD CONSTRAINT "campuses_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."educational_content"
    ADD CONSTRAINT "educational_content_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fun_facts"
    ADD CONSTRAINT "fun_facts_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."instruction_steps"
    ADD CONSTRAINT "instruction_steps_instruction_id_fkey" FOREIGN KEY ("instruction_id") REFERENCES "public"."instructions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instructions"
    ADD CONSTRAINT "instructions_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_bin_type_id_fkey" FOREIGN KEY ("bin_type_id") REFERENCES "public"."bin_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pending_operations"
    ADD CONSTRAINT "pending_operations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_bin_type_id_fkey" FOREIGN KEY ("bin_type_id") REFERENCES "public"."bin_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_recycling_point_id_fkey" FOREIGN KEY ("recycling_point_id") REFERENCES "public"."recycling_points"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recycling_points"
    ADD CONSTRAINT "recycling_points_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_bin_type_id_fkey" FOREIGN KEY ("bin_type_id") REFERENCES "public"."bin_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_recycling_point_id_fkey" FOREIGN KEY ("recycling_point_id") REFERENCES "public"."recycling_points"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_final_waste_type_id_fkey" FOREIGN KEY ("final_waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_predicted_waste_type_id_fkey" FOREIGN KEY ("predicted_waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_recycling_point_id_fkey" FOREIGN KEY ("recycling_point_id") REFERENCES "public"."recycling_points"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_recycling_record_id_fkey" FOREIGN KEY ("recycling_record_id") REFERENCES "public"."recycling_records"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."avatars" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bin_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cached_resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campuses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friend_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fun_facts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instruction_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instructions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."map_waste_type_bin_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."metric_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pending_operations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recycling_point_bins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recycling_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recycling_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rewards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."universities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_rewards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."waste_types" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."apply_daily_heat_decay"() TO "anon";
GRANT ALL ON FUNCTION "public"."apply_daily_heat_decay"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_daily_heat_decay"() TO "service_role";



GRANT ALL ON FUNCTION "public"."compute_streak_level"("p_streak_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."compute_streak_level"("p_streak_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."compute_streak_level"("p_streak_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "anon";
GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_educational_categories"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_educational_categories"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_educational_categories"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_educational_content_by_category"("p_category" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_educational_content_by_category"("p_category" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_educational_content_by_category"("p_category" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_educational_content_for_sync"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_educational_content_for_sync"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_educational_content_for_sync"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "service_role";



GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."streak_level_checkpoint"("p_level" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."streak_level_checkpoint"("p_level" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."streak_level_checkpoint"("p_level" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."test_educational_content_fetch"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_educational_content_fetch"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_educational_content_fetch"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_get_friends_with_profile_flow"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_get_friends_with_profile_flow"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_get_friends_with_profile_flow"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_login"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_login"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_login"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_non_login_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_non_login_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_non_login_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_no_duplicate_on_subsequent_login"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_no_duplicate_on_subsequent_login"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_no_duplicate_on_subsequent_login"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_update_featured_medals_flow"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_update_featured_medals_flow"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_update_featured_medals_flow"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_update_user_avatar_flow"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_update_user_avatar_flow"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_update_user_avatar_flow"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "service_role";
























GRANT ALL ON TABLE "public"."achievements" TO "anon";
GRANT ALL ON TABLE "public"."achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."achievements" TO "service_role";



GRANT ALL ON TABLE "public"."avatars" TO "anon";
GRANT ALL ON TABLE "public"."avatars" TO "authenticated";
GRANT ALL ON TABLE "public"."avatars" TO "service_role";



GRANT ALL ON TABLE "public"."bin_types" TO "anon";
GRANT ALL ON TABLE "public"."bin_types" TO "authenticated";
GRANT ALL ON TABLE "public"."bin_types" TO "service_role";



GRANT ALL ON TABLE "public"."cached_resources" TO "anon";
GRANT ALL ON TABLE "public"."cached_resources" TO "authenticated";
GRANT ALL ON TABLE "public"."cached_resources" TO "service_role";



GRANT ALL ON TABLE "public"."campuses" TO "anon";
GRANT ALL ON TABLE "public"."campuses" TO "authenticated";
GRANT ALL ON TABLE "public"."campuses" TO "service_role";



GRANT ALL ON TABLE "public"."educational_content" TO "anon";
GRANT ALL ON TABLE "public"."educational_content" TO "authenticated";
GRANT ALL ON TABLE "public"."educational_content" TO "service_role";



GRANT ALL ON TABLE "public"."friend_codes" TO "anon";
GRANT ALL ON TABLE "public"."friend_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."friend_codes" TO "service_role";



GRANT ALL ON TABLE "public"."friendships" TO "anon";
GRANT ALL ON TABLE "public"."friendships" TO "authenticated";
GRANT ALL ON TABLE "public"."friendships" TO "service_role";



GRANT ALL ON TABLE "public"."fun_facts" TO "anon";
GRANT ALL ON TABLE "public"."fun_facts" TO "authenticated";
GRANT ALL ON TABLE "public"."fun_facts" TO "service_role";



GRANT ALL ON TABLE "public"."health_check" TO "anon";
GRANT ALL ON TABLE "public"."health_check" TO "authenticated";
GRANT ALL ON TABLE "public"."health_check" TO "service_role";



GRANT ALL ON TABLE "public"."instruction_steps" TO "anon";
GRANT ALL ON TABLE "public"."instruction_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."instruction_steps" TO "service_role";



GRANT ALL ON TABLE "public"."instructions" TO "anon";
GRANT ALL ON TABLE "public"."instructions" TO "authenticated";
GRANT ALL ON TABLE "public"."instructions" TO "service_role";



GRANT ALL ON TABLE "public"."map_waste_type_bin_types" TO "anon";
GRANT ALL ON TABLE "public"."map_waste_type_bin_types" TO "authenticated";
GRANT ALL ON TABLE "public"."map_waste_type_bin_types" TO "service_role";



GRANT ALL ON TABLE "public"."metric_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."metric_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."metric_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."pending_operations" TO "anon";
GRANT ALL ON TABLE "public"."pending_operations" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_operations" TO "service_role";



GRANT ALL ON TABLE "public"."recycling_point_bins" TO "anon";
GRANT ALL ON TABLE "public"."recycling_point_bins" TO "authenticated";
GRANT ALL ON TABLE "public"."recycling_point_bins" TO "service_role";



GRANT ALL ON TABLE "public"."recycling_points" TO "anon";
GRANT ALL ON TABLE "public"."recycling_points" TO "authenticated";
GRANT ALL ON TABLE "public"."recycling_points" TO "service_role";



GRANT ALL ON TABLE "public"."recycling_records" TO "anon";
GRANT ALL ON TABLE "public"."recycling_records" TO "authenticated";
GRANT ALL ON TABLE "public"."recycling_records" TO "service_role";



GRANT ALL ON TABLE "public"."recycling_sessions" TO "anon";
GRANT ALL ON TABLE "public"."recycling_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."recycling_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."rewards" TO "anon";
GRANT ALL ON TABLE "public"."rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."rewards" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."system_config" TO "anon";
GRANT ALL ON TABLE "public"."system_config" TO "authenticated";
GRANT ALL ON TABLE "public"."system_config" TO "service_role";



GRANT ALL ON TABLE "public"."universities" TO "anon";
GRANT ALL ON TABLE "public"."universities" TO "authenticated";
GRANT ALL ON TABLE "public"."universities" TO "service_role";



GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";



GRANT ALL ON TABLE "public"."user_featured_medals" TO "anon";
GRANT ALL ON TABLE "public"."user_featured_medals" TO "authenticated";
GRANT ALL ON TABLE "public"."user_featured_medals" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_rewards" TO "anon";
GRANT ALL ON TABLE "public"."user_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."user_rewards" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."waste_types" TO "anon";
GRANT ALL ON TABLE "public"."waste_types" TO "authenticated";
GRANT ALL ON TABLE "public"."waste_types" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































