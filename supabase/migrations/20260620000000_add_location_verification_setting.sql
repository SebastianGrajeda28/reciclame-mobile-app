-- Add location verification setting to user_settings table
-- This allows users to opt-in to location verification for recycling actions

ALTER TABLE "public"."user_settings"
ADD COLUMN IF NOT EXISTS "location_verification_enabled" boolean DEFAULT false NOT NULL;
