# Web Admin Contracts

This is the backend surface consumed by the admin web app.

## AdminAuthService

- Supabase Auth session lifecycle
- `public.get_current_account()` for account bootstrap
- admin role evaluation through RLS/policy helpers

## AdminContentService

Current content/admin contracts:
- direct CRUD on `fun_facts`
- direct CRUD on `instructions`
- direct CRUD on `instruction_steps`
- direct CRUD on `waste_types`
- direct CRUD / reads on `educational_content` where needed
- RLS helper: `public.is_current_user_admin()`

## AdminMetricsService

- `public.get_admin_dashboard(p_start, p_end)`
- reporting reads derived from recycling, user and session data

## AdminUserService

- direct admin CRUD on `users`
- direct admin CRUD on `roles`
- direct admin CRUD on `user_roles`
- Edge Function: `admin-provision-user`

## AdminSettingsService

- expected future ownership for admin-safe system configuration
- should be modeled as direct RLS-protected CRUD or admin RPCs, depending on sensitivity

## Notes

The web admin should not own a separate backend server.

Its backend options are only:
1. direct RLS-protected CRUD in Supabase
2. RPC/SQL functions
3. Edge Functions for privileged workflows
