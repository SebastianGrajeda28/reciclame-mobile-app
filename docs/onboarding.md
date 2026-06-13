# Onboarding

## Requisitos

- Bun
- Docker Desktop
- Supabase CLI

## Flujo local

1. `bun install`
2. `bun run db:start`
3. copiar `apps/mobile/.env.example` o `apps/web/.env.example` según corresponda
4. `bun run mobile:dev` o `bun run web:dev`

## Cambios de base de datos

1. crear nueva migración en `supabase/migrations`
2. aplicar con `bun run db:reset` o `bun run db:migrate`
3. regenerar tipos con `bun run db:types`
