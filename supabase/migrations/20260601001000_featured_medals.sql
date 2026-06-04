-- Create table for featured medals per user
create table if not exists public.user_featured_medals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  achievement_ids uuid[] not null default '{}',
  updated_at timestamptz,
  constraint max_featured_medals check (array_length(achievement_ids, 1) <= 5)
);

-- RPC: Update featured medals for user with validation
create or replace function public.update_featured_medals(
  p_user_id uuid,
  p_achievement_ids uuid[]
)
returns table(success boolean, message text) as $$
declare
  invalid_ids uuid[];
begin
  -- Validate array size (max 5 medals)
  if array_length(p_achievement_ids, 1) > 5 then
    return query select false, 'max_featured_medals_exceeded';
    return;
  end if;

  -- Validate all achievement IDs exist and user has unlocked them
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

  -- Upsert featured medals record
  insert into public.user_featured_medals (user_id, achievement_ids, updated_at)
  values (p_user_id, p_achievement_ids, now())
  on conflict (user_id) do update set
    achievement_ids = excluded.achievement_ids,
    updated_at = now();

  return query select true, 'featured_medals_updated';
end;
$$ language plpgsql security definer;

-- RPC: Test featured medals functionality
create or replace function public.test_update_featured_medals_flow()
returns table(created boolean, medals_updated boolean, message text) as $$
declare
  test_id uuid;
  test_email text;
  achievement_id_1 uuid;
  achievement_id_2 uuid;
  achievement_id_3 uuid;
  user_exists boolean := false;
  medals_exist boolean := false;
begin
  -- Generate unique ids
  loop
    test_id := gen_random_uuid();
    exit when not exists (select 1 from auth.users where id = test_id);
  end loop;
  test_email := 'test_medals_' || test_id || '@test.com';
  achievement_id_1 := gen_random_uuid();
  achievement_id_2 := gen_random_uuid();
  achievement_id_3 := gen_random_uuid();

  -- Create achievements
  insert into public.achievements (id, name, reward_type, is_active)
  values 
    (achievement_id_1, 'Test Achievement 1', 'ACHIEVEMENT', true),
    (achievement_id_2, 'Test Achievement 2', 'ACHIEVEMENT', true),
    (achievement_id_3, 'Test Achievement 3', 'ACHIEVEMENT', true)
  on conflict (id) do nothing;

  -- Insert into auth.users
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  values (test_id, test_email, jsonb_build_object('full_name','Test Medals User'), now(), now());

  -- Unlock achievements for user
  insert into public.user_achievements (id, user_id, achievement_id, unlocked_at)
  values 
    (gen_random_uuid(), test_id, achievement_id_1, now()),
    (gen_random_uuid(), test_id, achievement_id_2, now()),
    (gen_random_uuid(), test_id, achievement_id_3, now())
  on conflict (user_id, achievement_id) do nothing;

  -- Call the RPC to update featured medals
  PERFORM * FROM public.update_featured_medals(test_id, ARRAY[achievement_id_1, achievement_id_2]);

  -- Validate the featured medals record was created/updated
  select exists(select 1 from public.users where id = test_id) into user_exists;
  select exists(select 1 from public.user_featured_medals where user_id = test_id and array_length(achievement_ids, 1) = 2) into medals_exist;

  -- Cleanup
  delete from public.user_featured_medals where user_id = test_id;
  delete from public.user_achievements where user_id = test_id;
  delete from auth.users where id = test_id;
  delete from public.achievements where id in (achievement_id_1, achievement_id_2, achievement_id_3);

  return query select user_exists, medals_exist, 'test_completed';
end;
$$ language plpgsql security definer;
