# Arquitectura

`reciclame` es un monorepo con dos aplicaciones cliente y un backend 100% Supabase.

- `apps/mobile`: app para estudiantes.
- `apps/web`: portal administrativo.
- `supabase/`: backend gestionado como código.
- `packages/database-types`: tipos compartidos de base de datos.
- `packages/shared-domain`: contratos compartidos livianos entre clientes.

## Criterio operativo

- CRUD simple y seguro: consultas directas con RLS.
- Reglas transaccionales y agregaciones: RPC / SQL functions.
- Operaciones sensibles o con secretos: Edge Functions.
- Autorización: RLS + grants.

La trazabilidad buscada es:

Pantalla -> hook/contexto -> servicio de feature -> query/RPC/Edge Function -> migración / función SQL / política.
