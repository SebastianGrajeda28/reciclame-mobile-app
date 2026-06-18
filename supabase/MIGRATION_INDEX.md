# Migration Index

This file groups existing migrations by domain so contributors do not have to infer intent from timestamps alone.

## Current authoring model

- readable desired backend shape: `supabase/schemas/`
- immutable applied history: `supabase/migrations/`

New database work should start in `supabase/schemas/*` and then generate additive migrations with `supabase db diff -f <change_name>`.

## Ops

- `20240517000000_health_check.sql` — simple backend health check helper
- `20260522000002_clear_tables.sql` — maintenance/reset helper for local cleanup

## Core schema

- `20260522000001_create_tables.sql` — base application tables
- `20260522000003_create_rpc_count_tables.sql` — RPC/helper counts around base tables

## Auth and user lifecycle

- `20260526005704_create_new_user_trigger.sql` — new user trigger attempt
- `20260527184500_create_user_profile_trigger.sql` — profile creation trigger revision
- `20260528141600_trigger_handle_new_user.sql` — handle-new-user trigger revision
- `20260528150200_trigger_rpc_handle_new_user.sql` — trigger/RPC variant for new-user flow
- `20260612013000_auth_current_account_rpc.sql` — current-account RPC for authenticated clients
- `20260612022000_auth_admin_management_policies.sql` — RLS policies for users, roles and user_roles

## Seed data

- `20260528000000_seed_recycling_data.sql` — waste/recycling seed data
- `20260601000001_seed_recycling_point_bins.sql` — recycling point/bin seed data
- `20260602000000_update_recycling_bin_type_seed.sql` — seed update for recycling bin types

## Education content

- `20260601002000_educational_content.sql` — educational content tables and RPC helpers
- `20260612020000_education_instruction_step_images.sql` — support for instruction step image URLs
- `20260612021000_education_content_admin_policies.sql` — RLS policies for fun facts, instructions, steps and waste types

## Gamification and rewards

- `20260601000000_update_user_avatar_and_tests.sql` — avatar update flow and tests
- `20260601001000_featured_medals.sql` — featured medals logic
- `20260603000001_update_streak_heat_system.sql` — streak/heat system update
- `20260603000002_daily_heat_decay.sql` — daily heat decay logic
- `20260603000003_rpc_get_progress_with_decay.sql` — progress RPC with decay data
- `20260606000000_get_friends_with_profile.sql` — social/friends profile aggregate
- `20260607000001_add_avatar_config.sql` — avatar configuration additions
- `20260615000000_achievement_unlock_logic.sql` — initial achievement unlock RPC + trigger wiring
- `20260618000000_gamification_expand_achievement_conditions.sql` — 16 new condition types (bin type, waste type, location, social, manual detection); seeds 25 achievements; restores achievement check in progress trigger

## Recycling flow and progress

- `20260602131000_create_recycling_progress_trigger.sql` — progress trigger on recycling records
- `20260611000001_create_recycling_sessions.sql` — session tracking for recycling flow
- `20260611000002_add_estimated_weight_to_waste_types.sql` — estimated weights for waste types

## Analytics

- `20260612010000_analytics_admin_dashboard_rpc.sql` — centralized RPC for admin dashboard aggregates

## Edge Functions using this backend

- `functions/admin-provision-user` — privileged admin provisioning workflow backed by Auth plus database writes

## Notes on current disorder

There are clear revisions and overlapping attempts in the auth-trigger area. That history should not be rewritten during migration. Instead, new work should follow the domain naming convention from `README.md` and be documented here.

## Domain schema refactor

- 20260613010000_domain_function_schemas.sql — introduce first internal domain schemas with public wrappers
- 20260613020000_expand_domain_function_schemas.sql — expand internal domain schemas for admin, profile, gamification and auth trigger ownership
