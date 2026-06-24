-- User profile state and presentation-facing configuration.
-- Includes user profiles, settings, avatars and profile RPCs.

CREATE TABLE IF NOT EXISTS "public"."avatars" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "base_style" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "avatar_config" "jsonb"
);

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

CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notifications_enabled" boolean DEFAULT true NOT NULL,
    "skip_recycling_instructions" boolean DEFAULT false NOT NULL,
    "profile_visibility" "text",
    "language" "text",
    "location_verification_enabled" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."avatars" OWNER TO "postgres";

ALTER TABLE "public"."user_profiles" OWNER TO "postgres";

ALTER TABLE "public"."user_settings" OWNER TO "postgres";

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION "public"."save_avatar_config"("p_user_id" "uuid", "p_config" "jsonb")
  RETURNS TABLE("success" boolean, "message" "text")
  LANGUAGE "plpgsql" SECURITY DEFINER
  SET "search_path" TO 'public'
AS $$
DECLARE
  hat_key       text;
  clothes_key   text;
  hair_key      text;
  beard_key     text;
  moustache_key text;
  race_key      text := p_config->>'race';
  bg_key        text := p_config->>'bg';
  ears_key      text := p_config->>'ears';
  eyes_key      text := p_config->>'eyeStyle';
  nose_key      text := p_config->>'nose';
  mouth_key     text := p_config->>'mouth';
  brows_key     text;
  invalid_items text[] := '{}';
  locked_items  text[] := '{}';
  r             RECORD;
BEGIN
  hat_key       := CASE WHEN p_config->>'hat'       IS NOT NULL THEN reverse(split_part(reverse(p_config->>'hat'),       '_', 1)) ELSE NULL END;
  clothes_key   := CASE WHEN p_config->>'clothes'   IS NOT NULL THEN reverse(split_part(reverse(p_config->>'clothes'),   '_', 1)) ELSE NULL END;
  hair_key      := CASE WHEN p_config->>'hair'      IS NOT NULL THEN reverse(split_part(reverse(p_config->>'hair'),      '_', 1)) ELSE NULL END;
  beard_key     := CASE WHEN p_config->>'beard'     IS NOT NULL THEN reverse(split_part(reverse(p_config->>'beard'),     '_', 1)) ELSE NULL END;
  moustache_key := CASE WHEN p_config->>'moustache' IS NOT NULL THEN reverse(split_part(reverse(p_config->>'moustache'), '_', 1)) ELSE NULL END;
  brows_key     := CASE WHEN p_config->>'brows'     IS NOT NULL THEN regexp_replace(p_config->>'brows', '^[^_]+_', '') ELSE NULL END;
  bg_key        := regexp_replace(COALESCE(p_config->>'bg', ''), '^light_', '');

  IF race_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'race' AND item_key = race_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'race:' || race_key);
  END IF;
  IF bg_key IS NOT NULL AND bg_key <> '' AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'bg' AND item_key = bg_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'bg:' || bg_key);
  END IF;
  IF ears_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'ears' AND item_key = ears_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'ears:' || ears_key);
  END IF;
  IF eyes_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'eyes' AND item_key = eyes_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'eyes:' || eyes_key);
  END IF;
  IF nose_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'nose' AND item_key = nose_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'nose:' || nose_key);
  END IF;
  IF mouth_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'mouth' AND item_key = mouth_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'mouth:' || mouth_key);
  END IF;
  IF brows_key IS NOT NULL AND brows_key <> '' AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'brows' AND item_key = brows_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'brows:' || brows_key);
  END IF;
  IF hat_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'hat' AND item_key = hat_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'hat:' || hat_key);
  END IF;
  IF clothes_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'clothes' AND item_key = clothes_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'clothes:' || clothes_key);
  END IF;
  IF hair_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'hair' AND item_key = hair_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'hair:' || hair_key);
  END IF;
  IF beard_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'beard' AND item_key = beard_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'beard:' || beard_key);
  END IF;
  IF moustache_key IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rewards WHERE item_type = 'moustache' AND item_key = moustache_key AND is_active = true) THEN
    invalid_items := array_append(invalid_items, 'moustache:' || moustache_key);
  END IF;

  IF array_length(invalid_items, 1) > 0 THEN
    RETURN QUERY SELECT false, 'cosmetics_invalid:' || array_to_string(invalid_items, ',');
    RETURN;
  END IF;

  FOR r IN
    SELECT item_type, item_key, achievement_id FROM public.rewards
    WHERE is_active = true AND requires_unlock = true
      AND ((item_type = 'hat' AND item_key = hat_key) OR (item_type = 'clothes' AND item_key = clothes_key) OR
           (item_type = 'hair' AND item_key = hair_key) OR (item_type = 'beard' AND item_key = beard_key) OR
           (item_type = 'moustache' AND item_key = moustache_key))
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = r.achievement_id AND ua.is_active = true) THEN
      locked_items := array_append(locked_items, r.item_type || ':' || r.item_key);
    END IF;
  END LOOP;

  IF array_length(locked_items, 1) > 0 THEN
    RETURN QUERY SELECT false, 'cosmetics_not_unlocked:' || array_to_string(locked_items, ',');
    RETURN;
  END IF;

  INSERT INTO public.avatars (user_id, avatar_config, updated_at)
  VALUES (p_user_id, p_config, now())
  ON CONFLICT (user_id) DO UPDATE SET avatar_config = EXCLUDED.avatar_config, updated_at = now();

  RETURN QUERY SELECT true, 'avatar_saved';
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_avatar_config(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_avatar_config(uuid, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION "app_profile"."get_profile_summary"("p_user_id" "uuid") RETURNS TABLE("total_weight_kg" numeric, "total_items" bigint, "member_since" timestamp with time zone, "achievements_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;

CREATE OR REPLACE FUNCTION "public"."get_profile_summary"("p_user_id" "uuid") RETURNS TABLE("total_weight_kg" numeric, "total_items" bigint, "member_since" timestamp with time zone, "achievements_count" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_profile'
    AS $$
  select * from app_profile.get_profile_summary(p_user_id);
$$;

ALTER TABLE "public"."avatars" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avatars_select_own" ON "public"."avatars" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "avatars_insert_own" ON "public"."avatars" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "avatars_update_own" ON "public"."avatars" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "user_profiles_select_authenticated" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "user_profiles_update_own" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "user_settings_select_own" ON "public"."user_settings" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "user_settings_insert_own" ON "public"."user_settings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "user_settings_update_own" ON "public"."user_settings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));

GRANT USAGE ON SCHEMA "app_profile" TO "service_role";

REVOKE ALL ON FUNCTION "app_profile"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") FROM PUBLIC;

GRANT ALL ON FUNCTION "app_profile"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "service_role";

REVOKE ALL ON FUNCTION "app_profile"."get_profile_summary"("p_user_id" "uuid") FROM PUBLIC;

GRANT ALL ON FUNCTION "app_profile"."get_profile_summary"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_profile_summary"("p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."get_profile_summary"("p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_profile_summary"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON TABLE "public"."avatars" TO "anon";

GRANT ALL ON TABLE "public"."avatars" TO "authenticated";

GRANT ALL ON TABLE "public"."avatars" TO "service_role";

GRANT ALL ON TABLE "public"."user_profiles" TO "anon";

GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";

GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";

GRANT ALL ON TABLE "public"."user_settings" TO "anon";

GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";

GRANT ALL ON TABLE "public"."user_settings" TO "service_role";
