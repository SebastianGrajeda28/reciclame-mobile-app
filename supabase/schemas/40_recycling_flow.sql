-- Recycling sessions and confirmed recycling records.

CREATE TABLE IF NOT EXISTS "public"."recycling_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "recycling_point_id" "uuid",
    "bin_type_id" "uuid",
    "waste_type_id" "uuid",
    "detection_type" "text",
    "confidence_score" numeric,
    "estimated_weight" numeric,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."recycling_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "outcome" "text" NOT NULL,
    "furthest_step" "text" NOT NULL,
    "detection_type" "text",
    "predicted_waste_type_id" "uuid",
    "final_waste_type_id" "uuid",
    "confidence_score" numeric,
    "low_confidence" boolean GENERATED ALWAYS AS (("confidence_score" < 0.8)) STORED,
    "waste_type_overridden" boolean,
    "recycling_point_id" "uuid",
    "recycling_record_id" "uuid",
    "started_at" timestamp with time zone NOT NULL,
    "ended_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "recycling_sessions_detection_type_check" CHECK (("detection_type" = ANY (ARRAY['auto'::"text", 'manual'::"text"]))),
    CONSTRAINT "recycling_sessions_furthest_step_check" CHECK (("furthest_step" = ANY (ARRAY['camera'::"text", 'processing'::"text", 'manual'::"text", 'map'::"text", 'instructions'::"text", 'success'::"text"]))),
    CONSTRAINT "recycling_sessions_outcome_check" CHECK (("outcome" = ANY (ARRAY['confirmed'::"text", 'abandoned'::"text", 'failed'::"text"])))
);

ALTER TABLE "public"."recycling_records" OWNER TO "postgres";

ALTER TABLE "public"."recycling_sessions" OWNER TO "postgres";

ALTER TABLE "public"."recycling_records" ENABLE ROW LEVEL SECURITY;
