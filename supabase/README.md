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
- `apps/web` consumes admin/auth/analytics/content contracts for the dashboard and admin views

There should not be a second backend owner under `apps/web` or `apps/mobile`.

## Reading order for a new contributor

1. `ARCHITECTURE.md`
2. `domains/README.md`
3. `contracts/README.md`
4. `config.toml`
5. `MIGRATION_INDEX.md`
6. `migrations/README.md`
7. `functions/README.md`
8. the concrete migration or function for the domain you are changing

## Directory structure

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

## Safety rules

- do not rename or rewrite already-applied migrations just for cleanliness
- do not rename deployed Edge Functions without coordinating clients and deployment
- prefer additive migrations over editing history
- document new backend contracts in the index files when they become part of app behavior