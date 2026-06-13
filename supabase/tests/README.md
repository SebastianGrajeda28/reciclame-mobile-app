# Supabase SQL Smoke Tests

These tests validate the local backend structure after running migrations.

## Current coverage

- required domain schemas exist
- public RPC wrappers still exist
- internal domain implementations exist
- authenticated can execute only public wrappers for critical functions
- core admin/content tables keep RLS enabled
- `auth.users` trigger points to the domain implementation in `app_auth`

## Run

From repo root:

```sh
bun run db:test:contracts
```

This uses the local Docker container created by `supabase start`.