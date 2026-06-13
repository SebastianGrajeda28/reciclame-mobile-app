-- User profile, friendships and social state.

CREATE TABLE IF NOT EXISTS "public"."friend_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "addressee_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "user_low" "uuid" GENERATED ALWAYS AS (LEAST("requester_id", "addressee_id")) STORED,
    "user_high" "uuid" GENERATED ALWAYS AS (GREATEST("requester_id", "addressee_id")) STORED,
    "responded_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "friendships_check" CHECK (("requester_id" <> "addressee_id")),
    CONSTRAINT "friendships_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'blocked'::"text"])))
);

CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_featured_medals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "max_featured_medals" CHECK (("array_length"("achievement_ids", 1) <= 5))
);

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "alias" "text",
    "avatar_id" "uuid",
    "university_id" "uuid",
    "campus_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "points" integer DEFAULT 0 NOT NULL,
    "streak_days" integer DEFAULT 0 NOT NULL,
    "heat" numeric,
    "level" integer DEFAULT 1 NOT NULL,
    "last_recycling_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_equipped" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notifications_enabled" boolean DEFAULT true NOT NULL,
    "skip_recycling_instructions" boolean DEFAULT false NOT NULL,
    "profile_visibility" "text",
    "language" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "last_login_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."friend_codes" OWNER TO "postgres";

ALTER TABLE "public"."friendships" OWNER TO "postgres";

ALTER TABLE "public"."user_achievements" OWNER TO "postgres";

ALTER TABLE "public"."user_featured_medals" OWNER TO "postgres";

ALTER TABLE "public"."user_profiles" OWNER TO "postgres";

ALTER TABLE "public"."user_progress" OWNER TO "postgres";

ALTER TABLE "public"."user_rewards" OWNER TO "postgres";

ALTER TABLE "public"."user_roles" OWNER TO "postgres";

ALTER TABLE "public"."user_settings" OWNER TO "postgres";

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE "public"."friend_codes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_rewards" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
