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

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_bin_type_id_fkey" FOREIGN KEY ("bin_type_id") REFERENCES "public"."bin_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_recycling_point_id_fkey" FOREIGN KEY ("recycling_point_id") REFERENCES "public"."recycling_points"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_final_waste_type_id_fkey" FOREIGN KEY ("final_waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_predicted_waste_type_id_fkey" FOREIGN KEY ("predicted_waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_recycling_point_id_fkey" FOREIGN KEY ("recycling_point_id") REFERENCES "public"."recycling_points"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_recycling_record_id_fkey" FOREIGN KEY ("recycling_record_id") REFERENCES "public"."recycling_records"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE "public"."recycling_records" ENABLE ROW LEVEL SECURITY;
