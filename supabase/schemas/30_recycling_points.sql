-- Recycling map, points and local/offline support.

CREATE TABLE IF NOT EXISTS "public"."cached_resources" (
    "resource_name" "text" NOT NULL,
    "last_synced_at" timestamp with time zone,
    "version" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."map_waste_type_bin_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" "uuid" NOT NULL,
    "waste_type_id" "uuid" NOT NULL,
    "bin_type_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."pending_operations" (
    "local_id" "text" NOT NULL,
    "user_id" "uuid",
    "operation_type" "text" NOT NULL,
    "payload_json" "text",
    "status" "text" NOT NULL,
    "retry_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "last_error" "text",
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."recycling_point_bins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recycling_point_id" "uuid" NOT NULL,
    "bin_type_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."recycling_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campus_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "latitude" numeric(9,6) NOT NULL,
    "longitude" numeric(9,6) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."cached_resources" OWNER TO "postgres";

ALTER TABLE "public"."map_waste_type_bin_types" OWNER TO "postgres";

ALTER TABLE "public"."pending_operations" OWNER TO "postgres";

ALTER TABLE "public"."recycling_point_bins" OWNER TO "postgres";

ALTER TABLE "public"."recycling_points" OWNER TO "postgres";

ALTER TABLE "public"."cached_resources" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."map_waste_type_bin_types" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pending_operations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."recycling_point_bins" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."recycling_points" ENABLE ROW LEVEL SECURITY;
