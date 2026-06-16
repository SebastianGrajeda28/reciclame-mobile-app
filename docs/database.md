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
2. `01_schemas.sql`
3. `10_reference_data.sql`
4. `20_identity_access.sql`
5. `30_profile.sql`
6. `35_social.sql`
7. `40_geo_infrastructure.sql`
8. `45_offline_sync.sql`
9. `50_recycling_flow.sql`
10. `60_education_content.sql`
11. `70_gamification.sql`
12. `80_admin_analytics.sql`
13. `95_permissions.sql`

## Regla operativa

- cada archivo mezcla tablas, índices, constraints, funciones públicas/internas y RLS del dominio dueño
- cada archivo también incluye los `GRANT` y `REVOKE` específicos del dominio
- wrappers RPC públicos viven junto al dominio que consumen
- implementación interna sigue en schemas `app_*`
- `95_permissions.sql` queda reservado para permisos realmente globales
- helpers SQL de prueba viven en `supabase/tests/`, no en `supabase/schemas/`
- seeds y DML quedan fuera de `schemas/`, dentro de migraciones o seeds explícitos
