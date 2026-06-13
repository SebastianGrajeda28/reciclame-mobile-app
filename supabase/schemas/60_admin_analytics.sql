-- Admin-facing analytics and operational configuration.

CREATE TABLE IF NOT EXISTS "public"."health_check" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."metric_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_name" "text" NOT NULL,
    "metric_value" numeric NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."system_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."health_check" OWNER TO "postgres";

ALTER TABLE "public"."metric_snapshots" OWNER TO "postgres";

ALTER TABLE "public"."system_config" OWNER TO "postgres";

ALTER TABLE "public"."metric_snapshots" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."system_config" ENABLE ROW LEVEL SECURITY;
