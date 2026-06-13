# Gamification Domain

## Client services

- `AchievementService`
- profile/progress surfaces in the mobile app

## Current backend ownership

### Tables in `public`
- `rewards`
- `achievements`
- `user_achievements`
- `user_rewards`
- `user_featured_medals`
- `user_progress`

### Functions
- `public.update_featured_medals(...)`
- `public.get_progress_with_decay(...)` from the streak heat work
- helper/test functions tied to rewards and medals

## Current source files

### Migrations
- `20260601001000_featured_medals.sql`
- `20260603000001_update_streak_heat_system.sql`
- `20260603000002_daily_heat_decay.sql`
- `20260603000003_rpc_get_progress_with_decay.sql`

## Problems today

- reward logic and progress logic are mixed across multiple migrations without a single ownership map
- side effects from recycling into streaks/achievements are implied rather than documented as a flow

## Target organization

For future contracts, prefer a `gamification` schema:
- `gamification.get_progress_with_decay(...)`
- `gamification.update_featured_medals(...)`
- `gamification.evaluate_achievements(...)`
