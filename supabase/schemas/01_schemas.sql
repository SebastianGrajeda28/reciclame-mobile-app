-- PostgreSQL schemas used by the application backend.
-- The public schema holds stable client-facing tables and wrappers.
-- app_* schemas hold internal implementation functions by domain.

CREATE SCHEMA IF NOT EXISTS "app_admin";

CREATE SCHEMA IF NOT EXISTS "app_analytics";

CREATE SCHEMA IF NOT EXISTS "app_auth";

CREATE SCHEMA IF NOT EXISTS "app_education";

CREATE SCHEMA IF NOT EXISTS "app_gamification";

CREATE SCHEMA IF NOT EXISTS "app_profile";

CREATE SCHEMA IF NOT EXISTS "app_social";

COMMENT ON SCHEMA "app_admin" IS 'Domain implementation functions for administrative authorization and operations.';

COMMENT ON SCHEMA "app_analytics" IS 'Domain implementation functions for analytics and admin reporting.';

COMMENT ON SCHEMA "app_auth" IS 'Domain implementation functions for authentication/account contracts.';

COMMENT ON SCHEMA "app_education" IS 'Domain implementation functions for educational content contracts.';

COMMENT ON SCHEMA "app_gamification" IS 'Domain implementation functions for medals, rewards and progression-facing contracts.';

COMMENT ON SCHEMA "app_profile" IS 'Domain implementation functions for profile and avatar operations.';

COMMENT ON SCHEMA "app_social" IS 'Domain implementation functions for social/friends contracts.';

COMMENT ON SCHEMA "public" IS 'standard public schema';
