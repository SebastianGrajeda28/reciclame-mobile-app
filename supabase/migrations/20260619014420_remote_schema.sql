drop extension if exists "pg_net";

drop function if exists "app_social"."get_friends_with_profile"(p_user_id uuid);

drop function if exists "public"."get_friends_with_profile"(p_user_id uuid);

alter table "public"."bin_types" add column "image_url" text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION app_profile.get_profile_summary(p_user_id uuid)
 RETURNS TABLE(total_weight_kg numeric, total_items bigint, member_since timestamp with time zone, achievements_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_weight numeric;
  v_items bigint;
  v_member_since timestamp with time zone;
  v_achievements bigint;
begin
  -- 1. Peso total en kg (la columna estimated_weight en recycling_records está en gramos)
  select coalesce(sum(estimated_weight), 0) / 1000.0
  into v_weight
  from public.recycling_records
  where user_id = p_user_id
    and status = 'confirmed'
    and is_active = true;

  -- 2. Cantidad de artículos reciclados
  select count(*)
  into v_items
  from public.recycling_records
  where user_id = p_user_id
    and status = 'confirmed'
    and is_active = true;

  -- 3. Fecha del primer login / registro
  select created_at
  into v_member_since
  from public.users
  where id = p_user_id;

  -- 4. Número de logros completados
  select count(*)
  into v_achievements
  from public.user_achievements
  where user_id = p_user_id
    and is_active = true;

  return query select v_weight, v_items, v_member_since, v_achievements;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_profile_summary(p_user_id uuid)
 RETURNS TABLE(total_weight_kg numeric, total_items bigint, member_since timestamp with time zone, achievements_count bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'app_profile'
AS $function$
  select * from app_profile.get_profile_summary(p_user_id);
$function$
;

CREATE OR REPLACE FUNCTION app_social.add_friend_by_code(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_code text := nullif(btrim(p_code), '');
  v_friend_id uuid;
  v_friendship_id uuid;
  v_created boolean := false;
begin
  if v_uid is null then raise exception 'unauthenticated'; end if;
  if v_code is null then raise exception 'invalid friend code'; end if;

  select user_id into v_friend_id
  from public.friend_codes
  where code = v_code and is_active = true and (expires_at is null or expires_at > now())
  limit 1;

  if v_friend_id is null then raise exception 'friend code not found'; end if;
  if v_friend_id = v_uid then raise exception 'cannot add yourself'; end if;

  begin
    insert into public.friendships (requester_id, addressee_id, status, responded_at)
    values (v_uid, v_friend_id, 'accepted', now())
    returning id into v_friendship_id;
    v_created := true;
  exception when unique_violation then
    select id into v_friendship_id
    from public.friendships
    where user_low = least(v_uid, v_friend_id) and user_high = greatest(v_uid, v_friend_id)
    limit 1;
  end;

  return jsonb_build_object('friendship_id', v_friendship_id, 'friend_id', v_friend_id, 'created', v_created);
end;
$function$
;

CREATE OR REPLACE FUNCTION app_social.get_friends_with_profile(p_user_id uuid)
 RETURNS TABLE(friend_id uuid, name text, current_streak integer, avatar_base_style text, last_activity_at timestamp with time zone, featured_medals jsonb, avatar_config jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return query
  with my_friends as (
    select
      case when f.requester_id = p_user_id
           then f.addressee_id
           else f.requester_id
      end as friend_id
    from public.friendships f
    where (f.requester_id = p_user_id or f.addressee_id = p_user_id)
      and f.status = 'accepted'
      and f.is_active = true
  )
  select
    mf.friend_id,
    coalesce(up.alias, split_part(u.email, '@', 1)) as name,
    coalesce(prog.streak_days, 0) as current_streak,
    av.base_style as avatar_base_style,
    la.last_activity_at,
    coalesce(med.featured_medals, '[]'::jsonb) as featured_medals,
    av.avatar_config
  from my_friends mf
  join public.users u on u.id = mf.friend_id
  left join public.user_profiles up on up.user_id = mf.friend_id
  left join public.user_progress prog on prog.user_id = mf.friend_id
  left join public.avatars av on av.user_id = mf.friend_id
  left join lateral (
    select max(rr.created_at) as last_activity_at
    from public.recycling_records rr
    where rr.user_id = mf.friend_id
      and rr.is_active = true
  ) la on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'name', a.name,
        'description', a.description,
        'image_url', r.asset_url
      ) order by a.name
    ) as featured_medals
    from public.user_featured_medals ufm
    cross join lateral unnest(ufm.achievement_ids) as t(achievement_id)
    join public.achievements a on a.id = t.achievement_id
    left join public.rewards r on r.id = a.reward_id
    where ufm.user_id = mf.friend_id
  ) med on true
  order by lower(coalesce(up.alias, split_part(u.email, '@', 1)));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.compute_streak_level(p_streak_days integer)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_friends_with_profile(p_user_id uuid)
 RETURNS TABLE(friend_id uuid, name text, current_streak integer, avatar_base_style text, last_activity_at timestamp with time zone, featured_medals jsonb, avatar_config jsonb)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'app_social'
AS $function$
  select * from app_social.get_friends_with_profile(p_user_id);
$function$
;

CREATE OR REPLACE FUNCTION public.handle_post_segregation_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  progress_record public.user_progress%ROWTYPE;
  is_first_action_today boolean := false;
  new_streak int;
  new_heat   numeric;
  new_level  int;
  heat_gain  int;
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

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;
      heat_gain  := public.heat_gain_for_level(COALESCE(progress_record.level, 1));
      new_heat   := LEAST(100, COALESCE(progress_record.heat, 50) + heat_gain);
      new_level  := GREATEST(
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
      streak_days      = new_streak,
      heat             = new_heat,
      level            = new_level,
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

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.heat_gain_for_level(p_level integer)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
  RETURN (p_level * (p_level + 1)) / 2;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.streak_level_checkpoint(p_level integer)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.test_educational_content_fetch()
 RETURNS TABLE(content_fetched boolean, categories_found integer, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.test_get_friends_with_profile_flow()
 RETURNS TABLE(friend_found boolean, has_name boolean, has_streak boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.test_handle_new_user_on_insert()
 RETURNS TABLE(user_exists boolean, profile_exists boolean, last_login_filled boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.test_handle_new_user_on_login()
 RETURNS TABLE(last_login_updated boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.test_handle_new_user_on_non_login_update()
 RETURNS TABLE(last_login_unchanged boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.test_no_duplicate_on_subsequent_login()
 RETURNS TABLE(first_login_created_user boolean, first_login_created_profile boolean, second_login_users_count integer, second_login_profiles_count integer, no_duplication boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.test_update_featured_medals_flow()
 RETURNS TABLE(created boolean, medals_updated boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.test_update_user_avatar_flow()
 RETURNS TABLE(created boolean, avatar_set boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

grant delete on table "public"."achievements" to "anon";

grant insert on table "public"."achievements" to "anon";

grant select on table "public"."achievements" to "anon";

grant update on table "public"."achievements" to "anon";

grant delete on table "public"."achievements" to "authenticated";

grant insert on table "public"."achievements" to "authenticated";

grant select on table "public"."achievements" to "authenticated";

grant update on table "public"."achievements" to "authenticated";

grant delete on table "public"."achievements" to "service_role";

grant insert on table "public"."achievements" to "service_role";

grant select on table "public"."achievements" to "service_role";

grant update on table "public"."achievements" to "service_role";

grant delete on table "public"."avatars" to "anon";

grant insert on table "public"."avatars" to "anon";

grant select on table "public"."avatars" to "anon";

grant update on table "public"."avatars" to "anon";

grant delete on table "public"."avatars" to "authenticated";

grant insert on table "public"."avatars" to "authenticated";

grant select on table "public"."avatars" to "authenticated";

grant update on table "public"."avatars" to "authenticated";

grant delete on table "public"."avatars" to "service_role";

grant insert on table "public"."avatars" to "service_role";

grant select on table "public"."avatars" to "service_role";

grant update on table "public"."avatars" to "service_role";

grant delete on table "public"."bin_types" to "anon";

grant insert on table "public"."bin_types" to "anon";

grant select on table "public"."bin_types" to "anon";

grant update on table "public"."bin_types" to "anon";

grant delete on table "public"."bin_types" to "authenticated";

grant insert on table "public"."bin_types" to "authenticated";

grant select on table "public"."bin_types" to "authenticated";

grant update on table "public"."bin_types" to "authenticated";

grant delete on table "public"."bin_types" to "service_role";

grant insert on table "public"."bin_types" to "service_role";

grant select on table "public"."bin_types" to "service_role";

grant update on table "public"."bin_types" to "service_role";

grant delete on table "public"."cached_resources" to "anon";

grant insert on table "public"."cached_resources" to "anon";

grant select on table "public"."cached_resources" to "anon";

grant update on table "public"."cached_resources" to "anon";

grant delete on table "public"."cached_resources" to "authenticated";

grant insert on table "public"."cached_resources" to "authenticated";

grant select on table "public"."cached_resources" to "authenticated";

grant update on table "public"."cached_resources" to "authenticated";

grant delete on table "public"."cached_resources" to "service_role";

grant insert on table "public"."cached_resources" to "service_role";

grant select on table "public"."cached_resources" to "service_role";

grant update on table "public"."cached_resources" to "service_role";

grant delete on table "public"."campuses" to "anon";

grant insert on table "public"."campuses" to "anon";

grant select on table "public"."campuses" to "anon";

grant update on table "public"."campuses" to "anon";

grant delete on table "public"."campuses" to "authenticated";

grant insert on table "public"."campuses" to "authenticated";

grant select on table "public"."campuses" to "authenticated";

grant update on table "public"."campuses" to "authenticated";

grant delete on table "public"."campuses" to "service_role";

grant insert on table "public"."campuses" to "service_role";

grant select on table "public"."campuses" to "service_role";

grant update on table "public"."campuses" to "service_role";

grant delete on table "public"."educational_content" to "anon";

grant insert on table "public"."educational_content" to "anon";

grant select on table "public"."educational_content" to "anon";

grant update on table "public"."educational_content" to "anon";

grant delete on table "public"."educational_content" to "authenticated";

grant insert on table "public"."educational_content" to "authenticated";

grant select on table "public"."educational_content" to "authenticated";

grant update on table "public"."educational_content" to "authenticated";

grant delete on table "public"."educational_content" to "service_role";

grant insert on table "public"."educational_content" to "service_role";

grant select on table "public"."educational_content" to "service_role";

grant update on table "public"."educational_content" to "service_role";

grant delete on table "public"."friend_codes" to "anon";

grant insert on table "public"."friend_codes" to "anon";

grant select on table "public"."friend_codes" to "anon";

grant update on table "public"."friend_codes" to "anon";

grant delete on table "public"."friend_codes" to "authenticated";

grant insert on table "public"."friend_codes" to "authenticated";

grant select on table "public"."friend_codes" to "authenticated";

grant update on table "public"."friend_codes" to "authenticated";

grant delete on table "public"."friend_codes" to "service_role";

grant insert on table "public"."friend_codes" to "service_role";

grant select on table "public"."friend_codes" to "service_role";

grant update on table "public"."friend_codes" to "service_role";

grant delete on table "public"."friendships" to "anon";

grant insert on table "public"."friendships" to "anon";

grant select on table "public"."friendships" to "anon";

grant update on table "public"."friendships" to "anon";

grant delete on table "public"."friendships" to "authenticated";

grant insert on table "public"."friendships" to "authenticated";

grant select on table "public"."friendships" to "authenticated";

grant update on table "public"."friendships" to "authenticated";

grant delete on table "public"."friendships" to "service_role";

grant insert on table "public"."friendships" to "service_role";

grant select on table "public"."friendships" to "service_role";

grant update on table "public"."friendships" to "service_role";

grant delete on table "public"."fun_facts" to "anon";

grant insert on table "public"."fun_facts" to "anon";

grant select on table "public"."fun_facts" to "anon";

grant update on table "public"."fun_facts" to "anon";

grant delete on table "public"."fun_facts" to "authenticated";

grant insert on table "public"."fun_facts" to "authenticated";

grant select on table "public"."fun_facts" to "authenticated";

grant update on table "public"."fun_facts" to "authenticated";

grant delete on table "public"."fun_facts" to "service_role";

grant insert on table "public"."fun_facts" to "service_role";

grant select on table "public"."fun_facts" to "service_role";

grant update on table "public"."fun_facts" to "service_role";

grant delete on table "public"."health_check" to "anon";

grant insert on table "public"."health_check" to "anon";

grant select on table "public"."health_check" to "anon";

grant update on table "public"."health_check" to "anon";

grant delete on table "public"."health_check" to "authenticated";

grant insert on table "public"."health_check" to "authenticated";

grant select on table "public"."health_check" to "authenticated";

grant update on table "public"."health_check" to "authenticated";

grant delete on table "public"."health_check" to "service_role";

grant insert on table "public"."health_check" to "service_role";

grant select on table "public"."health_check" to "service_role";

grant update on table "public"."health_check" to "service_role";

grant delete on table "public"."instruction_steps" to "anon";

grant insert on table "public"."instruction_steps" to "anon";

grant select on table "public"."instruction_steps" to "anon";

grant update on table "public"."instruction_steps" to "anon";

grant delete on table "public"."instruction_steps" to "authenticated";

grant insert on table "public"."instruction_steps" to "authenticated";

grant select on table "public"."instruction_steps" to "authenticated";

grant update on table "public"."instruction_steps" to "authenticated";

grant delete on table "public"."instruction_steps" to "service_role";

grant insert on table "public"."instruction_steps" to "service_role";

grant select on table "public"."instruction_steps" to "service_role";

grant update on table "public"."instruction_steps" to "service_role";

grant delete on table "public"."instructions" to "anon";

grant insert on table "public"."instructions" to "anon";

grant select on table "public"."instructions" to "anon";

grant update on table "public"."instructions" to "anon";

grant delete on table "public"."instructions" to "authenticated";

grant insert on table "public"."instructions" to "authenticated";

grant select on table "public"."instructions" to "authenticated";

grant update on table "public"."instructions" to "authenticated";

grant delete on table "public"."instructions" to "service_role";

grant insert on table "public"."instructions" to "service_role";

grant select on table "public"."instructions" to "service_role";

grant update on table "public"."instructions" to "service_role";

grant delete on table "public"."map_waste_type_bin_types" to "anon";

grant insert on table "public"."map_waste_type_bin_types" to "anon";

grant select on table "public"."map_waste_type_bin_types" to "anon";

grant update on table "public"."map_waste_type_bin_types" to "anon";

grant delete on table "public"."map_waste_type_bin_types" to "authenticated";

grant insert on table "public"."map_waste_type_bin_types" to "authenticated";

grant select on table "public"."map_waste_type_bin_types" to "authenticated";

grant update on table "public"."map_waste_type_bin_types" to "authenticated";

grant delete on table "public"."map_waste_type_bin_types" to "service_role";

grant insert on table "public"."map_waste_type_bin_types" to "service_role";

grant select on table "public"."map_waste_type_bin_types" to "service_role";

grant update on table "public"."map_waste_type_bin_types" to "service_role";

grant delete on table "public"."metric_snapshots" to "anon";

grant insert on table "public"."metric_snapshots" to "anon";

grant select on table "public"."metric_snapshots" to "anon";

grant update on table "public"."metric_snapshots" to "anon";

grant delete on table "public"."metric_snapshots" to "authenticated";

grant insert on table "public"."metric_snapshots" to "authenticated";

grant select on table "public"."metric_snapshots" to "authenticated";

grant update on table "public"."metric_snapshots" to "authenticated";

grant delete on table "public"."metric_snapshots" to "service_role";

grant insert on table "public"."metric_snapshots" to "service_role";

grant select on table "public"."metric_snapshots" to "service_role";

grant update on table "public"."metric_snapshots" to "service_role";

grant delete on table "public"."pending_operations" to "anon";

grant insert on table "public"."pending_operations" to "anon";

grant select on table "public"."pending_operations" to "anon";

grant update on table "public"."pending_operations" to "anon";

grant delete on table "public"."pending_operations" to "authenticated";

grant insert on table "public"."pending_operations" to "authenticated";

grant select on table "public"."pending_operations" to "authenticated";

grant update on table "public"."pending_operations" to "authenticated";

grant delete on table "public"."pending_operations" to "service_role";

grant insert on table "public"."pending_operations" to "service_role";

grant select on table "public"."pending_operations" to "service_role";

grant update on table "public"."pending_operations" to "service_role";

grant delete on table "public"."recycling_point_bins" to "anon";

grant insert on table "public"."recycling_point_bins" to "anon";

grant select on table "public"."recycling_point_bins" to "anon";

grant update on table "public"."recycling_point_bins" to "anon";

grant delete on table "public"."recycling_point_bins" to "authenticated";

grant insert on table "public"."recycling_point_bins" to "authenticated";

grant select on table "public"."recycling_point_bins" to "authenticated";

grant update on table "public"."recycling_point_bins" to "authenticated";

grant delete on table "public"."recycling_point_bins" to "service_role";

grant insert on table "public"."recycling_point_bins" to "service_role";

grant select on table "public"."recycling_point_bins" to "service_role";

grant update on table "public"."recycling_point_bins" to "service_role";

grant delete on table "public"."recycling_points" to "anon";

grant insert on table "public"."recycling_points" to "anon";

grant select on table "public"."recycling_points" to "anon";

grant update on table "public"."recycling_points" to "anon";

grant delete on table "public"."recycling_points" to "authenticated";

grant insert on table "public"."recycling_points" to "authenticated";

grant select on table "public"."recycling_points" to "authenticated";

grant update on table "public"."recycling_points" to "authenticated";

grant delete on table "public"."recycling_points" to "service_role";

grant insert on table "public"."recycling_points" to "service_role";

grant select on table "public"."recycling_points" to "service_role";

grant update on table "public"."recycling_points" to "service_role";

grant delete on table "public"."recycling_records" to "anon";

grant insert on table "public"."recycling_records" to "anon";

grant select on table "public"."recycling_records" to "anon";

grant update on table "public"."recycling_records" to "anon";

grant delete on table "public"."recycling_records" to "authenticated";

grant insert on table "public"."recycling_records" to "authenticated";

grant select on table "public"."recycling_records" to "authenticated";

grant update on table "public"."recycling_records" to "authenticated";

grant delete on table "public"."recycling_records" to "service_role";

grant insert on table "public"."recycling_records" to "service_role";

grant select on table "public"."recycling_records" to "service_role";

grant update on table "public"."recycling_records" to "service_role";

grant delete on table "public"."recycling_sessions" to "anon";

grant insert on table "public"."recycling_sessions" to "anon";

grant select on table "public"."recycling_sessions" to "anon";

grant update on table "public"."recycling_sessions" to "anon";

grant delete on table "public"."recycling_sessions" to "authenticated";

grant insert on table "public"."recycling_sessions" to "authenticated";

grant select on table "public"."recycling_sessions" to "authenticated";

grant update on table "public"."recycling_sessions" to "authenticated";

grant delete on table "public"."recycling_sessions" to "service_role";

grant insert on table "public"."recycling_sessions" to "service_role";

grant select on table "public"."recycling_sessions" to "service_role";

grant update on table "public"."recycling_sessions" to "service_role";

grant delete on table "public"."rewards" to "anon";

grant insert on table "public"."rewards" to "anon";

grant select on table "public"."rewards" to "anon";

grant update on table "public"."rewards" to "anon";

grant delete on table "public"."rewards" to "authenticated";

grant insert on table "public"."rewards" to "authenticated";

grant select on table "public"."rewards" to "authenticated";

grant update on table "public"."rewards" to "authenticated";

grant delete on table "public"."rewards" to "service_role";

grant insert on table "public"."rewards" to "service_role";

grant select on table "public"."rewards" to "service_role";

grant update on table "public"."rewards" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."system_config" to "anon";

grant insert on table "public"."system_config" to "anon";

grant select on table "public"."system_config" to "anon";

grant update on table "public"."system_config" to "anon";

grant delete on table "public"."system_config" to "authenticated";

grant insert on table "public"."system_config" to "authenticated";

grant select on table "public"."system_config" to "authenticated";

grant update on table "public"."system_config" to "authenticated";

grant delete on table "public"."system_config" to "service_role";

grant insert on table "public"."system_config" to "service_role";

grant select on table "public"."system_config" to "service_role";

grant update on table "public"."system_config" to "service_role";

grant delete on table "public"."universities" to "anon";

grant insert on table "public"."universities" to "anon";

grant select on table "public"."universities" to "anon";

grant update on table "public"."universities" to "anon";

grant delete on table "public"."universities" to "authenticated";

grant insert on table "public"."universities" to "authenticated";

grant select on table "public"."universities" to "authenticated";

grant update on table "public"."universities" to "authenticated";

grant delete on table "public"."universities" to "service_role";

grant insert on table "public"."universities" to "service_role";

grant select on table "public"."universities" to "service_role";

grant update on table "public"."universities" to "service_role";

grant delete on table "public"."user_achievements" to "anon";

grant insert on table "public"."user_achievements" to "anon";

grant select on table "public"."user_achievements" to "anon";

grant update on table "public"."user_achievements" to "anon";

grant delete on table "public"."user_achievements" to "authenticated";

grant insert on table "public"."user_achievements" to "authenticated";

grant select on table "public"."user_achievements" to "authenticated";

grant update on table "public"."user_achievements" to "authenticated";

grant delete on table "public"."user_achievements" to "service_role";

grant insert on table "public"."user_achievements" to "service_role";

grant select on table "public"."user_achievements" to "service_role";

grant update on table "public"."user_achievements" to "service_role";

grant delete on table "public"."user_featured_medals" to "anon";

grant insert on table "public"."user_featured_medals" to "anon";

grant select on table "public"."user_featured_medals" to "anon";

grant update on table "public"."user_featured_medals" to "anon";

grant delete on table "public"."user_featured_medals" to "authenticated";

grant insert on table "public"."user_featured_medals" to "authenticated";

grant select on table "public"."user_featured_medals" to "authenticated";

grant update on table "public"."user_featured_medals" to "authenticated";

grant delete on table "public"."user_featured_medals" to "service_role";

grant insert on table "public"."user_featured_medals" to "service_role";

grant select on table "public"."user_featured_medals" to "service_role";

grant update on table "public"."user_featured_medals" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

grant delete on table "public"."user_progress" to "anon";

grant insert on table "public"."user_progress" to "anon";

grant select on table "public"."user_progress" to "anon";

grant update on table "public"."user_progress" to "anon";

grant delete on table "public"."user_progress" to "authenticated";

grant insert on table "public"."user_progress" to "authenticated";

grant select on table "public"."user_progress" to "authenticated";

grant update on table "public"."user_progress" to "authenticated";

grant delete on table "public"."user_progress" to "service_role";

grant insert on table "public"."user_progress" to "service_role";

grant select on table "public"."user_progress" to "service_role";

grant update on table "public"."user_progress" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."user_settings" to "anon";

grant insert on table "public"."user_settings" to "anon";

grant select on table "public"."user_settings" to "anon";

grant update on table "public"."user_settings" to "anon";

grant delete on table "public"."user_settings" to "authenticated";

grant insert on table "public"."user_settings" to "authenticated";

grant select on table "public"."user_settings" to "authenticated";

grant update on table "public"."user_settings" to "authenticated";

grant delete on table "public"."user_settings" to "service_role";

grant insert on table "public"."user_settings" to "service_role";

grant select on table "public"."user_settings" to "service_role";

grant update on table "public"."user_settings" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."waste_types" to "anon";

grant insert on table "public"."waste_types" to "anon";

grant select on table "public"."waste_types" to "anon";

grant update on table "public"."waste_types" to "anon";

grant delete on table "public"."waste_types" to "authenticated";

grant insert on table "public"."waste_types" to "authenticated";

grant select on table "public"."waste_types" to "authenticated";

grant update on table "public"."waste_types" to "authenticated";

grant delete on table "public"."waste_types" to "service_role";

grant insert on table "public"."waste_types" to "service_role";

grant select on table "public"."waste_types" to "service_role";

grant update on table "public"."waste_types" to "service_role";


  create policy "lectura bins usuarios logueados"
  on "public"."recycling_point_bins"
  as permissive
  for select
  to authenticated
using (true);



  create policy "lectura puntos usuarios logueados"
  on "public"."recycling_points"
  as permissive
  for select
  to authenticated
using (true);



  create policy "insertar registros propios"
  on "public"."recycling_records"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "leer registros propios"
  on "public"."recycling_records"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


