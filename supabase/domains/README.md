# Backend Domains

This folder groups the managed backend by service/domain ownership instead of by technical mechanism only.

Read this after:
1. `../ARCHITECTURE.md`
2. `../MIGRATION_INDEX.md`

Suggested reading order by product flow:
- `auth.md`
- `recycling.md`
- `points.md`
- `profile.md`
- `education.md`
- `admin.md`
- `analytics.md`

Important:
- migrations still execute from `../migrations/` in timestamp order
- these files are for comprehension, ownership and review
- tables still live mainly in `public`
- function implementation is now starting to move into domain schemas such as `app_auth`, `app_analytics`, `app_education` and `app_social`
- `public.*` RPC names remain the compatibility surface consumed by the apps