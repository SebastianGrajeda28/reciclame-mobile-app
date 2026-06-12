# reciclame

Monorepo de Reciclame.

## Estructura

- pps/mobile: aplicacion movil Expo
- pps/web/frontend: aplicacion web administrativa
- supabase: backend centralizado, migraciones y funciones

## Instalacion

`sh
bun install
`

## Desarrollo

`sh
bun run mobile:dev
bun run web:dev
`

## Variables de entorno

- pps/mobile/.env para variables de la app movil
- pps/web/frontend/.env para variables de la app web
- supabase/ permanece como fuente de verdad del backend
