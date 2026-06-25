-- Recycling sessions and confirmed recycling records.
-- Focused on the observable recycling flow and event persistence.

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
    "is_active" boolean DEFAULT true NOT NULL,
    "heat_gained" integer
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

CREATE INDEX "idx_recycling_sessions_outcome" ON "public"."recycling_sessions" USING "btree" ("outcome");

CREATE INDEX "idx_recycling_sessions_started_at" ON "public"."recycling_sessions" USING "btree" ("started_at");

CREATE INDEX "idx_recycling_sessions_user_id" ON "public"."recycling_sessions" USING "btree" ("user_id");

ALTER TABLE "public"."recycling_records" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION "public"."confirm_segregation"("p_user_id" "uuid", "p_waste_type_id" "uuid", "p_bin_type_id" "uuid", "p_recycling_point_id" "uuid", "p_detection_type" "text" DEFAULT NULL::"text", "p_confidence_score" numeric DEFAULT NULL::numeric) RETURNS TABLE("record_id" "uuid", "streak_days" integer, "heat" integer, "level" integer, "previous_level" integer, "leveled_up" boolean, "streak_extended_today" boolean, "already_recycled_today" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  before_rec      public.user_progress%ROWTYPE;
  after_rec       public.user_progress%ROWTYPE;
  v_had_progress  boolean := false;
  v_already_today boolean := false;
  v_prev_level    int;
  v_weight        numeric;
  v_record_id     uuid;
  today           date := public.app_today();
BEGIN
  SELECT * INTO before_rec FROM public.user_progress WHERE user_id = p_user_id;
  v_had_progress := FOUND;
  v_already_today := v_had_progress
    AND before_rec.last_recycling_date IS NOT NULL
    AND before_rec.last_recycling_date >= today;
  v_prev_level := CASE WHEN v_had_progress THEN COALESCE(before_rec.level, 1) ELSE 1 END;

  SELECT estimated_weight_g INTO v_weight
  FROM public.waste_types WHERE id = p_waste_type_id;

  INSERT INTO public.recycling_records (
    user_id, waste_type_id, bin_type_id, recycling_point_id,
    detection_type, confidence_score, estimated_weight, status
  ) VALUES (
    p_user_id, p_waste_type_id, p_bin_type_id, p_recycling_point_id,
    p_detection_type, p_confidence_score, v_weight, 'confirmed'
  )
  RETURNING id INTO v_record_id;

  SELECT * INTO after_rec FROM public.user_progress WHERE user_id = p_user_id;

  UPDATE public.recycling_records
  SET heat_gained = GREATEST(0, COALESCE(after_rec.heat, 51) - COALESCE(before_rec.heat, 0))
  WHERE id = v_record_id;

  record_id              := v_record_id;
  streak_days            := COALESCE(after_rec.streak_days, 1);
  heat                   := COALESCE(after_rec.heat, 51)::int;
  level                  := COALESCE(after_rec.level, 1);
  previous_level         := v_prev_level;
  already_recycled_today := v_already_today;
  streak_extended_today  := NOT v_already_today;
  leveled_up             := COALESCE(after_rec.level, 1) > v_prev_level;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."confirm_segregation"("p_user_id" "uuid", "p_waste_type_id" "uuid", "p_bin_type_id" "uuid", "p_recycling_point_id" "uuid", "p_detection_type" "text", "p_confidence_score" numeric) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."confirm_segregation"("p_user_id" "uuid", "p_waste_type_id" "uuid", "p_bin_type_id" "uuid", "p_recycling_point_id" "uuid", "p_detection_type" "text", "p_confidence_score" numeric) TO "service_role";

GRANT ALL ON TABLE "public"."recycling_records" TO "anon";

GRANT ALL ON TABLE "public"."recycling_records" TO "authenticated";

GRANT ALL ON TABLE "public"."recycling_records" TO "service_role";

GRANT ALL ON TABLE "public"."recycling_sessions" TO "anon";

GRANT ALL ON TABLE "public"."recycling_sessions" TO "authenticated";

GRANT ALL ON TABLE "public"."recycling_sessions" TO "service_role";
