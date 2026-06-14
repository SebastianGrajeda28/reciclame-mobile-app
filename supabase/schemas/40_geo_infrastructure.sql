-- Physical recycling infrastructure.
-- Includes recycling points, point bins and waste-to-bin mappings.

CREATE TABLE IF NOT EXISTS "public"."map_waste_type_bin_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" "uuid" NOT NULL,
    "waste_type_id" "uuid" NOT NULL,
    "bin_type_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
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

ALTER TABLE "public"."map_waste_type_bin_types" OWNER TO "postgres";

ALTER TABLE "public"."recycling_point_bins" OWNER TO "postgres";

ALTER TABLE "public"."recycling_points" OWNER TO "postgres";

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_university_id_waste_type_id_bin_ty_key" UNIQUE ("university_id", "waste_type_id", "bin_type_id");

ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_recycling_point_id_bin_type_id_key" UNIQUE ("recycling_point_id", "bin_type_id");

ALTER TABLE ONLY "public"."recycling_points"
    ADD CONSTRAINT "recycling_points_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_bin_type_id_fkey" FOREIGN KEY ("bin_type_id") REFERENCES "public"."bin_types"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_bin_type_id_fkey" FOREIGN KEY ("bin_type_id") REFERENCES "public"."bin_types"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_recycling_point_id_fkey" FOREIGN KEY ("recycling_point_id") REFERENCES "public"."recycling_points"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."recycling_points"
    ADD CONSTRAINT "recycling_points_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE CASCADE;

CREATE INDEX "idx_map_waste_bin_bin_type" ON "public"."map_waste_type_bin_types" USING "btree" ("bin_type_id");

CREATE INDEX "idx_map_waste_bin_university" ON "public"."map_waste_type_bin_types" USING "btree" ("university_id");

CREATE INDEX "idx_map_waste_bin_waste_type" ON "public"."map_waste_type_bin_types" USING "btree" ("waste_type_id");

ALTER TABLE "public"."map_waste_type_bin_types" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."recycling_point_bins" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."recycling_points" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."map_waste_type_bin_types" TO "anon";

GRANT ALL ON TABLE "public"."map_waste_type_bin_types" TO "authenticated";

GRANT ALL ON TABLE "public"."map_waste_type_bin_types" TO "service_role";

GRANT ALL ON TABLE "public"."recycling_point_bins" TO "anon";

GRANT ALL ON TABLE "public"."recycling_point_bins" TO "authenticated";

GRANT ALL ON TABLE "public"."recycling_point_bins" TO "service_role";

GRANT ALL ON TABLE "public"."recycling_points" TO "anon";

GRANT ALL ON TABLE "public"."recycling_points" TO "authenticated";

GRANT ALL ON TABLE "public"."recycling_points" TO "service_role";
