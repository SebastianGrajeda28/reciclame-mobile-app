# Onboarding

## Requisitos

- Bun
- Docker Desktop
- Supabase CLI

## Flujo local

1. `bun install`
2. `bun run db:start`
3. `bun run db:reset`
4. copiar `apps/mobile/.env.example` o `apps/admin-web/.env.example` según corresponda
5. `bun run mobile:dev` o `bun run admin-web:dev`

## Cambios de base de datos

1. ubicar el dominio correcto en `supabase/schemas/`
2. editar el SQL declarativo de ese dominio
3. generar migración con `bun run db:diff -- -f <nombre_del_cambio>`
4. revisar el SQL generado en `supabase/migrations/`
5. aplicar con `supabase migration up` o validar con `bun run db:reset`
6. correr `bun run db:test:contracts`
7. regenerar tipos con `bun run db:types`

## Si partes de un dump remoto

1. exportar o actualizar `supabase/schema.sql`
2. regenerar la vista declarativa con `bun run db:schemas:refresh`
3. revisar manualmente los archivos bajo `supabase/schemas/`

`supabase/schema.sql` es snapshot crudo, no fuente primaria de edición.
