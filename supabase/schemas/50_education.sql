-- Educational content, instructions and fun facts.

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

CREATE TABLE IF NOT EXISTS "public"."instruction_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "instruction_id" "uuid" NOT NULL,
    "text" "text" NOT NULL,
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

ALTER TABLE "public"."instruction_steps" OWNER TO "postgres";

ALTER TABLE "public"."instructions" OWNER TO "postgres";

ALTER TABLE "public"."fun_facts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."instruction_steps" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."instructions" ENABLE ROW LEVEL SECURITY;
