# Declarative Backend Schemas

This directory is the readable backend source for future database changes.

Organization rule:

- each file is a domain slice, not just an object type slice
- tables, indexes, constraints, functions, RLS, and domain-specific grants live close to the domain that owns them
- only truly global permissions stay in `95_permissions.sql`
- SQL test helpers are excluded from declarative production schemas

Workflow:

1. Edit the domain SQL file that owns the behavior.
2. Generate an additive migration:
   `supabase db diff -f <change_name>`
3. Review the generated SQL under `supabase/migrations/`.
4. Apply locally with `supabase migration up` or `bun run db:reset`.

Rules:

- Keep `supabase/migrations/` as immutable history once applied.
- Prefer stable public wrappers for client-facing RPC names.
- Keep internal implementation functions in `app_*` schemas.
- Keep data seeds and test helpers out of these files.
