# Refactoring Report

## Estado anterior

- backend del web originalmente duplicado fuera de Supabase
- llamadas a Supabase dispersas en páginas y componentes del admin web
- sin `packages/` ni `docs/` centrales
- poca separación entre contrato público y organización interna del backend SQL

## Cambios aplicados

- monorepo con `apps/mobile`, `apps/admin-web`, `supabase/`, `packages/` y `docs/`
- consolidación del backend del web hacia Supabase
- extracción de auth, cuenta, provisionamiento y storage del admin web a servicios por dominio
- creación de `packages/database-types` y `packages/shared-domain`
- creación de `.env.example` por superficie relevante
- documentación base de arquitectura, autorización, base de datos, operaciones y onboarding
- migración aditiva `20260613010000_domain_function_schemas.sql` para empezar a separar implementación SQL por dominio sin romper RPC públicos
- migración aditiva `20260613020000_expand_domain_function_schemas.sql` para ampliar domains internos a admin, profile y gamification
- incorporación de `supabase/schemas/` como fuente declarativa legible por dominio
- configuración de `schema_paths` en `supabase/config.toml`
- script reproducible `scripts/generate-supabase-schemas.mjs` para regenerar la vista declarativa desde el dump base y las migraciones de domain schemas

## Validación ejecutada

- `bun install`
- `bun run admin-web:build`
- `bun run mobile:lint`
- `bunx supabase gen types typescript --local`
- `bun run db:test:contracts`
- `node scripts/generate-supabase-schemas.mjs`

## Pendientes

- revisar manualmente y refinar la granularidad de `supabase/schemas/*` cuando crezcan más contratos
- agregar pruebas de RLS y contratos críticos
- decidir si se reemplaza el script de bootstrap por una extracción más precisa desde un schema local ya reseteado

## Riesgos pendientes

- `schema.sql` sigue siendo un dump crudo de apoyo; si el remoto cambia mucho, conviene refrescarlo antes de regenerar `supabase/schemas/`
- algunas grants provenientes del dump son amplias y deben auditarse contra el modelo final de seguridad antes del corte real
- aún hay warnings de lint preexistentes en mobile, aunque sin errores
