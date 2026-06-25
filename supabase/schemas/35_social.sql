-- Social graph and friend discovery state.
-- Includes friend codes, friendships and social RPCs.

CREATE TABLE IF NOT EXISTS "public"."friend_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

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

ALTER TABLE "public"."friend_codes" OWNER TO "postgres";

ALTER TABLE "public"."friendships" OWNER TO "postgres";

ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_code_key" UNIQUE ("code");

ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE INDEX "idx_friend_codes_code" ON "public"."friend_codes" USING "btree" ("code");

CREATE INDEX "idx_friendships_addressee" ON "public"."friendships" USING "btree" ("addressee_id");

CREATE INDEX "idx_friendships_requester" ON "public"."friendships" USING "btree" ("requester_id");

CREATE INDEX "idx_friendships_status" ON "public"."friendships" USING "btree" ("status");

CREATE UNIQUE INDEX "uq_friendships_pair" ON "public"."friendships" USING "btree" ("user_low", "user_high");

CREATE OR REPLACE FUNCTION "app_social"."get_friends_with_profile"("p_user_id" "uuid") RETURNS TABLE("friend_id" "uuid", "name" "text", "current_streak" integer, "avatar_base_style" "text", "last_activity_at" timestamp with time zone, "featured_medals" "jsonb", "avatar_config" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
        'slug', a.slug,
        'name', a.name,
        'description', a.description
      ) order by a.name
    ) as featured_medals
    from public.user_featured_medals ufm
    cross join lateral unnest(ufm.achievement_ids) as t(achievement_id)
    join public.achievements a on a.id = t.achievement_id
    where ufm.user_id = mf.friend_id
  ) med on true
  order by lower(coalesce(up.alias, split_part(u.email, '@', 1)));
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") RETURNS TABLE("friend_id" "uuid", "name" "text", "current_streak" integer, "avatar_base_style" "text", "last_activity_at" timestamp with time zone, "featured_medals" "jsonb", "avatar_config" "jsonb")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_social'
    AS $$
  select * from app_social.get_friends_with_profile(p_user_id);
$$;

ALTER TABLE "public"."friend_codes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friend_codes_select_own" ON "public"."friend_codes" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "friendships_select_own" ON "public"."friendships" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "addressee_id"));

CREATE OR REPLACE FUNCTION "app_social"."get_my_friend_code"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_attempts int := 0;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  select code into v_code
  from public.friend_codes
  where user_id = v_uid
    and is_active = true
    and (expires_at is null or expires_at > now())
  limit 1;
  if v_code is not null then
    return v_code;
  end if;

  loop
    v_attempts := v_attempts + 1;
    v_code := lpad((floor(random() * 100000000))::bigint::text, 8, '0');
    begin
      insert into public.friend_codes (user_id, code)
      values (v_uid, v_code)
      on conflict (user_id) do nothing
      returning code into v_code;
      if v_code is not null then return v_code; end if;
      select code into v_code from public.friend_codes where user_id = v_uid limit 1;
      if v_code is not null then return v_code; end if;
    exception when unique_violation then
      if v_attempts >= 10 then raise exception 'could not generate unique friend code'; end if;
    end;
  end loop;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_my_friend_code"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_social'
    AS $$
  select app_social.get_my_friend_code();
$$;

GRANT USAGE ON SCHEMA "app_social" TO "service_role";

REVOKE ALL ON FUNCTION "app_social"."get_friends_with_profile"("p_user_id" "uuid") FROM PUBLIC;

GRANT ALL ON FUNCTION "app_social"."get_friends_with_profile"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "service_role";

REVOKE ALL ON FUNCTION "app_social"."get_my_friend_code"() FROM PUBLIC;

GRANT ALL ON FUNCTION "app_social"."get_my_friend_code"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_my_friend_code"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_my_friend_code"() TO "service_role";

CREATE OR REPLACE FUNCTION "app_social"."add_friend_by_code"("p_code" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_code text := nullif(btrim(p_code), '');
  v_friend_id uuid;
  v_friendship_id uuid;
  v_existing_status text;
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
    insert into public.friendships (requester_id, addressee_id, status)
    values (v_uid, v_friend_id, 'pending')
    returning id into v_friendship_id;
    v_created := true;
  exception when unique_violation then
    select id, status into v_friendship_id, v_existing_status
    from public.friendships
    where user_low = least(v_uid, v_friend_id) and user_high = greatest(v_uid, v_friend_id)
    limit 1;

    if v_existing_status = 'declined' then
      update public.friendships
      set status = 'pending',
          requester_id = v_uid,
          addressee_id = v_friend_id,
          responded_at = null,
          updated_at = now()
      where id = v_friendship_id;
      v_created := true;
    elsif v_existing_status = 'pending' then
      raise exception 'friend request already pending';
    elsif v_existing_status = 'accepted' then
      raise exception 'already friends';
    elsif v_existing_status = 'blocked' then
      raise exception 'user blocked';
    end if;
  end;

  return jsonb_build_object('friendship_id', v_friendship_id, 'friend_id', v_friend_id, 'created', v_created);
end;
$$;

CREATE OR REPLACE FUNCTION "public"."add_friend_by_code"("p_code" "text") RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_social'
    AS $$ select app_social.add_friend_by_code(p_code); $$;

REVOKE ALL ON FUNCTION "app_social"."add_friend_by_code"("p_code" "text") FROM PUBLIC;

GRANT ALL ON FUNCTION "app_social"."add_friend_by_code"("p_code" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."add_friend_by_code"("p_code" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."add_friend_by_code"("p_code" "text") TO "service_role";

CREATE OR REPLACE FUNCTION "app_social"."get_pending_friend_requests"()
RETURNS TABLE(
  "friendship_id"   "uuid",
  "requester_id"    "uuid",
  "name"            "text",
  "avatar_config"   "jsonb",
  "featured_medals" "jsonb",
  "created_at"      timestamp with time zone
)
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'auth'
AS $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'unauthenticated'; end if;

  return query
  select
    f.id as friendship_id,
    f.requester_id,
    coalesce(up.alias, split_part(u.email, '@', 1)) as name,
    av.avatar_config,
    coalesce(med.featured_medals, '[]'::jsonb) as featured_medals,
    f.created_at
  from public.friendships f
  join public.users u on u.id = f.requester_id
  left join public.user_profiles up on up.user_id = f.requester_id
  left join public.avatars av on av.user_id = f.requester_id
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'slug', a.slug,
        'name', a.name,
        'description', a.description
      ) order by a.name
    ) as featured_medals
    from public.user_featured_medals ufm
    cross join lateral unnest(ufm.achievement_ids) as t(achievement_id)
    join public.achievements a on a.id = t.achievement_id
    where ufm.user_id = f.requester_id
  ) med on true
  where f.addressee_id = v_uid
    and f.status = 'pending'
    and f.is_active = true
  order by f.created_at desc;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_pending_friend_requests"()
RETURNS TABLE(
  "friendship_id"   "uuid",
  "requester_id"    "uuid",
  "name"            "text",
  "avatar_config"   "jsonb",
  "featured_medals" "jsonb",
  "created_at"      timestamp with time zone
)
LANGUAGE "sql" SECURITY DEFINER
SET "search_path" TO 'public', 'app_social'
AS $$
  select * from app_social.get_pending_friend_requests();
$$;

REVOKE ALL ON FUNCTION "app_social"."get_pending_friend_requests"() FROM PUBLIC;
GRANT ALL ON FUNCTION "app_social"."get_pending_friend_requests"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_pending_friend_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pending_friend_requests"() TO "service_role";

CREATE OR REPLACE FUNCTION "app_social"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_new_status text;
begin
  if v_uid is null then raise exception 'unauthenticated'; end if;
  if p_action not in ('accept', 'decline') then raise exception 'invalid action'; end if;

  v_new_status := case when p_action = 'accept' then 'accepted' else 'declined' end;

  update public.friendships
  set status = v_new_status,
      responded_at = now(),
      updated_at = now()
  where id = p_friendship_id
    and addressee_id = v_uid
    and status = 'pending'
    and is_active = true;

  if not found then
    raise exception 'request not found or already responded';
  end if;

  return jsonb_build_object('friendship_id', p_friendship_id, 'action', p_action);
end;
$$;

CREATE OR REPLACE FUNCTION "public"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_social'
    AS $$ select app_social.respond_to_friend_request(p_friendship_id, p_action); $$;

REVOKE ALL ON FUNCTION "app_social"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "app_social"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."respond_to_friend_request"("p_friendship_id" "uuid", "p_action" "text") TO "service_role";

GRANT ALL ON TABLE "public"."friend_codes" TO "anon";

GRANT ALL ON TABLE "public"."friend_codes" TO "authenticated";

GRANT ALL ON TABLE "public"."friend_codes" TO "service_role";

GRANT ALL ON TABLE "public"."friendships" TO "anon";

GRANT ALL ON TABLE "public"."friendships" TO "authenticated";

GRANT ALL ON TABLE "public"."friendships" TO "service_role";
