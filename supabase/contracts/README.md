# Backend Contracts

This folder explains the backend from the point of view of the apps that consume it.

Use this after reading `../domains/README.md`.

## Documents

- `mobile.md` — backend contracts used by the mobile app and its client services
- `web-admin.md` — backend contracts used by the admin web app

## Why this exists

Supabase organizes implementation through migrations, SQL functions, policies and Edge Functions.

The apps do not think in those terms. They think in service contracts.

This folder bridges that gap so contributors can answer:
- which app consumes this backend contract?
- is it direct table CRUD, RPC or Edge Function?
- which domain owns it?
