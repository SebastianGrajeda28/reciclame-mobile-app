# Admin Domain

## Client services

- `AdminAuthService`
- `AdminContentService`
- `AdminUserService`
- `AdminSettingsService`

## Current backend ownership

### Edge Functions
- `admin-provision-user`

### Shared dependencies
- `public.is_current_user_admin()`
- `users`
- `roles`
- `user_roles`
- content tables with admin policies
- Storage for privileged admin-managed assets in the target architecture

## Problems today

- admin responsibilities are partly in SQL policies and partly in the edge function, but not documented as one domain
- there is no explicit admin settings contract yet even though the implementation view expects one

## Target organization

- keep privileged orchestration in Edge Functions under `supabase/functions/`
- use an `admin` SQL schema later for admin-facing RPCs if needed
- document every admin contract as either:
  - direct RLS-protected CRUD
  - RPC
  - Edge Function

Current example:
- user provisioning is correctly an Edge Function, not a client query
