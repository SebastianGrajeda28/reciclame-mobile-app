-- Identity, accounts, and administrative access control.
-- Includes public.users, user_roles, and auth/admin RPC wrappers.

CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "last_login_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."user_roles" OWNER TO "postgres";

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_id_key" UNIQUE ("user_id", "role_id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION "app_admin"."is_current_user_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
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

CREATE OR REPLACE FUNCTION "app_auth"."get_current_account"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
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

CREATE OR REPLACE FUNCTION "app_auth"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
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

CREATE OR REPLACE FUNCTION "public"."get_current_account"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_auth'
    AS $$
  select app_auth.get_current_account();
$$;

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_auth'
    AS $$
begin
  return app_auth.handle_new_user();
end;
$$;

CREATE OR REPLACE FUNCTION "public"."is_current_user_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_admin'
    AS $$
  select app_admin.is_current_user_admin();
$$;

ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_admin_all" ON "public"."roles" TO "authenticated" USING ("public"."is_current_user_admin"()) WITH CHECK ("public"."is_current_user_admin"());

CREATE POLICY "waste_types_admin_all" ON "public"."waste_types" TO "authenticated" USING ("public"."is_current_user_admin"()) WITH CHECK ("public"."is_current_user_admin"());

CREATE POLICY "user_roles_admin_all" ON "public"."user_roles" TO "authenticated" USING ("public"."is_current_user_admin"()) WITH CHECK ("public"."is_current_user_admin"());

CREATE POLICY "users_admin_all" ON "public"."users" TO "authenticated" USING ("public"."is_current_user_admin"()) WITH CHECK ("public"."is_current_user_admin"());

GRANT USAGE ON SCHEMA "app_admin" TO "service_role";

GRANT USAGE ON SCHEMA "app_auth" TO "service_role";

REVOKE ALL ON FUNCTION "app_admin"."is_current_user_admin"() FROM PUBLIC;

GRANT ALL ON FUNCTION "app_admin"."is_current_user_admin"() TO "service_role";

REVOKE ALL ON FUNCTION "app_auth"."get_current_account"() FROM PUBLIC;

GRANT ALL ON FUNCTION "app_auth"."get_current_account"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_current_account"() TO "anon";

GRANT ALL ON FUNCTION "public"."get_current_account"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_current_account"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "anon";

GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "service_role";

GRANT ALL ON TABLE "public"."user_roles" TO "anon";

GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";

GRANT ALL ON TABLE "public"."user_roles" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";

GRANT ALL ON TABLE "public"."users" TO "authenticated";

GRANT ALL ON TABLE "public"."users" TO "service_role";
