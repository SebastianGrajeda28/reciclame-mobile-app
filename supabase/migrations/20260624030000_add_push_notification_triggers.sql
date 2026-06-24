-- Helper RPCs and DB triggers for push notifications.
--
-- get_streak_reminder_targets: users who haven't recycled today and have notifications on.
-- get_inactive_48h_targets: users inactive for 48+ hours with notifications on.
-- trigger on user_progress: calls notify-streak-dropped edge fn when streak_days drops to 0.
-- trigger on user_achievements: calls notify-friend-achievement edge fn for accepted friends.

-- ─── Helper RPC: streak reminder targets ─────────────────────────────────────

create or replace function public.get_streak_reminder_targets(p_date date)
returns table (user_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select up.user_id
  from public.user_progress up
  join public.user_settings us on us.user_id = up.user_id
  where us.notifications_enabled = true
    and (up.last_recycling_date is null or up.last_recycling_date < p_date)
    and up.streak_days > 0
$$;

-- ─── Helper RPC: 48h inactivity targets ──────────────────────────────────────

create or replace function public.get_inactive_48h_targets()
returns table (user_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select up.user_id
  from public.user_progress up
  join public.user_settings us on us.user_id = up.user_id
  where us.notifications_enabled = true
    and up.last_recycling_date is not null
    and up.last_recycling_date < (current_date - interval '2 days')::date
$$;

-- ─── Trigger: streak dropped ─────────────────────────────────────────────────
-- Fires after update on user_progress when streak_days goes from >0 to 0.
-- Calls the notify-streak-dropped edge function via http (pg_net extension).

create or replace function public.trg_notify_streak_dropped()
returns trigger
language plpgsql
security definer
as $$
declare
  v_url text;
  v_service_role_key text;
begin
  -- Only fire when streak_days drops to 0 from a positive value
  if new.streak_days = 0 and old.streak_days > 0 then
    v_url := current_setting('app.supabase_url', true) || '/functions/v1/notify-streak-dropped';
    v_service_role_key := current_setting('app.service_role_key', true);

    if v_url is not null and v_service_role_key is not null then
      perform net.http_post(
        url := v_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_role_key
        ),
        body := jsonb_build_object(
          'user_id', new.user_id::text,
          'previous_streak', old.streak_days
        )
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_streak_dropped on public.user_progress;
create trigger trg_notify_streak_dropped
  after update of streak_days on public.user_progress
  for each row
  execute function public.trg_notify_streak_dropped();

-- ─── Trigger: friend achievement ─────────────────────────────────────────────
-- Fires after insert on user_achievements.
-- For each accepted friend of the achiever, calls notify-friend-achievement.

create or replace function public.trg_notify_friend_achievement()
returns trigger
language plpgsql
security definer
as $$
declare
  v_url text;
  v_service_role_key text;
  v_achiever_alias text;
  v_achievement_name text;
  v_friend record;
begin
  v_url := current_setting('app.supabase_url', true) || '/functions/v1/notify-friend-achievement';
  v_service_role_key := current_setting('app.service_role_key', true);

  if v_url is null or v_service_role_key is null then
    return new;
  end if;

  -- Get achiever alias
  select alias into v_achiever_alias
  from public.user_profiles
  where user_id = new.user_id;

  -- Get achievement name
  select name into v_achievement_name
  from public.achievements
  where id = new.achievement_id;

  -- Notify each accepted friend
  for v_friend in
    select
      case when f.requester_id = new.user_id then f.addressee_id else f.requester_id end as friend_id
    from public.friendships f
    where (f.requester_id = new.user_id or f.addressee_id = new.user_id)
      and f.status = 'accepted'
  loop
    perform net.http_post(
      url := v_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'user_id', v_friend.friend_id::text,
        'achiever_name', coalesce(v_achiever_alias, 'Tu amigo'),
        'achievement_name', coalesce(v_achievement_name, 'un logro')
      )
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_notify_friend_achievement on public.user_achievements;
create trigger trg_notify_friend_achievement
  after insert on public.user_achievements
  for each row
  execute function public.trg_notify_friend_achievement();
