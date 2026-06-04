-- 1. RPC: Update user's avatar if unlocked in inventory
create or replace function public.update_user_avatar(p_user_id uuid, p_reward_id uuid)
returns table(success boolean, message text) as $$
declare
  asset text;
begin
  -- Validate reward exists
  if not exists (select 1 from public.rewards where id = p_reward_id) then
    return query select false, 'reward_not_found';
    return;
  end if;

  -- Validate user has unlocked the reward
  if not exists (select 1 from public.user_rewards where user_id = p_user_id and reward_id = p_reward_id) then
    return query select false, 'reward_not_unlocked';
    return;
  end if;

  select asset_url into asset from public.rewards where id = p_reward_id;

  -- Upsert avatar record for the user using the reward asset
  insert into public.avatars (user_id, base_style, updated_at)
  values (p_user_id, asset, now())
  on conflict (user_id) do update set
    base_style = excluded.base_style,
    updated_at = now();

  return query select true, 'avatar_updated';
end;
$$ language plpgsql security definer;

-- 2. Test RPC: full flow for updating avatar
create or replace function public.test_update_user_avatar_flow()
returns table(created boolean, avatar_set boolean, message text) as $$
declare
  test_id uuid;
  test_email text;
  reward_id uuid;
  asset text := 'http://example.com/test-avatar.png';
  avatar_exists boolean := false;
  user_exists boolean := false;
begin
  -- Generate unique ids
  loop
    test_id := gen_random_uuid();
    exit when not exists (select 1 from auth.users where id = test_id);
  end loop;
  test_email := 'test_' || test_id || '@test.com';
  reward_id := gen_random_uuid();

  -- Create a reward representing an avatar
  insert into public.rewards (id, name, reward_type, asset_url)
  values (reward_id, 'Test Avatar Reward', 'AVATAR', asset)
  on conflict (id) do nothing;

  -- Insert into auth.users to simulate signup
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  values (test_id, test_email, jsonb_build_object('full_name','Test Avatar User'), now(), now());

  -- Link reward to user (unlock inventory)
  insert into public.user_rewards (id, user_id, reward_id, unlocked_at)
  values (gen_random_uuid(), test_id, reward_id, now())
  on conflict (user_id, reward_id) do nothing;

  -- Call the RPC that updates avatar
  PERFORM * FROM public.update_user_avatar(test_id, reward_id);

  -- Validate the avatar record was created/updated
  select exists(select 1 from public.users where id = test_id) into user_exists;
  select exists(select 1 from public.avatars where user_id = test_id and base_style = asset) into avatar_exists;

  -- Cleanup
  delete from public.avatars where user_id = test_id;
  delete from public.user_rewards where user_id = test_id;
  delete from auth.users where id = test_id;
  delete from public.rewards where id = reward_id;

  return query select user_exists, avatar_exists, 'test_completed';
end;
$$ language plpgsql security definer;
