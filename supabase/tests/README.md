# Supabase SQL Tests

These tests validate the local backend structure after running migrations.

## contracts_smoke.sql

Validates static schema shape:

- required domain schemas exist
- public RPC wrappers still exist
- internal domain implementations exist
- authenticated can execute only public wrappers for critical functions
- core admin/content tables keep RLS enabled
- `auth.users` trigger points to the domain implementation in `app_auth`

```sh
bun run db:test:contracts
```

## rls_behavior.sql

Validates RLS policy behavior at runtime:

- anon role gets 0 rows (or privilege error) on policy-protected tables
- authenticated non-admin sees only `is_active = true` rows
- authenticated non-admin cannot INSERT into content tables (`fun_facts`, `waste_types`)
- authenticated non-admin UPDATE/DELETE on content tables is blocked by RLS
- tables with RLS but no policies (`recycling_records`, `user_profiles`, `user_settings`) deny all direct access — RPC-only

```sh
bun run db:test:rls
```

Both use the local Docker container created by `supabase start`.