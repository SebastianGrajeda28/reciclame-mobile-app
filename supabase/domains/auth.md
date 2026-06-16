# Auth Domain

## Client services

- `AuthService`
- `AdminAuthService`

## Current backend ownership

### Tables in `public`
- `users`
- `roles`
- `user_roles`
- `user_profiles`
- `user_settings`

### Auth-linked functions and triggers
- `public.handle_new_user()`
- trigger `on_auth_user_created`
- `public.get_current_account()`

### Policies
- RLS on `users`
- RLS on `roles`
- RLS on `user_roles`
- helper `public.is_current_user_admin()` is also reused by admin/content access today

### Edge Functions
- `admin-provision-user` depends on Auth plus `users` plus `user_roles`

## Current source files

### Migrations
- `20260526005704_create_new_user_trigger.sql`
- `20260527184500_create_user_profile_trigger.sql`
- `20260528141600_trigger_handle_new_user.sql`
- `20260528150200_trigger_rpc_handle_new_user.sql`
- `20260612013000_auth_current_account_rpc.sql`
- `20260612022000_auth_admin_management_policies.sql`

## Problems today

- too many revisions of the same trigger flow
- admin helper logic is shared across auth and admin concerns but lives in `public`
- user lifecycle and role lifecycle are understandable only after reading multiple migrations

## Target organization

For new SQL contracts, prefer an `auth` schema for functions/views:
- `auth.get_current_account()`
- `auth.is_current_user_admin()`
- `auth.handle_new_user()` if migrated later

Keep base tables in `public` for now unless there is a deliberate migration plan.
