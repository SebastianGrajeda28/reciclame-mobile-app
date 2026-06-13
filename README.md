# reciclame

Monorepo de Recíclame con dos clientes y un backend 100% Supabase.

## Aplicaciones

- `apps/mobile`: app móvil para estudiantes
- `apps/admin-web`: portal web administrativo
- `supabase`: backend gestionado como código
- `packages/database-types`: tipos generados desde la base
- `packages/shared-domain`: contratos livianos compartidos entre clientes
- `docs`: arquitectura, base de datos, autorización y onboarding

## Comandos principales

```sh
bun install
bun run mobile:dev
bun run admin-web:dev
bun run db:start
bun run db:reset
bun run db:migrate
bun run db:types
```

## Variables de entorno

- `apps/mobile/.env`
- `apps/admin-web/.env`
- `supabase/functions/.env`

Usa los `.env.example` de cada superficie como punto de partida.

## Supabase local

```sh
bun run db:start
bun run db:status
bun run db:reset
bun run db:migrate
bun run db:types
bun run db:stop
```

Requiere Docker Desktop.

## Lectura recomendada`r`n`r`n1. `docs/architecture.md``r`n2. `docs/backend-logical-model.md``r`n3. `docs/database.md``r`n4. `docs/authorization.md``r`n5. `docs/backend-operations.md``r`n6. `docs/onboarding.md``r`n7. `supabase/README.md`