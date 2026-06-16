# Migration Guide

This directory is append-only in practice.

## Rules

- Existing migrations are historical record. Do not rename them for style.
- Prefer new migrations that correct or extend behavior.
- Keep names domain-first when adding new files.
- If a migration introduces a client-facing backend contract, add it to `../MIGRATION_INDEX.md`.

## Recommended ordering by intent

When reading the history, use this lens:

1. `ops` and `core` for baseline setup
2. `auth` for user lifecycle and access control
3. `education`, `recycling`, `gamification` for product domains
4. `analytics` for reporting/admin aggregates
5. `seed` for local/dev population

## Current notable areas

- Auth triggers contain multiple revisions from earlier iterations. Treat them as history, not cleanup targets.
- Analytics/admin support added in `20260612*` is the current bridge for the web dashboard.
- Education/admin RLS and user/role policies are part of the shared backend, not web-only logic.
