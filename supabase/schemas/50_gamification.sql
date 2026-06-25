-- Progression, streaks, medals and rewards logic.
-- Includes progress state, reward ownership, progression functions and trigger-driven updates.

CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_featured_medals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "max_featured_medals" CHECK (("array_length"("achievement_ids", 1) <= 5))
);

CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "points" integer DEFAULT 0 NOT NULL,
    "streak_days" integer DEFAULT 0 NOT NULL,
    "best_streak_days" integer DEFAULT 0 NOT NULL,
    "heat" numeric,
    "level" integer DEFAULT 1 NOT NULL,
    "last_recycling_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    -- Recuperación de racha (#256-259): escudos, marca de muerte y días reales pre-muerte.
    "recoveries" integer DEFAULT 0 NOT NULL,
    "streak_expired_at" timestamp with time zone,
    "streak_days_at_death" integer,
    CONSTRAINT "user_progress_recoveries_check" CHECK (("recoveries" >= 0))
);

ALTER TABLE "public"."user_achievements" OWNER TO "postgres";

ALTER TABLE "public"."user_featured_medals" OWNER TO "postgres";

ALTER TABLE "public"."user_progress" OWNER TO "postgres";

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_achievement_id_key" UNIQUE ("user_id", "achievement_id");

ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION "app_gamification"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  invalid_ids uuid[];
begin
  if array_length(p_achievement_ids, 1) > 5 then
    return query select false, 'max_featured_medals_exceeded';
    return;
  end if;

  select array_agg(t.aid)
  into invalid_ids
  from unnest(p_achievement_ids) as t(aid)
  where not exists (
    select 1 from public.user_achievements ua
    where ua.user_id = p_user_id and ua.achievement_id = t.aid
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

CREATE OR REPLACE FUNCTION "public"."app_today"() RETURNS "date"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT (now() AT TIME ZONE 'America/Lima')::date;
$$;

CREATE OR REPLACE FUNCTION "public"."apply_daily_heat_decay"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.user_progress
  SET
    heat        = CASE WHEN heat - 30 <= 0 THEN 50 ELSE heat - 30 END,
    streak_days = CASE WHEN heat - 30 <= 0 THEN 0  ELSE streak_days END,
    -- Recuperación: al morir con escudo, sella la ventana de 48h + días reales (idempotente).
    streak_expired_at = CASE
                          WHEN heat - 30 <= 0 AND recoveries > 0 AND streak_expired_at IS NULL THEN now()
                          ELSE streak_expired_at
                        END,
    streak_days_at_death = CASE
                             WHEN heat - 30 <= 0 AND recoveries > 0 AND streak_expired_at IS NULL THEN streak_days
                             ELSE streak_days_at_death
                           END,
    updated_at  = now()
  WHERE
    is_active = true
    AND streak_days > 0
    AND (last_recycling_date IS NULL OR last_recycling_date < public.app_today());
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

CREATE OR REPLACE FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") RETURNS TABLE("streak_days" integer, "heat" integer, "level" integer, "last_recycling_date" "date", "streak_expires_at" timestamp with time zone, "streak_just_expired" boolean, "recoveries" integer, "recoverable_until" timestamp with time zone, "streak_days_lost" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  rec              public.user_progress%ROWTYPE;
  days_missed      int := 0;
  effective_heat   int;
  effective_streak int;
  just_expired     boolean := false;
  today            date := public.app_today();
  expires          timestamptz;
  out_expired_at        timestamptz;
  out_recoverable_until timestamptz;
  lost_days             int;
BEGIN
  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 1, NULL::date, NULL::timestamptz, false, 0, NULL::timestamptz, NULL::int;
    RETURN;
  END IF;

  out_expired_at := rec.streak_expired_at;

  IF rec.last_recycling_date IS NOT NULL THEN
    days_missed := GREATEST(0, (today - rec.last_recycling_date) - 1);
  END IF;

  effective_heat   := COALESCE(rec.heat, 50)::int;
  effective_streak := COALESCE(rec.streak_days, 0);

  IF effective_streak > 0 AND days_missed > 0
     AND (rec.updated_at AT TIME ZONE 'America/Lima')::date < today THEN
    effective_heat := effective_heat - (30 * days_missed);

    IF effective_heat <= 0 THEN
      effective_heat   := 50;
      effective_streak := 0;
      just_expired     := true;
      -- Recuperación: al morir con escudo, abre la ventana de 48h (idempotente).
      IF COALESCE(rec.recoveries, 0) > 0 AND rec.streak_expired_at IS NULL THEN
        out_expired_at := now();
      END IF;
    END IF;

    UPDATE public.user_progress
    SET
      heat        = effective_heat,
      streak_days = effective_streak,
      -- Recuperación: sella días reales pre-muerte + marca temporal (idempotente).
      streak_days_at_death = CASE
                               WHEN just_expired AND COALESCE(rec.recoveries, 0) > 0 AND rec.streak_expired_at IS NULL
                                 THEN COALESCE(rec.streak_days, 0)
                               ELSE streak_days_at_death
                             END,
      streak_expired_at    = out_expired_at,
      updated_at  = now()
    WHERE user_id = p_user_id;
  END IF;

  IF effective_streak > 0 THEN
    expires := ((today + CEIL(effective_heat / 30.0)::int)::timestamp)
                 AT TIME ZONE 'America/Lima';
  ELSE
    expires := NULL;
  END IF;

  -- Recuperación: oferta abierta solo con escudo y dentro de la ventana de 48h.
  IF out_expired_at IS NOT NULL
     AND COALESCE(rec.recoveries, 0) > 0
     AND now() < out_expired_at + interval '48 hours' THEN
    out_recoverable_until := out_expired_at + interval '48 hours';
  ELSE
    out_recoverable_until := NULL;
  END IF;

  -- Días reales perdidos (para que la oferta muestre los días correctos, no 0): si murió en esta
  -- lectura, los pre-muerte; si ya estaba sellada, los guardados en streak_days_at_death.
  lost_days := COALESCE(rec.streak_days_at_death,
                        CASE WHEN just_expired THEN COALESCE(rec.streak_days, 0) ELSE NULL END);

  RETURN QUERY SELECT
    effective_streak,
    effective_heat,
    COALESCE(rec.level, 1),
    rec.last_recycling_date,
    expires,
    just_expired,
    COALESCE(rec.recoveries, 0),
    out_recoverable_until,
    lost_days;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") RETURNS TABLE("out_achievement_id" "uuid", "out_achievement_name" "text", "out_achievement_slug" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  up              public.user_progress%ROWTYPE;
  recycling_count integer;
  unique_waste    integer;
  pilas_count     integer;
  raee_count      integer;
  vidrio_count    integer;
  paper_count     integer;
  plastico_count  integer;
  unique_bins     integer;
  bin_plastico    integer;
  bin_raee        integer;
  bin_pilas       integer;
  unique_points   integer;
  point_bib       integer;
  overridden_count integer;
  manual_count    integer;
  friend_count    integer;

  PILAS_BIN_ID        uuid := '33333333-3333-3333-3333-000000000005';
  RAEE_BIN_ID         uuid := '33333333-3333-3333-3333-000000000006';
  PLASTIC_BIN_ID      uuid := '33333333-3333-3333-3333-000000000001';
  BIBLIOTECA_POINT_ID uuid := '22222222-2222-2222-2222-000000000001';
  PILAS_WASTE_ID      uuid := '11111111-1111-1111-1111-000000000005';
  RAEE_WASTE_ID       uuid := '11111111-1111-1111-1111-000000000006';
  VIDRIO_WASTE_ID     uuid := '11111111-1111-1111-1111-000000000004';
  PAPEL_WASTE_ID      uuid := '11111111-1111-1111-1111-000000000009';
  CARTON_WASTE_ID     uuid := '11111111-1111-1111-1111-000000000001';
  PET_WASTE_ID        uuid := '11111111-1111-1111-1111-000000000002';
  OTROS_PLASTIC_ID    uuid := '11111111-1111-1111-1111-000000000007';
BEGIN
  SELECT * INTO up FROM public.user_progress WHERE user_id = p_user_id AND is_active = true;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COUNT(*) INTO recycling_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(DISTINCT waste_type_id) INTO unique_waste FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(*) INTO pilas_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id = PILAS_WASTE_ID;
  SELECT COUNT(*) INTO raee_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id = RAEE_WASTE_ID;
  SELECT COUNT(*) INTO vidrio_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id = VIDRIO_WASTE_ID;
  SELECT COUNT(*) INTO paper_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id IN (PAPEL_WASTE_ID, CARTON_WASTE_ID);
  SELECT COUNT(*) INTO plastico_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id IN (PET_WASTE_ID, OTROS_PLASTIC_ID);
  SELECT COUNT(DISTINCT bin_type_id) INTO unique_bins FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(*) INTO bin_plastico FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND bin_type_id = PLASTIC_BIN_ID;
  SELECT COUNT(*) INTO bin_raee FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND bin_type_id = RAEE_BIN_ID;
  SELECT COUNT(*) INTO bin_pilas FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND bin_type_id = PILAS_BIN_ID;
  SELECT COUNT(DISTINCT recycling_point_id) INTO unique_points FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(*) INTO point_bib FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND recycling_point_id = BIBLIOTECA_POINT_ID;
  SELECT COUNT(*) INTO overridden_count FROM public.recycling_sessions WHERE user_id = p_user_id AND waste_type_overridden = true AND outcome = 'confirmed';
  SELECT COUNT(*) INTO manual_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND detection_type = 'manual';
  SELECT COUNT(*) INTO friend_count FROM public.friendships WHERE (requester_id = p_user_id OR addressee_id = p_user_id) AND status = 'accepted' AND is_active = true;

  -- Inline macro: insert + return newly unlocked for a given condition_type + threshold
  -- (repeated per threshold to keep the logic readable and avoid dynamic SQL)

  IF recycling_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'first_recycling' AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'first_recycling' AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.streak_days >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'streak_days' AND ach.condition_value = 7 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'streak_days' AND a.condition_value = 7 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.streak_days >= 30 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'streak_days' AND ach.condition_value = 30 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'streak_days' AND a.condition_value = 30 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.best_streak_days >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'best_streak_days' AND ach.condition_value = 7 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'best_streak_days' AND a.condition_value = 7 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.best_streak_days >= 30 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'best_streak_days' AND ach.condition_value = 30 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'best_streak_days' AND a.condition_value = 30 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'total_recycling_count' AND ach.condition_value = 10 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 100 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'total_recycling_count' AND ach.condition_value = 100 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 100 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 500 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'total_recycling_count' AND ach.condition_value = 500 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 500 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_waste >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'unique_waste_types' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_waste_types' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF pilas_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_pilas_count' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_pilas_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF raee_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_raee_count' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_raee_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF vidrio_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_vidrio_count' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_vidrio_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF paper_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_paper_count' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_paper_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF plastico_count >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_plastico_count' AND ach.condition_value = 10 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_plastico_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_bins >= 4 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'unique_bin_types' AND ach.condition_value = 4 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_bin_types' AND a.condition_value = 4 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_plastico >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'bin_type_plastico_count' AND ach.condition_value = 10 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_plastico_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_raee >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'bin_type_raee_count' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_raee_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_pilas >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'bin_type_pilas_count' AND ach.condition_value = 1 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_pilas_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_points >= 2 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'unique_recycling_points' AND ach.condition_value = 2 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_recycling_points' AND a.condition_value = 2 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_points >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'unique_recycling_points' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_recycling_points' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF point_bib >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'recycling_point_biblioteca_count' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'recycling_point_biblioteca_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF overridden_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'waste_type_overridden_count' AND ach.condition_value = 1 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_overridden_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF manual_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'manual_detection_count' AND ach.condition_value = 5 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'manual_detection_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF friend_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'friend_count' AND ach.condition_value = 1 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'friend_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF friend_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, ach.id, now(), true FROM public.achievements ach
    WHERE ach.condition_type = 'friend_count' AND ach.condition_value = 3 AND ach.is_active = true
      AND ach.id NOT IN (SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.slug FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'friend_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  RETURN;
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
  new_heat   numeric;
  new_level  int;
  heat_gain  int;
  raw_heat   numeric;
  new_recoveries int;
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

    new_recoveries := COALESCE(progress_record.recoveries, 0);

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;
      heat_gain  := public.heat_gain_for_level(COALESCE(progress_record.level, 1));
      raw_heat   := COALESCE(progress_record.heat, 50) + heat_gain;
      new_heat   := LEAST(100, raw_heat);
      new_level  := GREATEST(
        COALESCE(progress_record.level, 1),
        public.compute_streak_level(new_streak)
      );
      -- Recuperación: si el calor del día excede el tope, +1 escudo (cap nivel-1, silencioso).
      IF raw_heat > 100 THEN
        new_recoveries := LEAST(GREATEST(0, new_level - 1), new_recoveries + 1);
      END IF;
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
      recoveries       = new_recoveries,
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

  PERFORM public.check_and_unlock_achievements(NEW.user_id);

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

CREATE OR REPLACE FUNCTION "public"."recover_streak"("p_user_id" "uuid") RETURNS TABLE("success" boolean, "streak_days" integer, "heat" integer, "level" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  rec             public.user_progress%ROWTYPE;
  restored_streak int;
BEGIN
  -- P0 anti-IDOR: SECURITY DEFINER bypasa RLS; la autorización la da este check, no RLS (cf. #174).
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true
  FOR UPDATE;

  -- Validación server-side: escudo, racha muerta sellada y dentro de la ventana 48h. Si no, success=false.
  IF NOT FOUND
     OR COALESCE(rec.recoveries, 0) <= 0
     OR rec.streak_expired_at IS NULL
     OR now() >= rec.streak_expired_at + interval '48 hours' THEN
    RETURN QUERY SELECT false, COALESCE(rec.streak_days, 0), COALESCE(rec.heat, 0)::int, COALESCE(rec.level, 1);
    RETURN;
  END IF;

  -- Restaura los días reales sellados al morir (no el piso del nivel), conserva el nivel.
  restored_streak := COALESCE(rec.streak_days_at_death, public.streak_level_checkpoint(COALESCE(rec.level, 1)));

  UPDATE public.user_progress
  SET
    recoveries           = recoveries - 1,
    heat                 = 50,
    streak_days          = restored_streak,
    streak_expired_at    = NULL,
    streak_days_at_death = NULL,
    -- Arranca "fresca hoy": sin esto, get_progress volvería a matar la racha mañana por el hueco viejo.
    last_recycling_date  = public.app_today(),
    updated_at           = now()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, restored_streak, 50, COALESCE(rec.level, 1);
END;
$$;

REVOKE ALL ON FUNCTION "public"."recover_streak"("p_user_id" "uuid") FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."recover_streak"("p_user_id" "uuid") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."recover_streak"("p_user_id" "uuid") TO "service_role";

CREATE OR REPLACE FUNCTION "public"."get_streak_activity"("p_user_id" "uuid") RETURNS TABLE("streak_days" integer, "best_streak_days" integer, "recycled_today" boolean, "total_today" integer, "daily_average" numeric, "week_days" "jsonb", "heat_map" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  today         date := public.app_today();
  week_start    date;
  map_start     date;
  v_streak      int;
  v_best        int;
  v_heat        int;
  v_level       int;
  v_last_date   date;
  v_just_exp    boolean;
BEGIN
  SELECT sa.streak_days, sa.heat, sa.level, sa.last_recycling_date, sa.streak_just_expired
  INTO v_streak, v_heat, v_level, v_last_date, v_just_exp
  FROM public.get_progress_with_decay(p_user_id) sa;

  IF v_streak IS NULL THEN v_streak := 0; END IF;

  SELECT COALESCE(up.best_streak_days, 0)
  INTO v_best
  FROM public.user_progress up
  WHERE up.user_id = p_user_id;

  IF v_best IS NULL THEN v_best := 0; END IF;

  week_start := today - EXTRACT(ISODOW FROM today)::int + 1;
  map_start  := today - 27;

  RETURN QUERY
  WITH
  daily_counts AS (
    SELECT
      (rr.created_at AT TIME ZONE 'America/Lima')::date AS rec_date,
      COUNT(*)::int AS cnt
    FROM public.recycling_records rr
    WHERE rr.user_id = p_user_id
      AND rr.is_active = true
      AND (rr.created_at AT TIME ZONE 'America/Lima')::date >= map_start
      AND (rr.created_at AT TIME ZONE 'America/Lima')::date <= today
    GROUP BY rec_date
  ),
  day_series AS (
    SELECT generate_series(map_start, today, '1 day'::interval)::date AS d
  ),
  full_map AS (
    SELECT ds.d, COALESCE(dc.cnt, 0) AS cnt
    FROM day_series ds
    LEFT JOIN daily_counts dc ON dc.rec_date = ds.d
  ),
  week_series AS (
    SELECT generate_series(week_start, week_start + 6, '1 day'::interval)::date AS wd
  )
  SELECT
    v_streak::int,
    v_best::int,
    (COALESCE(v_last_date, '1900-01-01') >= today),
    COALESCE((SELECT cnt FROM full_map WHERE d = today), 0)::int,
    COALESCE(
      (SELECT ROUND(AVG(cnt)::numeric, 1) FROM full_map WHERE cnt > 0),
      0
    )::numeric,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date',     to_char(ws.wd, 'YYYY-MM-DD'),
          'recycled', EXISTS (SELECT 1 FROM daily_counts dc WHERE dc.rec_date = ws.wd)
        )
        ORDER BY ws.wd
      )
      FROM week_series ws
    ),
    (
      SELECT jsonb_agg(
        jsonb_build_object('date', to_char(fm.d, 'YYYY-MM-DD'), 'count', fm.cnt)
        ORDER BY fm.d
      )
      FROM full_map fm
    );
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_achievement_unlock_stats"() RETURNS TABLE("achievement_id" "uuid", "slug" "text", "unlocked_users" bigint, "total_users" bigint, "user_percentage" numeric)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  WITH active_users AS (
    SELECT u.id
    FROM public.users u
    WHERE u.is_active = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = u.id
          AND ur.is_active = true
      )
  ),
  totals AS (
    SELECT COUNT(*)::bigint AS total_users
    FROM active_users
  )
  SELECT
    a.id AS achievement_id,
    a.slug,
    COUNT(DISTINCT ua.user_id)::bigint AS unlocked_users,
    totals.total_users,
    ROUND(
      COUNT(DISTINCT ua.user_id)::numeric * 100
      / NULLIF(totals.total_users, 0),
      2
    ) AS user_percentage
  FROM public.achievements a
  CROSS JOIN totals
  LEFT JOIN public.user_achievements ua
    ON ua.achievement_id = a.id
   AND ua.is_active = true
  LEFT JOIN active_users au
    ON au.id = ua.user_id
  WHERE a.is_active = true
    AND a.slug IS NOT NULL
    AND (ua.user_id IS NULL OR au.id IS NOT NULL)
  GROUP BY a.id, a.slug, totals.total_users;
$$;

CREATE OR REPLACE FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_gamification'
    AS $$
  select * from app_gamification.update_featured_medals(p_user_id, p_achievement_ids);
$$;

CREATE OR REPLACE TRIGGER "on_recycling_record_created" AFTER INSERT ON "public"."recycling_records" FOR EACH ROW EXECUTE FUNCTION "public"."handle_post_segregation_progress"();

ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_select_own" ON "public"."user_achievements" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "user_progress_select_own" ON "public"."user_progress" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));

GRANT USAGE ON SCHEMA "app_gamification" TO "service_role";

REVOKE ALL ON FUNCTION "app_gamification"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) FROM PUBLIC;

GRANT ALL ON FUNCTION "app_gamification"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "service_role";

GRANT ALL ON FUNCTION "public"."apply_daily_heat_decay"() TO "anon";

GRANT ALL ON FUNCTION "public"."apply_daily_heat_decay"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."apply_daily_heat_decay"() TO "service_role";

GRANT ALL ON FUNCTION "public"."compute_streak_level"("p_streak_days" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."compute_streak_level"("p_streak_days" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."compute_streak_level"("p_streak_days" integer) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "anon";

GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "service_role";

GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."streak_level_checkpoint"("p_level" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."streak_level_checkpoint"("p_level" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."streak_level_checkpoint"("p_level" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "anon";

GRANT ALL ON FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "service_role";

GRANT ALL ON TABLE "public"."user_achievements" TO "anon";

GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";

GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";

GRANT ALL ON TABLE "public"."user_featured_medals" TO "anon";

GRANT ALL ON TABLE "public"."user_featured_medals" TO "authenticated";

GRANT ALL ON TABLE "public"."user_featured_medals" TO "service_role";

GRANT ALL ON TABLE "public"."user_progress" TO "anon";

GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";

GRANT ALL ON TABLE "public"."user_progress" TO "service_role";

GRANT ALL ON TABLE "public"."user_rewards" TO "anon";

GRANT ALL ON TABLE "public"."user_rewards" TO "authenticated";

GRANT ALL ON TABLE "public"."user_rewards" TO "service_role";

GRANT ALL ON FUNCTION "public"."app_today"() TO "anon";

GRANT ALL ON FUNCTION "public"."app_today"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."app_today"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_achievement_unlock_stats"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_achievement_unlock_stats"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_streak_activity"("p_user_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_streak_activity"("p_user_id" "uuid") TO "service_role";
