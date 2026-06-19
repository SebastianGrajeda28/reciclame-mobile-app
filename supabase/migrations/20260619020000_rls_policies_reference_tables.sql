-- RLS policies for reference/catalog tables that had RLS enabled without any policies.
-- Without policies, PostgreSQL denies all access to non-superuser roles by default.
-- These tables contain public catalog data that all authenticated users should read.

-- rewards: cosmetic catalog, freely readable
drop policy if exists "rewards_select_authenticated" on public.rewards;
create policy "rewards_select_authenticated"
  on public.rewards
  for select
  to authenticated
  using (is_active = true);

-- achievements: achievement catalog, freely readable
drop policy if exists "achievements_select_authenticated" on public.achievements;
create policy "achievements_select_authenticated"
  on public.achievements
  for select
  to authenticated
  using (is_active = true);

-- user_achievements: users read their own
drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own"
  on public.user_achievements
  for select
  to authenticated
  using (auth.uid() = user_id);

-- avatars: users read their own
drop policy if exists "avatars_select_own" on public.avatars;
create policy "avatars_select_own"
  on public.avatars
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "avatars_insert_own" on public.avatars;
create policy "avatars_insert_own"
  on public.avatars
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "avatars_update_own" on public.avatars;
create policy "avatars_update_own"
  on public.avatars
  for update
  to authenticated
  using (auth.uid() = user_id);

-- bin_types, campuses, universities, map_waste_type_bin_types: public reference data
drop policy if exists "bin_types_select_authenticated" on public.bin_types;
create policy "bin_types_select_authenticated"
  on public.bin_types
  for select
  to authenticated
  using (true);

drop policy if exists "campuses_select_authenticated" on public.campuses;
create policy "campuses_select_authenticated"
  on public.campuses
  for select
  to authenticated
  using (true);

drop policy if exists "universities_select_authenticated" on public.universities;
create policy "universities_select_authenticated"
  on public.universities
  for select
  to authenticated
  using (true);

drop policy if exists "map_waste_type_bin_types_select_authenticated" on public.map_waste_type_bin_types;
create policy "map_waste_type_bin_types_select_authenticated"
  on public.map_waste_type_bin_types
  for select
  to authenticated
  using (true);

-- user_profiles: users read all profiles (needed for social features), write own
drop policy if exists "user_profiles_select_authenticated" on public.user_profiles;
create policy "user_profiles_select_authenticated"
  on public.user_profiles
  for select
  to authenticated
  using (true);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = user_id);

-- user_progress: users read their own
drop policy if exists "user_progress_select_own" on public.user_progress;
create policy "user_progress_select_own"
  on public.user_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

-- user_settings: users manage their own
drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings
  for update
  to authenticated
  using (auth.uid() = user_id);

-- friend_codes: users read their own
drop policy if exists "friend_codes_select_own" on public.friend_codes;
create policy "friend_codes_select_own"
  on public.friend_codes
  for select
  to authenticated
  using (auth.uid() = user_id);

-- friendships: users read their own
drop policy if exists "friendships_select_own" on public.friendships;
create policy "friendships_select_own"
  on public.friendships
  for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- system_config: readable by all authenticated
drop policy if exists "system_config_select_authenticated" on public.system_config;
create policy "system_config_select_authenticated"
  on public.system_config
  for select
  to authenticated
  using (true);
