-- Shared catalog data used across the platform.
-- Universities, campuses, waste types, bin types, roles, rewards and achievements.

CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "condition_type" "text",
    "condition_value" integer,
    "reward_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."bin_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" "uuid",
    "name" "text" NOT NULL,
    "color" "text",
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."campuses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "reward_type" "text",
    "asset_url" "text",
    "item_key" "text",
    "item_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."universities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."waste_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "estimated_weight_g" numeric DEFAULT 50 NOT NULL
);

ALTER TABLE "public"."achievements" OWNER TO "postgres";

ALTER TABLE "public"."bin_types" OWNER TO "postgres";

ALTER TABLE "public"."campuses" OWNER TO "postgres";

ALTER TABLE "public"."rewards" OWNER TO "postgres";

ALTER TABLE "public"."roles" OWNER TO "postgres";

ALTER TABLE "public"."universities" OWNER TO "postgres";

ALTER TABLE "public"."waste_types" OWNER TO "postgres";

ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."bin_types"
    ADD CONSTRAINT "bin_types_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."campuses"
    ADD CONSTRAINT "campuses_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."universities"
    ADD CONSTRAINT "universities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."waste_types"
    ADD CONSTRAINT "waste_types_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."bin_types"
    ADD CONSTRAINT "bin_types_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."campuses"
    ADD CONSTRAINT "campuses_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE CASCADE;

ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."bin_types" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."campuses" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."rewards" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."universities" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."waste_types" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select_active_authenticated" ON "public"."roles" FOR SELECT TO "authenticated" USING (("is_active" = true));

CREATE POLICY "waste_types_select_active_authenticated" ON "public"."waste_types" FOR SELECT TO "authenticated" USING (("is_active" = true));

GRANT ALL ON TABLE "public"."achievements" TO "anon";

GRANT ALL ON TABLE "public"."achievements" TO "authenticated";

GRANT ALL ON TABLE "public"."achievements" TO "service_role";

GRANT ALL ON TABLE "public"."bin_types" TO "anon";

GRANT ALL ON TABLE "public"."bin_types" TO "authenticated";

GRANT ALL ON TABLE "public"."bin_types" TO "service_role";

GRANT ALL ON TABLE "public"."campuses" TO "anon";

GRANT ALL ON TABLE "public"."campuses" TO "authenticated";

GRANT ALL ON TABLE "public"."campuses" TO "service_role";

GRANT ALL ON TABLE "public"."rewards" TO "anon";

GRANT ALL ON TABLE "public"."rewards" TO "authenticated";

GRANT ALL ON TABLE "public"."rewards" TO "service_role";

GRANT ALL ON TABLE "public"."roles" TO "anon";

GRANT ALL ON TABLE "public"."roles" TO "authenticated";

GRANT ALL ON TABLE "public"."roles" TO "service_role";

GRANT ALL ON TABLE "public"."universities" TO "anon";

GRANT ALL ON TABLE "public"."universities" TO "authenticated";

GRANT ALL ON TABLE "public"."universities" TO "service_role";

GRANT ALL ON TABLE "public"."waste_types" TO "anon";

GRANT ALL ON TABLE "public"."waste_types" TO "authenticated";

GRANT ALL ON TABLE "public"."waste_types" TO "service_role";
