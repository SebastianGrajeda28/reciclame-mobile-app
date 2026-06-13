# Supabase Backend Guide

This directory is the canonical backend surface for the monorepo.

## Architecture

Reciclame uses Supabase as a managed backend:

- Supabase Auth for identity and sessions
- PostgreSQL as the system of record
- Row Level Security for access control
- RPC / SQL functions for reusable backend contracts
- Edge Functions for privileged workflows that should not live in clients
- Storage for backend-managed assets and media

The apps are clients of this backend surface:

- `apps/mobile` consumes auth, content, recycling flow, progress and profile data
- `apps/admin-web` consumes admin/auth/analytics/content contracts for the dashboard and admin views

There should not be a second backend owner under `apps/admin-web` or `apps/mobile`.

## Reading order for a new contributor

1. `ARCHITECTURE.md`
2. `schemas/README.md`
3. `domains/README.md`
4. `contracts/README.md`
5. `config.toml`
6. `MIGRATION_INDEX.md`
7. `migrations/README.md`
8. `functions/README.md`
9. the concrete schema file or migration for the domain you are changing

## Directory structure

- `schemas/`: declarative desired backend shape by domain for future changes
- `domains/`: service/domain-oriented reading map
- `contracts/`: client-facing backend contracts by consumer
- `migrations/`: schema evolution, RLS, RPC/SQL functions, triggers and seed-related SQL
- `functions/`: Supabase Edge Functions only
- `snippets/`: scratch or local helper material that is not part of the deployed backend contract

## Function organization rule

The stable client-facing contracts stay in `public.*` for compatibility.
The implementation should progressively move to domain schemas such as:

- `app_auth`
- `app_analytics`
- `app_education`
- `app_social`

That gives us:

- stable RPC names for clients
- domain ownership inside the database
- additive migrations instead of rewriting history

## Naming convention for new migrations

Use:

`YYYYMMDDHHMMSS_<domain>_<intent>.sql`

Examples:

- `20260612010000_analytics_admin_dashboard_rpc.sql`
- `20260613010000_domain_function_schemas.sql`
- `20260614110000_education_fun_facts_crud_policies.sql`

## Declarative workflow from now on

The repo now has two complementary layers:

- `supabase/schemas/*`: readable desired state by domain
- `supabase/migrations/*`: immutable applied history

Recommended flow for new database work:

1. edit the relevant file in `supabase/schemas/`
2. generate a migration with `bun run db:diff -- -f <change_name>`
3. review the generated SQL under `supabase/migrations/`
4. apply locally with `supabase migration up` or `bun run db:reset`
5. regenerate database types with `bun run db:types`

`supabase/schema.sql` is only a raw dump snapshot used to bootstrap or refresh the declarative files. It is not the place where future manual edits should happen.

## Safety rules

- do not rename or rewrite already-applied migrations just for cleanliness
- do not rename deployed Edge Functions without coordinating clients and deployment
- prefer additive migrations over editing history
- document new backend contracts in the index files when they become part of app behavior
## Local contract verification

Run `bun run db:test:contracts` after `bun run db:reset` to verify that the local backend structure still matches the logical model.
