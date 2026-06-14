# admin-provision-user

## Type

Supabase Edge Function

## Owner domain

- `admin`
- depends on `auth`

## Responsibility

Create a new authenticated user and assign an initial application role.

## Why this is an Edge Function

This workflow needs:
- service role access
- Auth admin API access
- writes across `auth.users`, `public.users` and `public.user_roles`
- server-side authorization check for the caller

That makes it a privileged orchestration flow, not a client-side query or plain RPC.

## Current consumer

- admin web app (`AdminUserService` / create-user flow)

## Inputs

- `email`
- `password`
- `name`
- `roleName`

## Effects

1. validates caller auth
2. verifies caller has an active `ADMIN` role
3. creates auth user
4. upserts `public.users`
5. assigns role in `public.user_roles`
6. rolls back auth user creation if role lookup or assignment fails
