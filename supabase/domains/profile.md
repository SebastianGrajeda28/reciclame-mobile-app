# Profile Domain

## Client services

- `ProfileService`
- `HistoryService`
- avatar-related parts of `AchievementService`

## Current backend ownership

### Tables in `public`
- `user_profiles`
- `avatars`
- `user_featured_medals`
- `friend_codes`
- `friendships`

### Functions
- `public.update_user_avatar(...)`
- `public.get_friends_with_profile(...)`
- `public.get_my_friend_code()`

## Current source files

### Migrations
- `20260601000000_update_user_avatar_and_tests.sql`
- `20260606000000_get_friends_with_profile.sql`
- `20260607000001_add_avatar_config.sql`

## Problems today

- profile and social behavior are mixed with gamification naming in migration history
- avatar logic, friendship logic and profile aggregation are not grouped by ownership anywhere except filenames

## Target organization

For future contracts, prefer a `profile` schema:
- `profile.update_avatar(...)`
- `profile.get_friends_with_profile(...)`
- `profile.active_avatar_config_v`
