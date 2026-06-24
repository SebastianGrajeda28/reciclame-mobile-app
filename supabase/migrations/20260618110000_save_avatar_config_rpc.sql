-- Adds save_avatar_config RPC that validates cosmetic styles against user_rewards
-- before persisting avatar_config. Rejects the save if any style (hat, clothes,
-- hair, beard, moustache) is not present in the user's unlocked rewards.
-- Cosmetic style is the last segment of the compound "color_style" string.

CREATE OR REPLACE FUNCTION "public"."save_avatar_config"("p_user_id" "uuid", "p_config" "jsonb") RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  -- Style is always the LAST underscore-delimited segment of the compound "color_style" key.
  -- e.g. "black_leather_cowboy" → "cowboy", "red_doublet" → "doublet"
  hat_style       text := reverse(split_part(reverse(p_config->>'hat'),        '_', 1));
  clothes_style   text := reverse(split_part(reverse(p_config->>'clothes'),    '_', 1));
  hair_style      text := reverse(split_part(reverse(p_config->>'hair'),       '_', 1));
  beard_style     text := reverse(split_part(reverse(p_config->>'beard'),      '_', 1));
  moustache_style text := reverse(split_part(reverse(p_config->>'moustache'),  '_', 1));
  locked_items    text[] := '{}';
begin
  if (p_config->>'hat') is not null and hat_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'hat' and r.item_key = hat_style
    ) then
      locked_items := array_append(locked_items, 'hat:' || hat_style);
    end if;
  end if;

  if (p_config->>'clothes') is not null and clothes_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'clothes' and r.item_key = clothes_style
    ) then
      locked_items := array_append(locked_items, 'clothes:' || clothes_style);
    end if;
  end if;

  if (p_config->>'hair') is not null and hair_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'hair' and r.item_key = hair_style
    ) then
      locked_items := array_append(locked_items, 'hair:' || hair_style);
    end if;
  end if;

  if (p_config->>'beard') is not null and beard_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'beard' and r.item_key = beard_style
    ) then
      locked_items := array_append(locked_items, 'beard:' || beard_style);
    end if;
  end if;

  if (p_config->>'moustache') is not null and moustache_style <> '' then
    if not exists (
      select 1 from public.user_rewards ur
      join public.rewards r on r.id = ur.reward_id
      where ur.user_id = p_user_id and ur.is_active = true
        and r.item_type = 'moustache' and r.item_key = moustache_style
    ) then
      locked_items := array_append(locked_items, 'moustache:' || moustache_style);
    end if;
  end if;

  if array_length(locked_items, 1) > 0 then
    return query select false, 'cosmetics_not_unlocked:' || array_to_string(locked_items, ',');
    return;
  end if;

  insert into public.avatars (user_id, avatar_config, updated_at)
  values (p_user_id, p_config, now())
  on conflict (user_id) do update set
    avatar_config = excluded.avatar_config,
    updated_at    = now();

  return query select true, 'avatar_saved';
end;
$$;

GRANT EXECUTE ON FUNCTION public.save_avatar_config(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_avatar_config(uuid, jsonb) TO service_role;
