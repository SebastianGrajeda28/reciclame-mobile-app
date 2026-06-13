# Declarative Backend Schemas

This directory is the readable backend source for future database changes.

Workflow:

1. Edit the domain SQL files in this directory.
2. Generate an additive migration:
   `supabase db diff -f <change_name>`
3. Review the generated file under `supabase/migrations/`.
4. Apply locally with `supabase migration up` or `bun run db:reset`.

Rules:

- Keep `supabase/migrations/` as immutable history once applied.
- Use these files as the place where developers understand the desired backend shape.
- Prefer public wrappers for stable RPC names and internal `app_*` schemas for implementation logic.
- Keep data seeds out of these files. Declarative schema only covers DDL and related grants/RLS.
