-- Offline and local sync support.
-- Includes cached resources and pending operations staged on clients.

CREATE TABLE IF NOT EXISTS "public"."cached_resources" (
    "resource_name" "text" NOT NULL,
    "last_synced_at" timestamp with time zone,
    "version" "text",
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

ALTER TABLE "public"."cached_resources" OWNER TO "postgres";

ALTER TABLE "public"."pending_operations" OWNER TO "postgres";

ALTER TABLE ONLY "public"."cached_resources"
    ADD CONSTRAINT "cached_resources_pkey" PRIMARY KEY ("resource_name");

ALTER TABLE ONLY "public"."pending_operations"
    ADD CONSTRAINT "pending_operations_pkey" PRIMARY KEY ("local_id");

ALTER TABLE ONLY "public"."pending_operations"
    ADD CONSTRAINT "pending_operations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE "public"."cached_resources" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pending_operations" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."cached_resources" TO "anon";

GRANT ALL ON TABLE "public"."cached_resources" TO "authenticated";

GRANT ALL ON TABLE "public"."cached_resources" TO "service_role";

GRANT ALL ON TABLE "public"."pending_operations" TO "anon";

GRANT ALL ON TABLE "public"."pending_operations" TO "authenticated";

GRANT ALL ON TABLE "public"."pending_operations" TO "service_role";
