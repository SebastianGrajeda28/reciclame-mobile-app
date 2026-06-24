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
    "heat" numeric,
    "level" integer DEFAULT 1 NOT NULL,
    "last_recycling_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    -- Escudos disponibles para recuperar la racha (#256/#257/RF-052). Tope = nivel-1.
    "recoveries" integer DEFAULT 0 NOT NULL,
    -- Instante en que la racha murió; abre la ventana de 48h para recuperar (#259/RF-054).
    "streak_expired_at" timestamp with time zone,
    -- Días reales de racha al morir, para restaurarlos con honestidad al recuperar (#258/RF-053).
    "streak_days_at_death" integer,
    CONSTRAINT "user_progress_recoveries_check" CHECK (("recoveries" >= 0))
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
    -- Al morir la racha (heat-30<=0) con escudos disponibles, sella la marca de muerte
    -- que abre la ventana de 48h. Guard de idempotencia: solo si aún no estaba sellada,
    -- para que cron y lectura (get_progress_with_decay) no se pisen ni reabran la ventana (#259/RF-054).
    streak_expired_at = CASE
                          WHEN heat - 30 <= 0 AND recoveries > 0 AND streak_expired_at IS NULL THEN now()
                          ELSE streak_expired_at
                        END,
    -- Guarda los días reales pre-muerte para restaurarlos al recuperar (#258/RF-053),
    -- bajo el mismo guard de idempotencia y antes de aplicar el checkpoint del nivel.
    streak_days_at_death = CASE
                             WHEN heat - 30 <= 0 AND recoveries > 0 AND streak_expired_at IS NULL THEN streak_days
                             ELSE streak_days_at_death
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

CREATE OR REPLACE FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") RETURNS TABLE("streak_days" integer, "heat" integer, "level" integer, "last_recycling_date" "date", "recoveries" integer, "recoverable_until" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  rec                 public.user_progress%ROWTYPE;
  days_missed         int := 0;
  effective_heat      int;
  effective_streak    int;
  just_died           boolean := false;
  out_expired_at      timestamptz;
  out_recoverable_until timestamptz;
BEGIN
  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 1, NULL::date, 0, NULL::timestamptz;
    RETURN;
  END IF;

  out_expired_at := rec.streak_expired_at;

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
      just_died        := true;
      effective_heat   := 50;
      effective_streak := public.streak_level_checkpoint(COALESCE(rec.level, 1));
      -- Sella la marca de muerte (abre la ventana de 48h) solo si hay escudos y aún no
      -- estaba sellada. Mismo guard de idempotencia que el cron para que no se pisen (#259/RF-054).
      IF COALESCE(rec.recoveries, 0) > 0 AND rec.streak_expired_at IS NULL THEN
        out_expired_at := now();
      END IF;
    END IF;

    UPDATE public.user_progress
    SET
      heat        = effective_heat,
      streak_days = effective_streak,
      -- Sella días reales pre-muerte + marca temporal bajo el guard de idempotencia.
      streak_days_at_death = CASE
                               WHEN just_died AND COALESCE(rec.recoveries, 0) > 0 AND rec.streak_expired_at IS NULL
                                 THEN COALESCE(rec.streak_days, 0)
                               ELSE streak_days_at_death
                             END,
      streak_expired_at    = out_expired_at,
      updated_at  = now()
    WHERE user_id = p_user_id;
  END IF;

  -- recoverable_until = streak_expired_at + 48h, solo si hay escudos y la ventana sigue abierta;
  -- NULL en cualquier otro caso para que el cliente nunca ofrezca recuperar fuera de ventana (#259/RF-054).
  IF out_expired_at IS NOT NULL
     AND COALESCE(rec.recoveries, 0) > 0
     AND now() < out_expired_at + interval '48 hours' THEN
    out_recoverable_until := out_expired_at + interval '48 hours';
  ELSE
    out_recoverable_until := NULL;
  END IF;

  RETURN QUERY SELECT
    effective_streak,
    effective_heat,
    COALESCE(rec.level, 1),
    rec.last_recycling_date,
    COALESCE(rec.recoveries, 0),
    out_recoverable_until;
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
  raw_heat numeric;
  new_recoveries int;
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

    new_recoveries := COALESCE(progress_record.recoveries, 0);

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;

      heat_gain := public.heat_gain_for_level(COALESCE(progress_record.level, 1));
      -- Calor crudo (antes del clamp): si excede el tope, el exceso del día se convierte
      -- en 1 escudo (#256/RF-051). Es por DÍA (la rama is_first_action_today corre 1x/día),
      -- no por magnitud del exceso. 100% silencioso: sin notificación ni evento.
      raw_heat  := COALESCE(progress_record.heat, 50) + heat_gain;
      new_heat  := LEAST(100, raw_heat);

      new_level := public.compute_streak_level(new_streak);

      -- Gana +1 escudo si el calor del día excede el tope, respetando el tope nivel-1
      -- (#257/RF-052). El exceso adicional se descarta sin error.
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
      streak_days        = new_streak,
      heat               = new_heat,
      level              = new_level,
      recoveries         = new_recoveries,
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

CREATE OR REPLACE FUNCTION "public"."recover_streak"("p_user_id" "uuid") RETURNS TABLE("success" boolean, "streak_days" integer, "heat" integer, "level" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  rec               public.user_progress%ROWTYPE;
  restored_streak   int;
BEGIN
  -- SEGURIDAD P0 (anti-IDOR): SECURITY DEFINER BYPASA RLS en su cuerpo. La autorización la
  -- da este CHECK EXPLÍCITO, no RLS. Sin él, cualquier usuario autenticado podría recuperar
  -- la racha de OTRO pasando su p_user_id (mismo patrón vulnerable que save_avatar_config, #174).
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true
  FOR UPDATE;

  -- Validaciones server-side (no confiar en el cliente): debe haber escudo, racha muerta
  -- sellada y dentro de la ventana de 48h (#259/RF-054). Si falla, no muta y devuelve success=false.
  IF NOT FOUND
     OR COALESCE(rec.recoveries, 0) <= 0
     OR rec.streak_expired_at IS NULL
     OR now() >= rec.streak_expired_at + interval '48 hours' THEN
    RETURN QUERY SELECT false, COALESCE(rec.streak_days, 0), COALESCE(rec.heat, 0)::int, COALESCE(rec.level, 1);
    RETURN;
  END IF;

  -- Restaura los DÍAS REALES sellados al morir (no el piso del nivel), conservando el nivel (#258/RF-053).
  restored_streak := COALESCE(rec.streak_days_at_death, public.streak_level_checkpoint(COALESCE(rec.level, 1)));

  UPDATE public.user_progress
  SET
    recoveries           = recoveries - 1,
    heat                 = 50,
    streak_days          = restored_streak,
    streak_expired_at    = NULL,
    streak_days_at_death = NULL,
    updated_at           = now()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, restored_streak, 50, COALESCE(rec.level, 1);
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

GRANT ALL ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "anon";

GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "service_role";

GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."recover_streak"("p_user_id" "uuid") FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."recover_streak"("p_user_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."recover_streak"("p_user_id" "uuid") TO "service_role";

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
