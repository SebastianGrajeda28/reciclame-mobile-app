alter table "public"."achievements" enable row level security;

alter table "public"."avatars" enable row level security;

alter table "public"."bin_types" enable row level security;

alter table "public"."cached_resources" enable row level security;

alter table "public"."campuses" enable row level security;

alter table "public"."friend_codes" enable row level security;

alter table "public"."friendships" enable row level security;

alter table "public"."map_waste_type_bin_types" enable row level security;

alter table "public"."metric_snapshots" enable row level security;

alter table "public"."pending_operations" enable row level security;

alter table "public"."recycling_point_bins" enable row level security;

alter table "public"."recycling_points" enable row level security;

alter table "public"."recycling_records" enable row level security;

alter table "public"."rewards" enable row level security;

alter table "public"."system_config" enable row level security;

alter table "public"."universities" enable row level security;

alter table "public"."user_achievements" enable row level security;

alter table "public"."user_profiles" enable row level security;

alter table "public"."user_progress" add column "best_streak_days" integer not null default 0;

alter table "public"."user_progress" enable row level security;

alter table "public"."user_rewards" enable row level security;

alter table "public"."user_settings" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_streak_activity(p_user_id uuid)
 RETURNS TABLE(streak_days integer, best_streak_days integer, recycled_today boolean, total_today integer, daily_average numeric, week_days jsonb, heat_map jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  today         date := public.app_today();
  week_start    date;
  map_start     date;
  v_streak      int;
  v_best        int;
  v_heat        int;
  v_level       int;
  v_last_date   date;
  v_just_exp    boolean;
BEGIN
  SELECT sa.streak_days, sa.heat, sa.level, sa.last_recycling_date, sa.streak_just_expired
  INTO v_streak, v_heat, v_level, v_last_date, v_just_exp
  FROM public.get_progress_with_decay(p_user_id) sa;

  IF v_streak IS NULL THEN v_streak := 0; END IF;

  SELECT COALESCE(up.best_streak_days, 0)
  INTO v_best
  FROM public.user_progress up
  WHERE up.user_id = p_user_id;

  IF v_best IS NULL THEN v_best := 0; END IF;

  week_start := today - EXTRACT(ISODOW FROM today)::int + 1;
  map_start  := today - 27;

  RETURN QUERY
  WITH
  daily_counts AS (
    SELECT
      (rr.created_at AT TIME ZONE 'America/Lima')::date AS rec_date,
      COUNT(*)::int AS cnt
    FROM public.recycling_records rr
    WHERE rr.user_id = p_user_id
      AND rr.is_active = true
      AND (rr.created_at AT TIME ZONE 'America/Lima')::date >= map_start
      AND (rr.created_at AT TIME ZONE 'America/Lima')::date <= today
    GROUP BY rec_date
  ),
  day_series AS (
    SELECT generate_series(map_start, today, '1 day'::interval)::date AS d
  ),
  full_map AS (
    SELECT ds.d, COALESCE(dc.cnt, 0) AS cnt
    FROM day_series ds
    LEFT JOIN daily_counts dc ON dc.rec_date = ds.d
  ),
  week_series AS (
    SELECT generate_series(week_start, week_start + 6, '1 day'::interval)::date AS wd
  )
  SELECT
    v_streak::int,
    v_best::int,
    (COALESCE(v_last_date, '1900-01-01') >= today),
    COALESCE((SELECT cnt FROM full_map WHERE d = today), 0)::int,
    COALESCE(
      (SELECT ROUND(AVG(cnt)::numeric, 1) FROM full_map WHERE cnt > 0),
      0
    )::numeric,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date',     to_char(ws.wd, 'YYYY-MM-DD'),
          'recycled', EXISTS (SELECT 1 FROM daily_counts dc WHERE dc.rec_date = ws.wd)
        )
        ORDER BY ws.wd
      )
      FROM week_series ws
    ),
    (
      SELECT jsonb_agg(
        jsonb_build_object('date', to_char(fm.d, 'YYYY-MM-DD'), 'count', fm.cnt)
        ORDER BY fm.d
      )
      FROM full_map fm
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.count_public_tables()
 RETURNS TABLE(table_name text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
$function$
;

CREATE OR REPLACE FUNCTION public.get_progress_with_decay(p_user_id uuid)
 RETURNS TABLE(streak_days integer, heat integer, level integer, last_recycling_date date, streak_expires_at timestamp with time zone, streak_just_expired boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec              public.user_progress%ROWTYPE;
  days_missed      int := 0;
  effective_heat   int;
  effective_streak int;
  just_expired     boolean := false;
  today            date := public.app_today();
  expires          timestamptz;
BEGIN
  SELECT * INTO rec
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 1, NULL::date, NULL::timestamptz, false;
    RETURN;
  END IF;

  IF rec.last_recycling_date IS NOT NULL THEN
    days_missed := GREATEST(0, (today - rec.last_recycling_date) - 1);
  END IF;

  effective_heat   := COALESCE(rec.heat, 50)::int;
  effective_streak := COALESCE(rec.streak_days, 0);

  IF effective_streak > 0 AND days_missed > 0
     AND (rec.updated_at AT TIME ZONE 'America/Lima')::date < today THEN
    effective_heat := effective_heat - (30 * days_missed);

    IF effective_heat <= 0 THEN
      effective_heat   := 50;
      effective_streak := 0;
      just_expired     := true;
    END IF;

    UPDATE public.user_progress
    SET
      heat        = effective_heat,
      streak_days = effective_streak,
      updated_at  = now()
    WHERE user_id = p_user_id;
  END IF;

  IF effective_streak > 0 THEN
    expires := ((today + CEIL(effective_heat / 30.0)::int)::timestamp)
                 AT TIME ZONE 'America/Lima';
  ELSE
    expires := NULL;
  END IF;

  RETURN QUERY SELECT
    effective_streak,
    effective_heat,
    COALESCE(rec.level, 1),
    rec.last_recycling_date,
    expires,
    just_expired;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_post_segregation_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  progress_record public.user_progress%ROWTYPE;
  is_first_action_today boolean := false;
  new_streak int;
  new_heat   numeric;
  new_level  int;
  heat_gain  int;
  today      date := public.app_today();
BEGIN
  SELECT * INTO progress_record
  FROM public.user_progress
  WHERE user_id = NEW.user_id
  FOR UPDATE;

  IF FOUND THEN
    IF progress_record.last_recycling_date IS NULL
       OR progress_record.last_recycling_date < today THEN
      is_first_action_today := true;
    END IF;

    IF is_first_action_today THEN
      new_streak := COALESCE(progress_record.streak_days, 0) + 1;
      heat_gain  := public.heat_gain_for_level(COALESCE(progress_record.level, 1));
      new_heat   := LEAST(100, COALESCE(progress_record.heat, 50) + heat_gain);
      new_level  := GREATEST(
        COALESCE(progress_record.level, 1),
        public.compute_streak_level(new_streak)
      );
    ELSE
      new_streak := COALESCE(progress_record.streak_days, 0);
      new_heat   := COALESCE(progress_record.heat, 50);
      new_level  := COALESCE(progress_record.level, 1);
    END IF;

    UPDATE public.user_progress
    SET
      streak_days      = new_streak,
      heat             = new_heat,
      level            = new_level,
      best_streak_days = GREATEST(COALESCE(best_streak_days, 0), new_streak),
      last_recycling_date = today,
      updated_at       = now()
    WHERE user_id = NEW.user_id;

  ELSE

    INSERT INTO public.user_progress (
      user_id, points, streak_days, heat, level, best_streak_days, last_recycling_date
    ) VALUES (
      NEW.user_id, 0, 1, 51, 1, 1, today
    );

  END IF;

  RETURN NEW;
END;
$function$
;


