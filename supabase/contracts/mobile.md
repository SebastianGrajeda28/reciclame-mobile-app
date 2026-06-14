# Mobile Contracts

This is the backend surface consumed by the mobile app.

## AuthService

- Supabase Auth session lifecycle
- user/profile bootstrap via auth trigger flow
- `public.get_current_account()` is a reusable account lookup contract today

## RecyclingService

- `public.recycling_records`
- `public.recycling_sessions`
- related progress trigger behavior
- `waste_types` estimated weight support

## PointsService

- `public.recycling_points`
- `public.recycling_point_bins`
- `public.bin_types`
- `public.map_waste_type_bin_types`

## AchievementService

- `public.user_progress`
- `public.achievements`
- `public.user_achievements`
- `public.rewards`
- `public.user_rewards`
- `public.update_featured_medals(...)`
- progress/streak decay RPCs and helpers

## ProfileService

- `public.user_profiles`
- `public.avatars`
- `public.update_user_avatar(...)`
- `public.get_friends_with_profile(...)`

## HistoryService

- recycling record history tables and any future history RPCs/views

## SettingsService

- `public.user_settings`
- `public.system_config` where appropriate

## StorageService

- Supabase Storage for backend-managed assets

## Notes

The mobile app should prefer:
1. direct RLS-protected table access for simple reads/writes
2. RPC for reusable aggregates or multi-table read contracts
3. Edge Functions only for privileged or cross-service workflows
