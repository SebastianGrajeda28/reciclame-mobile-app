-- Public gamification and progress contracts.

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

CREATE OR REPLACE FUNCTION "public"."heat_gain_for_level"("p_level" integer) RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  RETURN (p_level * (p_level + 1)) / 2;
END;
$$;

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

create or replace function app_gamification.update_featured_medals(
  p_user_id uuid,
  p_achievement_ids uuid[]
)
returns table(success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  invalid_ids uuid[];
begin
  if array_length(p_achievement_ids, 1) > 5 then
    return query select false, 'max_featured_medals_exceeded';
    return;
  end if;

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

  insert into public.user_featured_medals (user_id, achievement_ids, updated_at)
  values (p_user_id, p_achievement_ids, now())
  on conflict (user_id) do update set
    achievement_ids = excluded.achievement_ids,
    updated_at = now();

  return query select true, 'featured_medals_updated';
end;
$$;
