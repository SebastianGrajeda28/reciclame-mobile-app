# Backend Consolidation Audit

## Current rehearsal status

- Root workspace install works with `bun install`.
- Root web build works with `bun run web:build`.
- Mobile code still validates from `apps/mobile`; current lint output is warnings only, no errors.
- The imported standalone web backend is no longer part of the runtime shape of the rehearsal.

## What moved into canonical Supabase ownership in this rehearsal

- dashboard aggregation
  - `supabase/migrations/20260612010000_analytics_admin_dashboard_rpc.sql`
  - consumed by the web app through `supabase.rpc("get_admin_dashboard")`
- current-account session lookup
  - `supabase/migrations/20260612013000_auth_current_account_rpc.sql`
  - consumed by the web app through `supabase.rpc("get_current_account")`
- privileged user provisioning
  - `supabase/functions/admin-provision-user/index.ts`
  - consumed by the web app through `supabase.functions.invoke("admin-provision-user")`
- admin content access
  - direct Supabase table access from the web app
  - guarded by RLS/policies introduced in `20260612021000_education_content_admin_policies.sql`
- admin user/role management
  - direct Supabase table access from the web app
  - guarded by RLS/policies introduced in `20260612022000_auth_admin_management_policies.sql`

## Additional schema alignment added in rehearsal

- `supabase/migrations/20260612020000_education_instruction_step_images.sql`
  - adds `image_url` to `instruction_steps` so the canonical schema matches the current web admin UI

## Why the imported web backend can now be removed

The web app no longer depends on:

- `/api/me`
- `/api/dashboard`
- `/api/users/provision`
- `/api/users`
- `/api/roles`
- `/api/user-roles`
- `/api/fun-facts`
- `/api/instructions`
- `/api/instruction-steps`
- `/api/waste-types`

That means the imported backend is preserved in git history but does not need to remain as a workspace or runtime service in the monorepo.

## Remaining cleanup after this rehearsal

- decide what to do with `VITE_BACKEND_URL_MEDIA` and the legacy login video source
- validate Supabase migrations and Edge Functions against a real local/remote Supabase environment before the real migration pass
- repeat the proven sequence on the real mobile repo migration branch

## Rehearsal validation evidence

- `bun install` at repo root: passes
- `bun run web:build` at repo root: passes
- `bun run --cwd apps/mobile lint`: passes with warnings only

