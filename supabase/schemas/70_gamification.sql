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
    "is_active" boolean DEFAULT true NOT NULL
);

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

ALTER TABLE "public"."user_achievements" OWNER TO "postgres";

ALTER TABLE "public"."user_featured_medals" OWNER TO "postgres";

ALTER TABLE "public"."user_progress" OWNER TO "postgres";

ALTER TABLE "public"."user_rewards" OWNER TO "postgres";

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

ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_user_id_reward_id_key" UNIQUE ("user_id", "reward_id");

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

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

CREATE OR REPLACE FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") RETURNS TABLE("streak_days" integer, "heat" integer, "level" integer, "last_recycling_date" "date", "streak_expires_at" timestamp with time zone, "streak_just_expired" boolean)
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
BEGIN
  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 1, NULL::date, NULL::timestamptz, false;
    RETURN;
  END IF;

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
    END IF;

    UPDATE public.user_progress
    SET
      heat        = effective_heat,
      streak_days = effective_streak,
      updated_at  = now()
    WHERE user_id = p_user_id;
  END IF;

  IF effective_streak > 0 THEN
    expires := ((today + CEIL(effective_heat / 30.0)::int)::timestamp)
                 AT TIME ZONE 'America/Lima';
  ELSE
    expires := NULL;
  END IF;

  RETURN QUERY SELECT
    effective_streak,
    effective_heat,
    COALESCE(rec.level, 1),
    rec.last_recycling_date,
    expires,
    just_expired;
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

CREATE OR REPLACE FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_gamification'
    AS $$
  select * from app_gamification.update_featured_medals(p_user_id, p_achievement_ids);
$$;

CREATE OR REPLACE TRIGGER "on_recycling_record_created" AFTER INSERT ON "public"."recycling_records" FOR EACH ROW EXECUTE FUNCTION "public"."handle_post_segregation_progress"();

ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_rewards" ENABLE ROW LEVEL SECURITY;

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

GRANT EXECUTE ON FUNCTION "public"."get_streak_activity"("p_user_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_streak_activity"("p_user_id" "uuid") TO "service_role";
