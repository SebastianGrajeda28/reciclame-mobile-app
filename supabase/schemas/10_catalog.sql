-- Catalog and reference data tables.

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

ALTER TABLE "public"."avatars" OWNER TO "postgres";

ALTER TABLE "public"."bin_types" OWNER TO "postgres";

ALTER TABLE "public"."campuses" OWNER TO "postgres";

ALTER TABLE "public"."rewards" OWNER TO "postgres";

ALTER TABLE "public"."roles" OWNER TO "postgres";

ALTER TABLE "public"."universities" OWNER TO "postgres";

ALTER TABLE "public"."waste_types" OWNER TO "postgres";

ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."avatars" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."bin_types" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."campuses" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."rewards" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."universities" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."waste_types" ENABLE ROW LEVEL SECURITY;
