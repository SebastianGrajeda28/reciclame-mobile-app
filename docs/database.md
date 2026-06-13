# Base de datos

El backend vive en `supabase/`.

Lectura recomendada:

1. `supabase/ARCHITECTURE.md`
2. `supabase/schemas/README.md`
3. `supabase/domains/README.md`
4. `supabase/contracts/README.md`
5. `supabase/MIGRATION_INDEX.md`

## Dominios principales

- auth
- profiles
- recycling
- education
- admin
- analytics
- gamification

## Principio de organización

Hay dos capas complementarias:

- `supabase/schemas/`: estado deseado y legible por dominio
- `supabase/migrations/`: historial aplicado e inmutable

Las migraciones existentes no se reescriben. Los cambios futuros parten de `supabase/schemas/` y se materializan con `supabase db diff`.

## Orden actual de schemas

1. `00_overview.sql`
2. `01_internal_schemas.sql`
3. `10_catalog.sql`
4. `20_profiles_social.sql`
5. `30_recycling_points.sql`
6. `40_recycling_flow.sql`
7. `50_education.sql`
8. `60_admin_analytics.sql`
9. `65_constraints.sql`
10. `70_functions_auth_admin.sql`
11. `71_functions_education.sql`
12. `72_functions_gamification.sql`
13. `73_functions_social.sql`
14. `74_functions_analytics.sql`
15. `80_rls_and_grants.sql`

## Regla operativa

- tablas y relaciones: en el archivo del dominio dueño
- wrappers RPC públicos: en el archivo de funciones del dominio
- implementación interna: en schemas `app_*`
- grants y RLS: concentrados en `80_rls_and_grants.sql`
- seeds y DML: fuera de `schemas/`, dentro de migraciones o seeds explícitos
