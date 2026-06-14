# Supabase Architecture

This folder implements the managed backend described in the project architecture.

## Backend surface

### Auth

- Supabase Auth owns identity, sessions and access tokens.
- Auth-linked provisioning and account sync logic belongs to the `auth` domain.

### Database

- PostgreSQL is the source of truth.
- Tables, relations, triggers, RLS and RPC/SQL functions are versioned through `migrations/`.

### Access control

- Row Level Security is the primary enforcement layer.
- Admin-only behavior should be enforced in SQL policies and, when needed, re-checked in Edge Functions.

### Edge Functions

- Use Edge Functions for privileged orchestration that should not run in clients.
- Current example: admin user provisioning.

### Storage

- Storage-backed assets should be referenced from database records when they are backend-managed.
- Legacy app-local media dependencies should be phased out toward Storage or owned frontend assets.

## Client responsibilities

### Mobile

The mobile app should act as a client service layer over Supabase contracts for:

- auth
- recycling flow
- progress/gamification
- educational content
- profile/history

### Web admin

The web admin should act as a client over Supabase contracts for:

- auth/account lookup
- admin provisioning
- analytics dashboard RPCs
- educational content CRUD
- role-aware admin views

## Ownership rule

If a behavior is shared, privileged or security-sensitive, its source of truth belongs in Supabase, not in an app-local backend folder.


## Domain map

Read domains/README.md for the service/domain-oriented view of this backend.
