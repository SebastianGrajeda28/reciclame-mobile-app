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

CREATE OR REPLACE FUNCTION "public"."save_avatar_config"("p_user_id" "uuid", "p_config" "jsonb") RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  -- Style is the LAST underscore-delimited segment of the compound "color_style" key.
  -- e.g. "black_leather_cowboy" → "cowboy", "red_doublet" → "doublet"
  hat_style       text := reverse(split_part(reverse(p_config->>'hat'),        '_', 1));
  clothes_style   text := reverse(split_part(reverse(p_config->>'clothes'),    '_', 1));
  hair_style      text := reverse(split_part(reverse(p_config->>'hair'),       '_', 1));
  beard_style     text := reverse(split_part(reverse(p_config->>'beard'),      '_', 1));
  moustache_style text := reverse(split_part(reverse(p_config->>'moustache'),  '_', 1));
  locked_items   text[] := '{}';
begin
  -- hat: validate if set (config value not null/empty)
  if (p_config->>'hat') is not null and hat_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'hat' and r.item_key = hat_style
    ) then
      locked_items := array_append(locked_items, 'hat:' || hat_style);
    end if;
  end if;

  -- clothes
  if (p_config->>'clothes') is not null and clothes_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'clothes' and r.item_key = clothes_style
    ) then
      locked_items := array_append(locked_items, 'clothes:' || clothes_style);
    end if;
  end if;

  -- hair
  if (p_config->>'hair') is not null and hair_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'hair' and r.item_key = hair_style
    ) then
      locked_items := array_append(locked_items, 'hair:' || hair_style);
    end if;
  end if;

  -- beard
  if (p_config->>'beard') is not null and beard_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'beard' and r.item_key = beard_style
    ) then
      locked_items := array_append(locked_items, 'beard:' || beard_style);
    end if;
  end if;

  -- moustache
  if (p_config->>'moustache') is not null and moustache_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'moustache' and r.item_key = moustache_style
    ) then
      locked_items := array_append(locked_items, 'moustache:' || moustache_style);
    end if;
  end if;

  if array_length(locked_items, 1) > 0 then
    return query select false, 'cosmetics_not_unlocked:' || array_to_string(locked_items, ',');
    return;
  end if;

  insert into public.avatars (user_id, avatar_config, updated_at)
  values (p_user_id, p_config, now())
  on conflict (user_id) do update set
    avatar_config = excluded.avatar_config,
    updated_at    = now();

  return query select true, 'avatar_saved';
end;
$$;

GRANT EXECUTE ON FUNCTION public.save_avatar_config(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_avatar_config(uuid, jsonb) TO service_role;

ALTER TABLE "public"."avatars" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "app_profile" TO "service_role";

REVOKE ALL ON FUNCTION "app_profile"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") FROM PUBLIC;

GRANT ALL ON FUNCTION "app_profile"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "service_role";

GRANT ALL ON TABLE "public"."avatars" TO "anon";

GRANT ALL ON TABLE "public"."avatars" TO "authenticated";

GRANT ALL ON TABLE "public"."avatars" TO "service_role";

GRANT ALL ON TABLE "public"."user_profiles" TO "anon";

GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";

GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";

GRANT ALL ON TABLE "public"."user_settings" TO "anon";

GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";

GRANT ALL ON TABLE "public"."user_settings" TO "service_role";
