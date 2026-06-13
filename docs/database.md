# Base de datos

El backend vive en `supabase/`.

Lectura recomendada:

1. `supabase/ARCHITECTURE.md`
2. `supabase/domains/README.md`
3. `supabase/contracts/README.md`
4. `supabase/MIGRATION_INDEX.md`

## Dominios principales

- auth
- profiles
- recycling
- education
- admin
- analytics
- gamification

## Principio de organización

Las migraciones existentes no se reescriben. La reorganización futura del backend se hace mediante migraciones aditivas.
