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

## Validación ejecutada

- `bun install`
- `bun run admin-web:build`
- `bun run mobile:lint`
- `bunx supabase gen types typescript --local`

## Pendientes

- terminar de mover más funciones SQL a schemas por dominio siguiendo el mismo patrón
- decidir si `apps/admin-web` se renombra a `apps/admin-web` en el corte real
- agregar pruebas de RLS y contratos críticos
- formatear y tipar mejor el paquete de tipos generado si se incorpora al flujo diario

## Riesgos pendientes

- la nueva migración SQL todavía debe probarse con `db reset` en la copia rehearsal antes del corte real
- el paquete `database-types` hoy contiene salida generada cruda; sirve, pero conviene normalizar su formato
- aún hay warnings de lint preexistentes en mobile, aunque sin errores