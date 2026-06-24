-- Restrict all dev_* RPCs so only users with the ADMIN role can call them.
-- Without this, any authenticated user could manipulate their own streak/achievements.
-- Redefines every dev_* function with a role guard at the top.

-- Helper called by each dev function to abort if the caller is not ADMIN.
create or replace function public._dev_assert_role()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and upper(r.name) = 'ADMIN'
      and ur.is_active = true
  ) then
    raise exception 'admin role required';
  end if;
end;
$$;

-- ─── dev_rollback_last_record ────────────────────────────────────────────────

create or replace function public.dev_rollback_last_record()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record_id uuid;
  v_old_date  timestamptz;
  v_new_date  timestamptz;
begin
  perform public._dev_assert_role();

  select id, created_at
    into v_record_id, v_old_date
    from public.recycling_records
   where user_id = auth.uid()
   order by created_at desc
   limit 1;

  if v_record_id is null then
    return jsonb_build_object('ok', false, 'error', 'no_records');
  end if;

  v_new_date := v_old_date - interval '1 day';

  update public.recycling_records
     set created_at = v_new_date
   where id = v_record_id;

  return jsonb_build_object('ok', true, 'id', v_record_id, 'old_date', v_old_date, 'new_date', v_new_date);
end;
$$;

-- ─── dev_delete_last_record ──────────────────────────────────────────────────

create or replace function public.dev_delete_last_record()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record_id  uuid;
  v_created_at timestamptz;
begin
  perform public._dev_assert_role();

  select id, created_at
    into v_record_id, v_created_at
    from public.recycling_records
   where user_id = auth.uid()
   order by created_at desc
   limit 1;

  if v_record_id is null then
    return jsonb_build_object('ok', false, 'error', 'no_records');
  end if;

  delete from public.recycling_records where id = v_record_id;

  return jsonb_build_object('ok', true, 'id', v_record_id, 'created_at', v_created_at);
end;
$$;

-- ─── dev_revoke_achievement ──────────────────────────────────────────────────

create or replace function public.dev_revoke_achievement(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_achievement_id uuid;
  v_deleted        int;
begin
  perform public._dev_assert_role();

  select id into v_achievement_id
    from public.achievements
   where slug = p_slug
   limit 1;

  if v_achievement_id is null then
    return jsonb_build_object('ok', false, 'error', 'achievement_not_found');
  end if;

  delete from public.user_achievements
   where user_id = auth.uid()
     and achievement_id = v_achievement_id;

  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    return jsonb_build_object('ok', false, 'error', 'not_owned');
  end if;

  return jsonb_build_object('ok', true, 'slug', p_slug);
end;
$$;

-- ─── dev_set_streak ──────────────────────────────────────────────────────────

create or replace function public.dev_set_streak(p_streak_days int, p_heat int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_level int;
begin
  perform public._dev_assert_role();

  v_new_level := public.compute_streak_level(greatest(0, p_streak_days));

  update public.user_progress
     set streak_days      = greatest(0, p_streak_days),
         best_streak_days = greatest(best_streak_days, greatest(0, p_streak_days)),
         heat             = least(100, greatest(0, p_heat)),
         level            = greatest(level, v_new_level)
   where user_id = auth.uid();

  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_progress_row');
  end if;

  return jsonb_build_object(
    'ok',          true,
    'streak_days', greatest(0, p_streak_days),
    'heat',        least(100, greatest(0, p_heat)),
    'level',       v_new_level
  );
end;
$$;

-- ─── dev_seed_streak ─────────────────────────────────────────────────────────

create or replace function public.dev_seed_streak(p_days int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id        uuid := auth.uid();
  v_waste_type_id  uuid;
  v_bin_type_id    uuid;
  v_point_id       uuid;
  v_day            date;
  i                int;
begin
  perform public._dev_assert_role();

  if p_days < 0 or p_days > 365 then
    return jsonb_build_object('ok', false, 'error', 'p_days must be between 0 and 365');
  end if;

  select id into v_waste_type_id from public.waste_types limit 1;
  select id into v_bin_type_id   from public.bin_types   limit 1;
  select id into v_point_id      from public.recycling_points where is_active = true limit 1;

  if v_waste_type_id is null or v_bin_type_id is null or v_point_id is null then
    return jsonb_build_object('ok', false, 'error', 'missing_reference_data');
  end if;

  delete from public.recycling_records where user_id = v_user_id;

  update public.user_progress
     set streak_days         = 0,
         heat                = 0,
         level               = 1,
         best_streak_days    = 0,
         last_recycling_date = null,
         updated_at          = now()
   where user_id = v_user_id;

  insert into public.user_progress (user_id, points, streak_days, heat, level, best_streak_days)
  select v_user_id, 0, 0, 0, 1, 0
  where not exists (select 1 from public.user_progress where user_id = v_user_id);

  if p_days = 0 then
    return jsonb_build_object('ok', true, 'streak_days', 0, 'message', 'progress reset to zero');
  end if;

  for i in 1..p_days loop
    v_day := public.app_today() - (p_days - i + 1);
    insert into public.recycling_records (
      user_id, waste_type_id, bin_type_id, recycling_point_id,
      detection_type, status, created_at
    ) values (
      v_user_id, v_waste_type_id, v_bin_type_id, v_point_id,
      'manual', 'confirmed', v_day::timestamptz
    );
  end loop;

  return (
    select jsonb_build_object('ok', true, 'streak_days', streak_days, 'heat', heat, 'level', level)
    from public.user_progress
    where user_id = v_user_id
  );
end;
$$;

-- ─── dev_reset_progress ──────────────────────────────────────────────────────

create or replace function public.dev_reset_progress()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  perform public._dev_assert_role();

  delete from public.recycling_records where user_id = v_user_id;
  delete from public.user_achievements  where user_id = v_user_id;

  update public.user_progress
     set streak_days         = 0,
         best_streak_days    = 0,
         heat                = 0,
         level               = 1,
         points              = 0,
         last_recycling_date = null,
         updated_at          = now()
   where user_id = v_user_id;

  return jsonb_build_object('ok', true);
end;
$$;

-- ─── dev_streak_advance ──────────────────────────────────────────────────────

create or replace function public.dev_streak_advance()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id       uuid := auth.uid();
  v_waste_type_id uuid;
  v_bin_type_id   uuid;
  v_point_id      uuid;
  v_last_date     date;
  v_insert_date   date;
  v_record_id     uuid;
begin
  perform public._dev_assert_role();

  select max(created_at::date) into v_last_date
  from public.recycling_records
  where user_id = v_user_id and status = 'confirmed';

  v_insert_date := least(
    coalesce(v_last_date + 1, public.app_today() - 1),
    public.app_today() - 1
  );

  select id into v_waste_type_id from public.waste_types   order by random() limit 1;
  select id into v_bin_type_id   from public.bin_types     order by random() limit 1;
  select id into v_point_id      from public.recycling_points where is_active = true order by random() limit 1;

  if v_waste_type_id is null or v_bin_type_id is null or v_point_id is null then
    return jsonb_build_object('ok', false, 'error', 'missing_reference_data');
  end if;

  insert into public.recycling_records (
    user_id, waste_type_id, bin_type_id, recycling_point_id,
    detection_type, status, created_at
  ) values (
    v_user_id, v_waste_type_id, v_bin_type_id, v_point_id,
    'manual', 'confirmed', v_insert_date::timestamptz
  )
  returning id into v_record_id;

  return (
    select jsonb_build_object(
      'ok', true, 'record_id', v_record_id, 'record_date', v_insert_date,
      'streak_days', streak_days, 'heat', heat, 'level', level
    )
    from public.user_progress where user_id = v_user_id
  );
end;
$$;

-- ─── dev_streak_miss ─────────────────────────────────────────────────────────

create or replace function public.dev_streak_miss()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid := auth.uid();
  v_new_heat   int;
  v_new_streak int;
  v_new_level  int := 1;
  v_died       boolean := false;
begin
  perform public._dev_assert_role();

  select
    case when heat - 30 <= 0 then 50   else heat - 30  end,
    case when heat - 30 <= 0 then 0    else streak_days end,
    case when heat - 30 <= 0 then true else false       end
  into v_new_heat, v_new_streak, v_died
  from public.user_progress
  where user_id = v_user_id and is_active = true;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_progress_row');
  end if;

  update public.user_progress
     set heat        = v_new_heat,
         streak_days = v_new_streak,
         updated_at  = now()
   where user_id = v_user_id;

  select level into v_new_level from public.user_progress where user_id = v_user_id;

  return jsonb_build_object(
    'ok', true, 'streak_died', v_died,
    'streak_days', v_new_streak, 'heat', v_new_heat, 'level', v_new_level
  );
end;
$$;
