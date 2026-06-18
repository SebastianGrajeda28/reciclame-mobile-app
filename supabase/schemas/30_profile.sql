-- User profile state and presentation-facing configuration.
-- Includes user profiles, settings, avatars and profile RPCs.

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
    ADD CONSTRAINT "avatars_accessory_reward_id_fkey" FOREIGN KEY ("accessory_reward_id") REFERENCES "public"."rewards"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_frame_reward_id_fkey" FOREIGN KEY ("frame_reward_id") REFERENCES "public"."rewards"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION "app_profile"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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

CREATE OR REPLACE FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_profile'
    AS $$
  select * from app_profile.update_user_avatar(p_user_id, p_reward_id);
$$;

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
