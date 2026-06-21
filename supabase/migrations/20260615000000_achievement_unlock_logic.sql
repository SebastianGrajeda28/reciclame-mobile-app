-- Add achievement unlock logic to check and unlock achievements based on user progress
-- This function should be called after recycling records are created

-- Function to check if achievement requirements are met and unlock them
CREATE OR REPLACE FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") RETURNS TABLE("achievement_id" "uuid", "achievement_name" "text", "reward_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    user_progress_rec public.user_progress%ROWTYPE;
    recycling_count integer;
    unlocked_achievements RECORD;
BEGIN
    -- Get user progress
    SELECT * INTO user_progress_rec
    FROM public.user_progress
    WHERE user_id = p_user_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Get total recycling count for the user
    SELECT COUNT(*) INTO recycling_count
    FROM public.recycling_records
    WHERE user_id = p_user_id AND status = 'confirmed';
    
    -- Check for achievements based on different condition types
    -- First recycling
    IF recycling_count >= 1 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
        SELECT p_user_id, id, now(), true
        FROM public.achievements
        WHERE condition_type = 'first_recycling'
        AND is_active = true
        AND id NOT IN (
            SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id
        )
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RETURN QUERY
        SELECT a.id, a.name, a.reward_id
        FROM public.achievements a
        JOIN public.user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = p_user_id
        AND a.condition_type = 'first_recycling'
        AND a.is_active = true
        AND ua.unlocked_at >= now() - interval '1 second';
    END IF;
    
    -- Streak achievements (7 days, 30 days)
    IF user_progress_rec.streak_days >= 7 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
        SELECT p_user_id, id, now(), true
        FROM public.achievements
        WHERE condition_type = 'streak_days'
        AND condition_value = 7
        AND is_active = true
        AND id NOT IN (
            SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id
        )
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RETURN QUERY
        SELECT a.id, a.name, a.reward_id
        FROM public.achievements a
        JOIN public.user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = p_user_id
        AND a.condition_type = 'streak_days'
        AND a.condition_value = 7
        AND a.is_active = true
        AND ua.unlocked_at >= now() - interval '1 second';
    END IF;
    
    IF user_progress_rec.streak_days >= 30 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
        SELECT p_user_id, id, now(), true
        FROM public.achievements
        WHERE condition_type = 'streak_days'
        AND condition_value = 30
        AND is_active = true
        AND id NOT IN (
            SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id
        )
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RETURN QUERY
        SELECT a.id, a.name, a.reward_id
        FROM public.achievements a
        JOIN public.user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = p_user_id
        AND a.condition_type = 'streak_days'
        AND a.condition_value = 30
        AND a.is_active = true
        AND ua.unlocked_at >= now() - interval '1 second';
    END IF;
    
    -- Total recycling count achievements (10, 100, 500)
    IF recycling_count >= 10 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
        SELECT p_user_id, id, now(), true
        FROM public.achievements
        WHERE condition_type = 'total_recycling_count'
        AND condition_value = 10
        AND is_active = true
        AND id NOT IN (
            SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id
        )
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RETURN QUERY
        SELECT a.id, a.name, a.reward_id
        FROM public.achievements a
        JOIN public.user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = p_user_id
        AND a.condition_type = 'total_recycling_count'
        AND a.condition_value = 10
        AND a.is_active = true
        AND ua.unlocked_at >= now() - interval '1 second';
    END IF;
    
    IF recycling_count >= 100 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
        SELECT p_user_id, id, now(), true
        FROM public.achievements
        WHERE condition_type = 'total_recycling_count'
        AND condition_value = 100
        AND is_active = true
        AND id NOT IN (
            SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id
        )
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RETURN QUERY
        SELECT a.id, a.name, a.reward_id
        FROM public.achievements a
        JOIN public.user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = p_user_id
        AND a.condition_type = 'total_recycling_count'
        AND a.condition_value = 100
        AND a.is_active = true
        AND ua.unlocked_at >= now() - interval '1 second';
    END IF;
    
    IF recycling_count >= 500 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
        SELECT p_user_id, id, now(), true
        FROM public.achievements
        WHERE condition_type = 'total_recycling_count'
        AND condition_value = 500
        AND is_active = true
        AND id NOT IN (
            SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id
        )
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RETURN QUERY
        SELECT a.id, a.name, a.reward_id
        FROM public.achievements a
        JOIN public.user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = p_user_id
        AND a.condition_type = 'total_recycling_count'
        AND a.condition_value = 500
        AND a.is_active = true
        AND ua.unlocked_at >= now() - interval '1 second';
    END IF;
    
    RETURN;
END;
$$;

-- Grant permissions
GRANT ALL ON FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") TO "service_role";

-- Update the existing trigger to also check for achievement unlocks
CREATE OR REPLACE FUNCTION "public"."handle_post_segregation_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  progress_record public.user_progress%ROWTYPE;
  is_first_action_today boolean := false;
  new_streak int;
  new_heat numeric;
  new_level int;
  heat_gain int;
BEGIN

  SELECT * INTO progress_record
  FROM public.user_progress
  WHERE user_id = NEW.user_id
  FOR UPDATE;

  IF FOUND THEN

    IF progress_record.last_recycling_date IS NULL
       OR progress_record.last_recycling_date < CURRENT_DATE THEN
      is_first_action_today := true;
    END IF;

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;

      heat_gain := public.heat_gain_for_level(COALESCE(progress_record.level, 1));
      new_heat  := LEAST(100, COALESCE(progress_record.heat, 50) + heat_gain);

      new_level := public.compute_streak_level(new_streak);
    ELSE
      new_streak := COALESCE(progress_record.streak_days, 0);
      new_heat   := COALESCE(progress_record.heat, 50);
      new_level  := COALESCE(progress_record.level, 1);
    END IF;

    UPDATE public.user_progress
    SET
      streak_days        = new_streak,
      heat               = new_heat,
      level              = new_level,
      last_recycling_date = CURRENT_DATE,
      updated_at         = now()
    WHERE user_id = NEW.user_id;

  ELSE

    INSERT INTO public.user_progress (
      user_id, points, streak_days, heat, level, last_recycling_date
    ) VALUES (
      NEW.user_id, 0, 1, 51, 1, CURRENT_DATE
    );

  END IF;

  -- Check for and unlock achievements
  PERFORM public.check_and_unlock_achievements(NEW.user_id);

  RETURN NEW;
END;
$$;
