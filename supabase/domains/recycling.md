# Recycling Domain

## Client services

- `RecyclingService`
- `HistoryService`
- parts of `AchievementService`

## Current backend ownership

### Tables in `public`
- `waste_types`
- `recycling_records`
- `recycling_sessions`
- `pending_operations`
- `cached_resources`
- `user_progress`

### Triggers / functions
- recycling progress trigger migration
- estimated weight support on waste types

## Current source files

### Migrations
- `20260602131000_create_recycling_progress_trigger.sql`
- `20260611000001_create_recycling_sessions.sql`
- `20260611000002_add_estimated_weight_to_waste_types.sql`

## Problems today

- recycling flow is split between records, sessions and progress logic with no domain doc tying them together
- trigger behavior is hard to inspect from filenames only
- no explicit domain boundary between recycling flow and gamification side effects

## Target organization

For future SQL functions/views, prefer a `recycling` schema:
- `recycling.register_session_step(...)`
- `recycling.get_history_page(...)`
- `recycling.confirmed_records_v`

Keep product tables in `public` for now.
