create schema if not exists app_admin;
create schema if not exists app_profile;
create schema if not exists app_gamification;

comment on schema app_admin is 'Domain implementation functions for administrative authorization and operations.';
comment on schema app_profile is 'Domain implementation functions for profile and avatar operations.';
comment on schema app_gamification is 'Domain implementation functions for medals, rewards and progression-facing contracts.';

create or replace function app_admin.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and r.is_active = true
      and r.name = 'ADMIN'
  );
$$;

revoke all on function app_admin.is_current_user_admin() from public, anon, authenticated;
grant usage on schema app_admin to postgres, service_role;
grant execute on function app_admin.is_current_user_admin() to postgres, service_role;

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public, auth, app_admin
stable
as $$
  select app_admin.is_current_user_admin();
$$;

grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.is_current_user_admin() to service_role;

create or replace function app_profile.update_user_avatar(p_user_id uuid, p_reward_id uuid)
returns table(success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  asset text;
begin
  if not exists (select 1 from public.rewards where id = p_reward_id) then
    return query select false, 'reward_not_found';
    return;
  end if;

  if not exists (select 1 from public.user_rewards where user_id = p_user_id and reward_id = p_reward_id) then
    return query select false, 'reward_not_unlocked';
    return;
  end if;

  select asset_url into asset from public.rewards where id = p_reward_id;

  insert into public.avatars (user_id, base_style, updated_at)
  values (p_user_id, asset, now())
  on conflict (user_id) do update set
    base_style = excluded.base_style,
    updated_at = now();

  return query select true, 'avatar_updated';
end;
$$;

revoke all on function app_profile.update_user_avatar(uuid, uuid) from public, anon, authenticated;
grant usage on schema app_profile to postgres, service_role;
grant execute on function app_profile.update_user_avatar(uuid, uuid) to postgres, service_role;

create or replace function public.update_user_avatar(p_user_id uuid, p_reward_id uuid)
returns table(success boolean, message text)
language sql
security definer
set search_path = public, app_profile
as $$
  select * from app_profile.update_user_avatar(p_user_id, p_reward_id);
$$;

grant execute on function public.update_user_avatar(uuid, uuid) to authenticated;
grant execute on function public.update_user_avatar(uuid, uuid) to service_role;

create or replace function app_gamification.update_featured_medals(
  p_user_id uuid,
  p_achievement_ids uuid[]
)
returns table(success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  invalid_ids uuid[];
begin
  if array_length(p_achievement_ids, 1) > 5 then
    return query select false, 'max_featured_medals_exceeded';
    return;
  end if;

  select array_agg(id)
  into invalid_ids
  from unnest(p_achievement_ids) as id
  where not exists (
    select 1 from public.user_achievements
    where user_id = p_user_id and achievement_id = id
  );

  if invalid_ids is not null then
    return query select false, 'invalid_or_unlocked_achievements';
    return;
  end if;

  insert into public.user_featured_medals (user_id, achievement_ids, updated_at)
  values (p_user_id, p_achievement_ids, now())
  on conflict (user_id) do update set
    achievement_ids = excluded.achievement_ids,
    updated_at = now();

  return query select true, 'featured_medals_updated';
end;
$$;

revoke all on function app_gamification.update_featured_medals(uuid, uuid[]) from public, anon, authenticated;
grant usage on schema app_gamification to postgres, service_role;
grant execute on function app_gamification.update_featured_medals(uuid, uuid[]) to postgres, service_role;

create or replace function public.update_featured_medals(
  p_user_id uuid,
  p_achievement_ids uuid[]
)
returns table(success boolean, message text)
language sql
security definer
set search_path = public, app_gamification
as $$
  select * from app_gamification.update_featured_medals(p_user_id, p_achievement_ids);
$$;

grant execute on function public.update_featured_medals(uuid, uuid[]) to authenticated;
grant execute on function public.update_featured_medals(uuid, uuid[]) to service_role;

create or replace function app_auth.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  user_name text;
begin
  insert into public.users (id, email, last_login_at)
  values (new.id, new.email, now())
  on conflict (id) do update set
    last_login_at = case
      when new.last_sign_in_at is distinct from old.last_sign_in_at then clock_timestamp()
      else public.users.last_login_at
    end;

  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  insert into public.user_profiles (user_id, alias)
  values (new.id, user_name)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, app_auth
as $$
begin
  return app_auth.handle_new_user();
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row execute procedure app_auth.handle_new_user();