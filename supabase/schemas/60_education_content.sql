-- Educational content consumed by mobile and admin clients.
-- Includes content, instructions, fun facts, indexes, RPCs, and policies.
-- Note: instruction_steps table was dropped; steps are stored as JSON in instructions.body.

CREATE TABLE IF NOT EXISTS "public"."educational_content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "content_type" "text" NOT NULL,
    "body" "text" NOT NULL,
    "image_url" "text",
    "waste_type_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."fun_facts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "text" "text" NOT NULL,
    "waste_type_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."instructions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "image_url" "text",
    "waste_type_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."educational_content" OWNER TO "postgres";

ALTER TABLE "public"."fun_facts" OWNER TO "postgres";

ALTER TABLE "public"."instructions" OWNER TO "postgres";

ALTER TABLE ONLY "public"."educational_content"
    ADD CONSTRAINT "educational_content_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."fun_facts"
    ADD CONSTRAINT "fun_facts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."instructions"
    ADD CONSTRAINT "instructions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."educational_content"
    ADD CONSTRAINT "educational_content_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."fun_facts"
    ADD CONSTRAINT "fun_facts_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."instructions"
    ADD CONSTRAINT "instructions_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

CREATE INDEX "idx_educational_content_category_active" ON "public"."educational_content" USING "btree" ("category", "is_active") WHERE ("is_active" = true);

CREATE OR REPLACE FUNCTION "app_education"."get_educational_categories"() RETURNS TABLE("category" "text", "content_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  select 
    ec.category,
    count(*)::int as content_count
  from public.educational_content ec
  where ec.is_active = true
  group by ec.category
  order by ec.category;
end;
$$;

CREATE OR REPLACE FUNCTION "app_education"."get_educational_content_by_category"("p_category" "text") RETURNS TABLE("id" "uuid", "category" "text", "title" "text", "description" "text", "content_type" "text", "body" "text", "image_url" "text", "waste_type_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true 
    and ec.category = p_category
  order by ec.display_order, ec.created_at;
end;
$$;

CREATE OR REPLACE FUNCTION "app_education"."get_educational_content_for_sync"() RETURNS TABLE("id" "uuid", "category" "text", "title" "text", "description" "text", "content_type" "text", "body" "text", "image_url" "text", "waste_type_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true
  order by ec.category, ec.display_order, ec.created_at;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_educational_categories"() RETURNS TABLE("category" "text", "content_count" integer)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_education'
    AS $$
  select * from app_education.get_educational_categories();
$$;

CREATE OR REPLACE FUNCTION "public"."get_educational_content_by_category"("p_category" "text") RETURNS TABLE("id" "uuid", "category" "text", "title" "text", "description" "text", "content_type" "text", "body" "text", "image_url" "text", "waste_type_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_education'
    AS $$
  select * from app_education.get_educational_content_by_category(p_category);
$$;

CREATE OR REPLACE FUNCTION "public"."get_educational_content_for_sync"() RETURNS TABLE("id" "uuid", "category" "text", "title" "text", "description" "text", "content_type" "text", "body" "text", "image_url" "text", "waste_type_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'app_education'
    AS $$
  select * from app_education.get_educational_content_for_sync();
$$;

ALTER TABLE "public"."fun_facts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."instructions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fun_facts_admin_all" ON "public"."fun_facts" TO "authenticated" USING ("public"."is_current_user_admin"()) WITH CHECK ("public"."is_current_user_admin"());

CREATE POLICY "fun_facts_select_active_authenticated" ON "public"."fun_facts" FOR SELECT TO "authenticated" USING (("is_active" = true));

CREATE POLICY "instructions_admin_all" ON "public"."instructions" TO "authenticated" USING ("public"."is_current_user_admin"()) WITH CHECK ("public"."is_current_user_admin"());

CREATE POLICY "instructions_select_active_authenticated" ON "public"."instructions" FOR SELECT TO "authenticated" USING (("is_active" = true));

GRANT USAGE ON SCHEMA "app_education" TO "service_role";

REVOKE ALL ON FUNCTION "app_education"."get_educational_categories"() FROM PUBLIC;

GRANT ALL ON FUNCTION "app_education"."get_educational_categories"() TO "service_role";

REVOKE ALL ON FUNCTION "app_education"."get_educational_content_by_category"("p_category" "text") FROM PUBLIC;

GRANT ALL ON FUNCTION "app_education"."get_educational_content_by_category"("p_category" "text") TO "service_role";

REVOKE ALL ON FUNCTION "app_education"."get_educational_content_for_sync"() FROM PUBLIC;

GRANT ALL ON FUNCTION "app_education"."get_educational_content_for_sync"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_educational_categories"() TO "anon";

GRANT ALL ON FUNCTION "public"."get_educational_categories"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_educational_categories"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_educational_content_by_category"("p_category" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."get_educational_content_by_category"("p_category" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_educational_content_by_category"("p_category" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_educational_content_for_sync"() TO "anon";

GRANT ALL ON FUNCTION "public"."get_educational_content_for_sync"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_educational_content_for_sync"() TO "service_role";

GRANT ALL ON TABLE "public"."educational_content" TO "anon";

GRANT ALL ON TABLE "public"."educational_content" TO "authenticated";

GRANT ALL ON TABLE "public"."educational_content" TO "service_role";

GRANT ALL ON TABLE "public"."fun_facts" TO "anon";

GRANT ALL ON TABLE "public"."fun_facts" TO "authenticated";

GRANT ALL ON TABLE "public"."fun_facts" TO "service_role";

GRANT ALL ON TABLE "public"."instructions" TO "anon";

GRANT ALL ON TABLE "public"."instructions" TO "authenticated";

GRANT ALL ON TABLE "public"."instructions" TO "service_role";
