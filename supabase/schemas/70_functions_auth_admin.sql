-- Public and compatibility functions for auth/admin/profile contracts.

CREATE OR REPLACE FUNCTION "public"."count_public_tables"() RETURNS TABLE("table_name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
$$;

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

create or replace function app_auth.get_current_account()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_name text;
  v_role text;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  select u.email
  into v_email
  from public.users u
  where u.id = v_uid;

  select coalesce(au.raw_user_meta_data ->> 'full_name', au.email), au.email
  into v_name, v_email
  from auth.users au
  where au.id = v_uid;

  select r.name
  into v_role
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = v_uid
    and ur.is_active = true
    and r.is_active = true
  order by ur.assigned_at desc nulls last, ur.created_at desc nulls last
  limit 1;

  return jsonb_build_object(
    'id', v_uid,
    'email', coalesce(v_email, ''),
    'name', coalesce(v_name, v_email, ''),
    'role', v_role
  );
end;
$$;

create or replace function public.get_current_account()
returns jsonb
language sql
security definer
set search_path = public, auth, app_auth
as $$
  select app_auth.get_current_account();
$$;

create or replace function app_admin.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and r.is_active = true
      and r.name = 'ADMIN'
  );
$$;

create or replace function app_profile.update_user_avatar(p_user_id uuid, p_reward_id uuid)
returns table(success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  asset text;
begin
  if not exists (select 1 from public.rewards where id = p_reward_id) then
    return query select false, 'reward_not_found';
    return;
  end if;

  if not exists (select 1 from public.user_rewards where user_id = p_user_id and reward_id = p_reward_id) then
    return query select false, 'reward_not_unlocked';
    return;
  end if;

  select asset_url into asset from public.rewards where id = p_reward_id;

  insert into public.avatars (user_id, base_style, updated_at)
  values (p_user_id, asset, now())
  on conflict (user_id) do update set
    base_style = excluded.base_style,
    updated_at = now();

  return query select true, 'avatar_updated';
end;
$$;

create or replace function app_auth.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  user_name text;
begin
  insert into public.users (id, email, last_login_at)
  values (new.id, new.email, now())
  on conflict (id) do update set
    last_login_at = case
      when new.last_sign_in_at is distinct from old.last_sign_in_at then clock_timestamp()
      else public.users.last_login_at
    end;

  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  insert into public.user_profiles (user_id, alias)
  values (new.id, user_name)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public, auth, app_admin
stable
as $$
  select app_admin.is_current_user_admin();
$$;

drop trigger if exists on_auth_user_created on auth.users;
