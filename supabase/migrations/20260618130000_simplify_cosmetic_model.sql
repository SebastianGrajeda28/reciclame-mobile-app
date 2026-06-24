-- Simplifies the cosmetic ownership model:
-- 1. Drops user_rewards (replaced by user_achievements as source of truth)
-- 2. Adds rewards.requires_unlock + rewards.achievement_id
-- 3. Migrates achievement→reward link to reward→achievement
-- 4. Drops achievements.reward_id
-- 5. Adds UNIQUE(item_type, item_key) to rewards
-- 6. Removes unused columns: rewards.reward_type, rewards.asset_url, rewards.description
-- 7. Removes avatars.frame_reward_id, avatars.accessory_reward_id
-- 8. Removes obsolete update_user_avatar RPCs
-- 9. Removes starter cosmetics insert from handle_new_user
-- Seeds and save_avatar_config rewrite are in 20260618140000.

-- ── Step 1: Drop user_rewards ─────────────────────────────────────────────────
DROP TABLE IF EXISTS public.user_rewards CASCADE;

-- ── Step 2: Clean up unused reward columns ────────────────────────────────────
ALTER TABLE public.rewards
  DROP COLUMN IF EXISTS reward_type,
  DROP COLUMN IF EXISTS asset_url,
  DROP COLUMN IF EXISTS description;

-- ── Step 3: Add requires_unlock + achievement_id to rewards ───────────────────
ALTER TABLE public.rewards
  ADD COLUMN IF NOT EXISTS requires_unlock BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS achievement_id  UUID REFERENCES public.achievements(id) ON DELETE SET NULL;

-- ── Step 4: Migrate achievement→reward link to reward→achievement ─────────────
UPDATE public.rewards r
SET achievement_id = a.id,
    requires_unlock = true
FROM public.achievements a
WHERE a.reward_id = r.id;

-- ── Step 5: Drop achievements.reward_id ──────────────────────────────────────
ALTER TABLE public.achievements
  DROP COLUMN IF EXISTS reward_id;

-- ── Step 6: Add UNIQUE(item_type, item_key) ───────────────────────────────────
DELETE FROM public.rewards r1
USING public.rewards r2
WHERE r1.item_type IS NOT NULL
  AND r1.item_key IS NOT NULL
  AND r1.item_type = r2.item_type
  AND r1.item_key = r2.item_key
  AND r1.id > r2.id;

ALTER TABLE public.rewards
  DROP CONSTRAINT IF EXISTS rewards_item_type_item_key_key;

ALTER TABLE public.rewards
  ADD CONSTRAINT rewards_item_type_item_key_key UNIQUE (item_type, item_key);

-- ── Step 7: Remove unused avatar columns ─────────────────────────────────────
ALTER TABLE public.avatars
  DROP COLUMN IF EXISTS frame_reward_id,
  DROP COLUMN IF EXISTS accessory_reward_id;

-- ── Step 8: Remove obsolete RPCs ─────────────────────────────────────────────
DROP FUNCTION IF EXISTS app_profile.update_user_avatar(uuid, uuid);
DROP FUNCTION IF EXISTS public.update_user_avatar(uuid, uuid);

-- ── Step 9: Remove starter cosmetics insert from handle_new_user ─────────────
CREATE OR REPLACE FUNCTION "app_auth"."handle_new_user"()
  RETURNS "trigger"
  LANGUAGE "plpgsql" SECURITY DEFINER
  SET "search_path" TO 'public', 'auth'
AS $$
DECLARE
  user_name text;
BEGIN
  INSERT INTO public.users (id, email, last_login_at)
  VALUES (new.id, new.email, now())
  ON CONFLICT (id) DO UPDATE SET
    last_login_at = CASE
      WHEN new.last_sign_in_at IS DISTINCT FROM old.last_sign_in_at THEN clock_timestamp()
      ELSE public.users.last_login_at
    END;

  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  INSERT INTO public.user_profiles (user_id, alias)
  VALUES (new.id, user_name)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;
